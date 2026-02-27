// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

function getOrgId() {
  const orgId = process.env.RC_ORG_ID;
  return orgId || null;
}

function toCents(n: number | null | undefined) {
  return typeof n === "number" ? n : 0;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      {
        error: `Webhook signature verification failed: ${
          err?.message || "Invalid signature"
        }`,
      },
      { status: 400 }
    );
  }

  try {
    const orgId = getOrgId();

    switch (event.type) {
      case "checkout.session.completed": {
        const sessionLite = event.data.object as Stripe.Checkout.Session;

        // Retrieve a fully-expanded session we can trust for persistence
        const session = await stripe.checkout.sessions.retrieve(sessionLite.id, {
          expand: ["line_items.data.price.product", "payment_intent", "customer"],
        });

        if (!orgId) {
          console.warn("[stripe-webhook] RC_ORG_ID missing; skipping DB write", {
            session: session.id,
          });
          break;
        }

        const email = session.customer_details?.email ?? null;
        const name = session.customer_details?.name ?? null;

        // Customer upsert (optional)
        let customerId: string | null = null;
        if (email) {
          const { data: existingCustomer } = await supabaseAdmin
            .from("customers")
            .select("id")
            .eq("org_id", orgId)
            .eq("email", email)
            .maybeSingle();

          if (existingCustomer?.id) {
            customerId = existingCustomer.id;
          } else {
            const { data: inserted, error } = await supabaseAdmin
              .from("customers")
              .insert({
                org_id: orgId,
                email,
                name,
                stripe_customer_id:
                  typeof session.customer === "string"
                    ? session.customer
                    : session.customer?.id ?? null,
              })
              .select("id")
              .single();

            if (!error) customerId = inserted.id;
          }
        }

        // Address snapshot
        const addr =
          session.shipping_details?.address || session.customer_details?.address;

        const shipTo = addr
          ? {
              name:
                session.shipping_details?.name ??
                session.customer_details?.name ??
                null,
              address1: addr.line1 ?? null,
              address2: addr.line2 ?? null,
              city: addr.city ?? null,
              state: addr.state ?? null,
              postal: addr.postal_code ?? null,
              country: addr.country ?? null,
            }
          : null;

        // Amounts
        const currency = (session.currency ?? "usd").toLowerCase();
        const subtotal = toCents(session.amount_subtotal);
        const total = toCents(session.amount_total);

        // Shipping charged (best-effort)
        // Some Stripe setups don’t expose a clean number here; you can also store this from your own checkout calc.
        const shippingCharged = 0;

        // Determine Stripe fee (via latest_charge -> charge.balance_transaction)
        let feeCents = 0;
        let chargeId: string | null = null;
        let balanceTxnId: string | null = null;

        const pi =
          (session.payment_intent as Stripe.PaymentIntent | string | null) ??
          null;

        if (pi && typeof pi !== "string") {
          const latestCharge = pi.latest_charge;

          if (latestCharge) {
            const latestChargeId =
              typeof latestCharge === "string" ? latestCharge : latestCharge.id;

            const charge = await stripe.charges.retrieve(latestChargeId, {
              expand: ["balance_transaction"],
            });

            chargeId = charge.id;

            const bal = charge.balance_transaction;
            if (bal && typeof bal !== "string") {
              feeCents = bal.fee ?? 0;
              balanceTxnId = bal.id;
            } else if (typeof bal === "string") {
              balanceTxnId = bal;
            }
          }
        }

        // Upsert order keyed by checkout session id
        const placedAt = new Date().toISOString();

        const { data: orderRow, error: orderErr } = await supabaseAdmin
          .from("orders")
          .upsert(
            {
              org_id: orgId,
              customer_id: customerId,
              customer_email: email,
              customer_name: name,
              ship_to: shipTo,
              status: "paid",
              currency,
              subtotal_cents: subtotal,
              discount_cents: 0,
              tax_cents: 0,
              shipping_charged_cents: shippingCharged,
              total_cents: total,
              stripe_checkout_session_id: session.id,
              stripe_payment_intent_id:
                typeof session.payment_intent === "string"
                  ? session.payment_intent
                  : session.payment_intent?.id ?? null,
              placed_at: placedAt,
            },
            { onConflict: "stripe_checkout_session_id" }
          )
          .select("id")
          .single();

        if (orderErr || !orderRow?.id) {
          console.error("[stripe-webhook] order upsert failed", orderErr);
          break;
        }

        const orderId = orderRow.id as string;

        // Replace line items for idempotency
        await supabaseAdmin.from("order_items").delete().eq("order_id", orderId);

        const lineItems = session.line_items?.data ?? [];
        if (lineItems.length) {
          const itemsToInsert = lineItems.map((li) => {
            const product =
              (li.price?.product as Stripe.Product | string | null) ?? null;

            return {
              org_id: orgId,
              order_id: orderId,
              product_id: null, // map later if you want product linking by SKU
              name:
                (typeof product !== "string" && product?.name) ||
                li.description ||
                "Item",
              sku:
                (typeof product !== "string" && (product as any)?.metadata?.sku) ||
                (li.price as any)?.metadata?.sku ||
                null,
              quantity: li.quantity ?? 1,
              unit_price_cents: li.price?.unit_amount ?? 0,
              unit_cost_cents: 0, // admin can edit later; or auto-fill from products.default_unit_cost_cents
              packaging_cost_cents: 0,
            };
          });

          const { error: itemsErr } = await supabaseAdmin
            .from("order_items")
            .insert(itemsToInsert);

          if (itemsErr) {
            console.error("[stripe-webhook] order_items insert failed", itemsErr);
          }
        }

        // Upsert payment row (fee may be 0 if Stripe fee unavailable)
        if (total > 0) {
          const net = Math.max(0, total - feeCents);

          // NOTE: if chargeId is null, this becomes just a plain insert without a stable conflict target.
          // That’s okay for now; once you confirm latest_charge exists for your flow, it’ll be stable.
          if (chargeId) {
            await supabaseAdmin.from("payments").upsert(
              {
                org_id: orgId,
                order_id: orderId,
                status: "succeeded",
                provider: "stripe",
                amount_cents: total,
                fee_cents: feeCents,
                net_cents: net,
                currency,
                stripe_charge_id: chargeId,
                stripe_balance_txn_id: balanceTxnId,
              },
              { onConflict: "stripe_charge_id" }
            );
          } else {
            await supabaseAdmin.from("payments").insert({
              org_id: orgId,
              order_id: orderId,
              status: "succeeded",
              provider: "stripe",
              amount_cents: total,
              fee_cents: feeCents,
              net_cents: net,
              currency,
              stripe_charge_id: null,
              stripe_balance_txn_id: balanceTxnId,
            });
          }
        }

        console.log("[stripe-webhook] persisted order", {
          orgId,
          orderId,
          sessionId: session.id,
          total,
          feeCents,
          chargeId,
        });

        break;
      }

      case "refund.updated": {
        const refund = event.data.object as Stripe.Refund;

        if (!orgId) break;

        const chargeId = typeof refund.charge === "string" ? refund.charge : null;
        if (!chargeId) break;

        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("order_id")
          .eq("org_id", orgId)
          .eq("stripe_charge_id", chargeId)
          .maybeSingle();

        if (!payment?.order_id) break;

        await supabaseAdmin.from("refunds").upsert(
          {
            org_id: orgId,
            order_id: payment.order_id,
            amount_cents: refund.amount ?? 0,
            stripe_refund_id: refund.id,
          },
          { onConflict: "stripe_refund_id" }
        );

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[stripe-webhook] handler failed:", err?.message || err);
    // ACK anyway to avoid retry storms; you can replay events from Stripe if needed
    return NextResponse.json({ received: true });
  }
}