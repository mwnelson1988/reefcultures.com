import { NextResponse } from "next/server";
import Stripe from "stripe";
import { mustGetEnv } from "@/lib/env";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"));

function priceIdForSlug(slug: string) {
  const s = slug.toLowerCase();

  // Accept a few variations so we don't break if the slug changes slightly
  if (s.includes("16") || s.includes("16oz")) return mustGetEnv("STRIPE_PRICE_PHYTO_16OZ");
  if (s.includes("32") || s.includes("32oz")) return mustGetEnv("STRIPE_PRICE_PHYTO_32OZ");

  // If you add more products later, extend mapping here.
  throw new Error(`Unknown product slug: ${slug}`);
}

function originFromReq(req: Request) {
  // Next/Node request won't always have origin in local dev, so be defensive.
  const origin = req.headers.get("origin");
  if (origin) return origin;

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;

  return "http://localhost:3000";
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const slug = body?.slug as string | undefined;

    if (!slug) {
      return NextResponse.json({ error: "Missing 'slug' in request body." }, { status: 400 });
    }

    const price = priceIdForSlug(slug);
    const origin = originFromReq(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/store?success=1`,
      cancel_url: `${origin}/store?canceled=1`,
      metadata: { slug },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    const message =
      err?.raw?.message ||
      err?.message ||
      "Checkout error (unknown).";

    const status = typeof err?.statusCode === "number" ? err.statusCode : 500;

    return NextResponse.json(
      { error: message, type: err?.type, code: err?.code, param: err?.param },
      { status }
    );
  }
}