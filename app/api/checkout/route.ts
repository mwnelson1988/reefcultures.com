import { NextResponse } from "next/server";
import Stripe from "stripe";
import { mustGetEnv } from "@/lib/env";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"));

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

function priceIdForSlug(slug: string) {
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

  if (is16)
    return assertStripePriceId(
      mustGetEnv("STRIPE_PRICE_PHYTO_16OZ"),
      "STRIPE_PRICE_PHYTO_16OZ"
    );
  if (is32)
    return assertStripePriceId(
      mustGetEnv("STRIPE_PRICE_PHYTO_32OZ"),
      "STRIPE_PRICE_PHYTO_32OZ"
    );
  if (is64)
    return assertStripePriceId(
      mustGetEnv("STRIPE_PRICE_PHYTO_64OZ"),
      "STRIPE_PRICE_PHYTO_64OZ"
    );

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
        // Route handlers shouldn't mutate auth cookies.
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || "";
    const guest = url.searchParams.get("guest") === "1";

    if (!slug) {
      return NextResponse.redirect(
        new URL("/store?error=missing_slug", originFromReq(req)),
        303
      );
    }

    const origin = originFromReq(req);
    const price = priceIdForSlug(slug);

    // Signed-in checkout (default)
    let userId: string | undefined;
    let email: string | undefined;

    if (!guest) {
      const { user, error } = await getSignedInUser();
      if (error) {
        return NextResponse.redirect(new URL("/login", origin), 303);
      }
      if (!user) {
        const next = `/api/checkout?slug=${encodeURIComponent(slug)}`;
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
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,

      customer_email: email,

      shipping_address_collection: {
        allowed_countries: ["US"],
      },

      success_url: `${origin}/store?success=1`,
      cancel_url: `${origin}/store?canceled=1`,

      client_reference_id: userId,

      metadata: {
        slug: normalizeSlug(slug),
        user_id: userId ?? "guest",
        guest: guest ? "1" : "0",
      },
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
    const body = await req.json().catch(() => null);
    const slug = body?.slug as string | undefined;
    const guest = Boolean(body?.guest);

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

    const price = priceIdForSlug(slug);
    const origin = originFromReq(req);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      allow_promotion_codes: true,

      // Optional but recommended so Stripe collects an email even if your app doesn't pass one
      customer_email: user?.email ?? undefined,

      // Optional: collect shipping address if you ship product
      shipping_address_collection: {
        allowed_countries: ["US"],
      },

      success_url: `${origin}/store?success=1`,
      cancel_url: `${origin}/store?canceled=1`,

      // ✅ Primary link back to your app user
      client_reference_id: user?.id,

      // ✅ Redundant metadata makes debugging easier
      metadata: {
        slug: normalizeSlug(slug),
        user_id: user?.id ?? "guest",
        guest: guest ? "1" : "0",
      },
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