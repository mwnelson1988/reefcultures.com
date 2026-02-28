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

function mapOrderStatusFromSession(session: Stripe.Checkout.Session) {
  // Stripe: "paid" | "unpaid" | "no_payment_required"
  const ps = (session.payment_status || "").toLowerCase();
  if (ps === "paid") return "paid";
  if (ps === "unpaid") return "unpaid";
  if (ps === "no_payment_required") return "no_payment_required";
  return ps || "unknown";
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

  // ✅ MUST be raw text for signature verification
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
          expand: [
            "line_items.data.price.product",
            "payment_intent.latest_charge.balance_transaction",
            "customer",
          ],
        });

        // ✅ Link order back to your signed-in Supabase user
        const userId =
          session.client_reference_id ??
          session.metadata?.user_id ??
          null;

        if (!orgId) {
          console.warn("[stripe-webhook] RC_ORG_ID missing; skipping DB write", {
            session: session.id,
          });
          break;
        }

        const email = session.customer_details?.email ?? null;
        const name = session.customer_details?.name ?? null;

        // ---------------------------
        // Customer upsert (optional)
        // ---------------------------
        let customerId: string | null = null;

        if (email) {
          // Prefer upsert if you have a unique constraint on (org_id, email)
          const stripeCustomerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? null;

          const { data: upserted, error: upsertErr } = await supabaseAdmin
            .from("customers")
            .upsert(
              {
                org_id: orgId,
                email,
                name,
                stripe_customer_id: stripeCustomerId,
              },
              { onConflict: "org_id,email" }
            )
            .select("id")
            .single();

          if (!upsertErr && upserted?.id) {
            customerId = upserted.id;
          } else {
            // Fallback: attempt lookup
            const { data: existingCustomer } = await supabaseAdmin
              .from("customers")
              .select("id")
              .eq("org_id", orgId)
              .eq("email", email)
              .maybeSingle();

            customerId = existingCustomer?.id ?? null;
          }
        }

        // ---------------------------
        // Address snapshot
        // ---------------------------
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

        // ---------------------------
        // Amounts
        // ---------------------------
        const currency = (session.currency ?? "usd").toLowerCase();
        const subtotal = toCents(session.amount_subtotal);
        const total = toCents(session.amount_total);

        const shippingCharged = toCents(session.total_details?.amount_shipping);
        const taxCents = toCents(session.total_details?.amount_tax);
        const discountCents = toCents(session.total_details?.amount_discount);

        const status = mapOrderStatusFromSession(session);

        // ---------------------------
        // Fees (Stripe balance transaction)
        // ---------------------------
        let feeCents = 0;
        let chargeId: string | null = null;
        let balanceTxnId: string | null = null;

        const pi =
          (session.payment_intent as Stripe.PaymentIntent | string | null) ??
          null;

        if (pi && typeof pi !== "string") {
          const latestCharge = pi.latest_charge;

          if (latestCharge && typeof latestCharge !== "string") {
            chargeId = latestCharge.id;

            const bal = latestCharge.balance_transaction;
            if (bal && typeof bal !== "string") {
              feeCents = bal.fee ?? 0;
              balanceTxnId = bal.id;
            } else if (typeof bal === "string") {
              balanceTxnId = bal;
            }
          } else if (typeof latestCharge === "string") {
            // If not expanded as object, still capture ids
            chargeId = latestCharge;
          }
        }

        // ---------------------------
        // Order upsert (idempotent)
        // ---------------------------
        const placedAt = new Date().toISOString();

        const { data: orderRow, error: orderErr } = await supabaseAdmin
          .from("orders")
          .upsert(
            {
              org_id: orgId,

              // ✅ link to app user (enables dashboard ownership / filtering)
              user_id: userId,

              customer_id: customerId,
              customer_email: email,
              customer_name: name,
              ship_to: shipTo,

              status,
              currency,
              subtotal_cents: subtotal,
              discount_cents: discountCents,
              tax_cents: taxCents,
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
          // Return 500 so Stripe retries (prevents lost orders)
          return NextResponse.json({ error: "order_upsert_failed" }, { status: 500 });
        }

        const orderId = orderRow.id as string;

        // ---------------------------
        // Replace line items (idempotent)
        // ---------------------------
        const delRes = await supabaseAdmin
          .from("order_items")
          .delete()
          .eq("order_id", orderId);

        if (delRes.error) {
          console.error("[stripe-webhook] order_items delete failed", delRes.error);
          return NextResponse.json({ error: "order_items_delete_failed" }, { status: 500 });
        }

        const lineItems = session.line_items?.data ?? [];
        if (lineItems.length) {
          const itemsToInsert = lineItems.map((li) => {
            const product =
              (li.price?.product as Stripe.Product | string | null) ?? null;

            const productName =
              (typeof product !== "string" && product?.name) ||
              li.description ||
              "Item";

            const sku =
              (typeof product !== "string" && (product as any)?.metadata?.sku) ||
              (li.price as any)?.metadata?.sku ||
              null;

            return {
              org_id: orgId,
              order_id: orderId,
              product_id: null,
              name: productName,
              sku,
              quantity: li.quantity ?? 1,
              unit_price_cents: li.price?.unit_amount ?? 0,
              unit_cost_cents: 0,
              packaging_cost_cents: 0,
            };
          });

          const { error: itemsErr } = await supabaseAdmin
            .from("order_items")
            .insert(itemsToInsert);

          if (itemsErr) {
            console.error("[stripe-webhook] order_items insert failed", itemsErr);
            return NextResponse.json({ error: "order_items_insert_failed" }, { status: 500 });
          }
        }

        // ---------------------------
        // Upsert payment row
        // ---------------------------
        if (total > 0) {
          const net = Math.max(0, total - feeCents);

          if (chargeId) {
            const { error: payErr } = await supabaseAdmin.from("payments").upsert(
              {
                org_id: orgId,
                order_id: orderId,
                status: status === "paid" ? "succeeded" : status,
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

            if (payErr) {
              console.error("[stripe-webhook] payments upsert failed", payErr);
              return NextResponse.json({ error: "payments_upsert_failed" }, { status: 500 });
            }
          } else {
            const { error: payInsErr } = await supabaseAdmin.from("payments").insert({
              org_id: orgId,
              order_id: orderId,
              status: status === "paid" ? "succeeded" : status,
              provider: "stripe",
              amount_cents: total,
              fee_cents: feeCents,
              net_cents: net,
              currency,
              stripe_charge_id: null,
              stripe_balance_txn_id: balanceTxnId,
            });

            if (payInsErr) {
              console.error("[stripe-webhook] payments insert failed", payInsErr);
              return NextResponse.json({ error: "payments_insert_failed" }, { status: 500 });
            }
          }
        }

        console.log("[stripe-webhook] persisted order", {
          orgId,
          orderId,
          sessionId: session.id,
          userId,
          total,
          feeCents,
          chargeId,
        });

        break;
      }

      case "refund.updated": {
        const refund = event.data.object as Stripe.Refund;

        const orgId = getOrgId();
        if (!orgId) break;

        const chargeId =
          typeof refund.charge === "string" ? refund.charge : null;
        if (!chargeId) break;

        const { data: payment } = await supabaseAdmin
          .from("payments")
          .select("order_id")
          .eq("org_id", orgId)
          .eq("stripe_charge_id", chargeId)
          .maybeSingle();

        if (!payment?.order_id) break;

        const { error: refundErr } = await supabaseAdmin.from("refunds").upsert(
          {
            org_id: orgId,
            order_id: payment.order_id,
            amount_cents: refund.amount ?? 0,
            stripe_refund_id: refund.id,
          },
          { onConflict: "stripe_refund_id" }
        );

        if (refundErr) {
          console.error("[stripe-webhook] refunds upsert failed", refundErr);
          return NextResponse.json({ error: "refunds_upsert_failed" }, { status: 500 });
        }

        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[stripe-webhook] handler failed:", err?.message || err);
    // ✅ Return 500 so Stripe retries instead of silently losing the order
    return NextResponse.json({ error: "webhook_handler_failed" }, { status: 500 });
  }
}