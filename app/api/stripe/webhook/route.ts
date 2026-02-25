import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const body = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err?.message ?? "unknown"}` },
      { status: 400 }
    );
  }

  // TODO: Persist to Supabase (orders/subscriptions) after you confirm schema.
  // event.type examples: checkout.session.completed, payment_intent.succeeded

  return NextResponse.json({ received: true });
}
