// app/api/stripe-webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Stripe webhooks need the raw request body.
 * In Next.js App Router, req.text() gives you the raw string.
 */
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
    switch (event.type) {
      case "checkout.session.completed": {
        const sessionLite = event.data.object as Stripe.Checkout.Session;

        // Pull a fully-expanded session (line items, customer details, payment intent)
        const session = await stripe.checkout.sessions.retrieve(sessionLite.id, {
          expand: ["line_items", "customer", "payment_intent", "shipping_cost"],
        });

        // If you later want to persist orders/subscriptions, this is the reliable place.
        // For now we keep this handler resilient (never throwing) so Stripe doesn't spam retries.
        console.log("[stripe-webhook] checkout.session.completed", {
          id: session.id,
          mode: session.mode,
          amount_total: session.amount_total,
          currency: session.currency,
          customer: session.customer,
          email: session.customer_details?.email,
          lookupKey: (session.metadata as any)?.lookupKey,
          quote_key: (session.metadata as any)?.quote_key,
          selected_rate_id: (session.metadata as any)?.selected_rate_id,
        });

        // Optional: if you ever include a user_id in metadata, we can update your Supabase tables.
        // This will not break if the table doesn't exist — it will just log.
        const userId = (session.metadata as any)?.user_id as string | undefined;
        if (userId) {
          try {
            const sb = supabaseAdmin();

            // Example: mark latest subscription row (if your schema matches)
            if (session.mode === "subscription" && session.subscription) {
              await sb.from("subscriptions").upsert(
                {
                  user_id: userId,
                  stripe_subscription_id: String(session.subscription),
                  status: "active",
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "stripe_subscription_id" }
              );
            }
          } catch (e: any) {
            console.error("[stripe-webhook] supabase write skipped/failed:", e?.message || e);
          }
        }

        break;
      }

      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log("[stripe-webhook] payment_intent.succeeded", {
          id: pi.id,
          amount: pi.amount,
          currency: pi.currency,
          metadata: pi.metadata,
        });
        break;
      }

      default: {
        // Keep quiet for other events
        break;
      }
    }

    // Acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[stripe-webhook] handler failed:", err?.message || err);
    return NextResponse.json(
      { error: err?.message || "Webhook handler failed" },
      { status: 500 }
    );
  }
}
