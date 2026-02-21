import Stripe from "stripe";
import { NextResponse } from "next/server";

// Webhooks need the raw request body.
async function getRawBody(req: Request) {
  const arrayBuffer = await req.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY env var." },
      { status: 500 }
    );
  }
  if (!webhookSecret) {
    return NextResponse.json(
      {
        error:
          "Missing STRIPE_WEBHOOK_SECRET env var. Add the webhook signing secret (whsec_...) from Stripe.",
      },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json(
      { error: "Missing Stripe signature header." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });
  const rawBody = await getRawBody(req);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err?.message ?? "unknown"}` },
      { status: 400 }
    );
  }

  // Minimal, safe handler. You can expand this later to:
  // - store orders in your DB
  // - send confirmation emails
  // - decrement inventory
  switch (event.type) {
    case "checkout.session.completed": {
      // const session = event.data.object as Stripe.Checkout.Session;
      // console.log("Checkout completed", session.id);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
