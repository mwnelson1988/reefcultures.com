import { NextResponse } from "next/server";
import Stripe from "stripe";
import { mustGetEnv } from "@/lib/env";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"));

const FREE_SHIPPING_THRESHOLD_CENTS = 5000;
const STANDARD_SHIPPING_CENTS = 1200;

type ProductConfig = {
  slug: string;
  name: string;
  unitAmountCents: number;
  priceId: string;
};

function assertStripePriceId(value: string, envName: string) {
  if (!value) throw new Error(`Missing environment variable: ${envName}`);
  if (!value.startsWith("price_")) {
    throw new Error(
      `Invalid Stripe Price ID in ${envName}. Expected "price_...". Got: ${value}`
    );
  }
  return value;
}

function normalizeSlug(slug: string) {
  return String(slug || "")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");
}

function clampQuantity(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(24, Math.round(n)));
}

function getProductConfig(slug: string): ProductConfig {
  const s = normalizeSlug(slug);

  const is16 =
    s === "phyto-16oz" ||
    s === "phyto16oz" ||
    s === "phyto-16" ||
    s === "16oz" ||
    s === "16";

  const is32 =
    s === "phyto-32oz" ||
    s === "phyto32oz" ||
    s === "phyto-32" ||
    s === "32oz" ||
    s === "32";

  const is64 =
    s === "phyto-64oz" ||
    s === "phyto64oz" ||
    s === "phyto-64" ||
    s === "64oz" ||
    s === "64";

  if (is16) {
    return {
      slug: "phyto-16oz",
      name: "Reef Cultures 16oz Phyto",
      unitAmountCents: 1999,
      priceId: assertStripePriceId(
        mustGetEnv("STRIPE_PRICE_PHYTO_16OZ"),
        "STRIPE_PRICE_PHYTO_16OZ"
      ),
    };
  }

  if (is32) {
    return {
      slug: "phyto-32oz",
      name: "Reef Cultures 32oz Phyto",
      unitAmountCents: 2799,
      priceId: assertStripePriceId(
        mustGetEnv("STRIPE_PRICE_PHYTO_32OZ"),
        "STRIPE_PRICE_PHYTO_32OZ"
      ),
    };
  }

  if (is64) {
    return {
      slug: "phyto-64oz",
      name: "Reef Cultures 64oz Phyto",
      unitAmountCents: 4499,
      priceId: assertStripePriceId(
        mustGetEnv("STRIPE_PRICE_PHYTO_64OZ"),
        "STRIPE_PRICE_PHYTO_64OZ"
      ),
    };
  }

  throw new Error(`Unknown product slug: ${slug}`);
}

function originFromReq(req: Request) {
  const origin = req.headers.get("origin");
  if (origin) return origin;

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;

  return "http://localhost:3000";
}

async function getSignedInUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
    mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return { user, error };
}

function shippingCentsForSubtotal(subtotalCents: number) {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : STANDARD_SHIPPING_CENTS;
}

function buildLineItems(slug: string, quantity: number): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const product = getProductConfig(slug);
  const subtotalCents = product.unitAmountCents * quantity;
  const shippingCents = shippingCentsForSubtotal(subtotalCents);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: product.priceId,
      quantity,
    },
  ];

  if (shippingCents > 0) {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Shipping",
          description: "Cold-chain shipping",
        },
        unit_amount: shippingCents,
      },
      quantity: 1,
    });
  }

  return lineItems;
}

function buildMetadata(slug: string, quantity: number, userId: string | undefined, guest: boolean) {
  const product = getProductConfig(slug);
  const subtotalCents = product.unitAmountCents * quantity;
  const shippingCents = shippingCentsForSubtotal(subtotalCents);

  return {
    slug: product.slug,
    quantity: String(quantity),
    user_id: userId ?? "guest",
    guest: guest ? "1" : "0",
    subtotal_cents: String(subtotalCents),
    shipping_cents: String(shippingCents),
    free_shipping_threshold_cents: String(FREE_SHIPPING_THRESHOLD_CENTS),
    shipping_rule: shippingCents > 0 ? "under_50_flat_12" : "free_over_50",
  };
}

async function parseIncomingRequest(req: Request) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    return {
      slug: String(body?.slug || body?.productId || ""),
      guest: Boolean(body?.guest),
      quantity: clampQuantity(body?.quantity),
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    return {
      slug: String(form.get("slug") || form.get("productId") || ""),
      guest: String(form.get("guest") || "") === "1",
      quantity: clampQuantity(form.get("quantity")),
    };
  }

  return { slug: "", guest: false, quantity: 1 };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || "";
    const guest = url.searchParams.get("guest") === "1";
    const quantity = clampQuantity(url.searchParams.get("quantity") || 1);

    if (!slug) {
      return NextResponse.redirect(
        new URL("/store?error=missing_slug", originFromReq(req)),
        303
      );
    }

    const origin = originFromReq(req);

    let userId: string | undefined;
    let email: string | undefined;

    if (!guest) {
      const { user, error } = await getSignedInUser();
      if (error) {
        return NextResponse.redirect(new URL("/login", origin), 303);
      }
      if (!user) {
        const next = `/api/checkout?slug=${encodeURIComponent(slug)}&quantity=${quantity}`;
        return NextResponse.redirect(
          new URL(`/login?next=${encodeURIComponent(next)}`, origin),
          303
        );
      }
      userId = user.id;
      email = user.email ?? undefined;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: buildLineItems(slug, quantity),
      allow_promotion_codes: true,
      customer_email: email,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      success_url: `${origin}/store?success=1`,
      cancel_url: `${origin}/store?canceled=1`,
      client_reference_id: userId,
      metadata: buildMetadata(slug, quantity, userId, guest),
    });

    return NextResponse.redirect(session.url!, 303);
  } catch (err: any) {
    const origin = originFromReq(req);
    const message =
      err?.raw?.message || err?.message || "Checkout error (unknown).";
    return NextResponse.redirect(
      new URL(`/store?error=${encodeURIComponent(message)}`, origin),
      303
    );
  }
}

export async function POST(req: Request) {
  try {
    const { slug, guest, quantity } = await parseIncomingRequest(req);

    if (!slug) {
      return NextResponse.json(
        { error: "Missing 'slug' in request body." },
        { status: 400 }
      );
    }

    let user: { id: string; email?: string | null } | null = null;

    if (!guest) {
      const { user: signedIn, error: userErr } = await getSignedInUser();

      if (userErr) {
        return NextResponse.json(
          { error: "Auth error. Please sign in again." },
          { status: 401 }
        );
      }

      if (!signedIn) {
        return NextResponse.json(
          { error: "You must be signed in to checkout." },
          { status: 401 }
        );
      }

      user = signedIn as any;
    }

    const origin = originFromReq(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: buildLineItems(slug, quantity),
      allow_promotion_codes: true,
      customer_email: user?.email ?? undefined,
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      success_url: `${origin}/store?success=1`,
      cancel_url: `${origin}/store?canceled=1`,
      client_reference_id: user?.id,
      metadata: buildMetadata(slug, quantity, user?.id, guest),
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    const message = err?.raw?.message || err?.message || "Checkout error (unknown).";
    const status = typeof err?.statusCode === "number" ? err.statusCode : 500;

    return NextResponse.json(
      { error: message, type: err?.type, code: err?.code, param: err?.param },
      { status }
    );
  }
}
