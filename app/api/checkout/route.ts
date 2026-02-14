import { NextResponse } from "next/server";
import Stripe from "stripe";
import { products } from "@/lib/store/products";

export async function POST(request: Request) {
  const form = await request.formData();
  const productId = String(form.get("productId") ?? "");
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return NextResponse.json({ error: "Invalid product." }, { status: 400 });
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_SECRET_KEY env var. Add it in Hostinger / local .env.local." },
      { status: 500 }
    );
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${baseUrl}/store?success=1`,
    cancel_url: `${baseUrl}/store?canceled=1`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: product.priceCents,
        },
      },
    ],
  });

  return NextResponse.redirect(session.url!, 303);
}
