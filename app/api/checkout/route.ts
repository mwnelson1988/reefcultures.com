import { NextResponse } from "next/server";
import Stripe from "stripe";
import { mustGetEnv } from "@/lib/env";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"));

type ProductConfig = {
  slug: string;
  name: string;
  unitAmountCents: number;
  priceId: string;
};

type ShippingMethod = "ship" | "pickup";
type CartRequestItem = { slug: string; quantity: number };
type ParsedRequest = {
  slug: string;
  items: CartRequestItem[];
  guest: boolean;
  quantity: number;
  shippingMethod: ShippingMethod;
  customerEmail: string;
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
      unitAmountCents: 3499,
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


function normalizeItems(items: CartRequestItem[] | undefined, fallbackSlug?: string, fallbackQuantity?: number) {
  if (Array.isArray(items) && items.length) {
    return items
      .map((item) => ({ slug: String(item?.slug || ""), quantity: clampQuantity(item?.quantity ?? 1) }))
      .filter((item) => item.slug);
  }

  if (fallbackSlug) {
    return [{ slug: fallbackSlug, quantity: clampQuantity(fallbackQuantity ?? 1) }];
  }

  return [] as CartRequestItem[];
}

function buildLineItems(items: CartRequestItem[], shippingMethod: ShippingMethod): Stripe.Checkout.SessionCreateParams.LineItem[] {
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => {
    const product = getProductConfig(item.slug);
    return {
      price: product.priceId,
      quantity: clampQuantity(item.quantity),
    };
  });

  if (shippingMethod === "ship") {
    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Cold-chain shipping",
          description: "Flat-rate refrigerated shipping",
        },
        unit_amount: 699,
      },
      quantity: 1,
    });
  }

  return lineItems;
}

function buildMetadata(
  items: CartRequestItem[],
  userId: string | undefined,
  guest: boolean,
  shippingMethod: ShippingMethod,
  customerEmail?: string
) {
  const normalizedItems = normalizeItems(items);
  const subtotalCents = normalizedItems.reduce((sum, item) => {
    const product = getProductConfig(item.slug);
    return sum + product.unitAmountCents * clampQuantity(item.quantity);
  }, 0);
  const shippingCents = shippingMethod === "ship" ? 699 : 0;

  return {
    slug: normalizedItems[0]?.slug || "cart",
    quantity: String(normalizedItems.reduce((sum, item) => sum + clampQuantity(item.quantity), 0)),
    item_count: String(normalizedItems.length),
    cart_items: JSON.stringify(normalizedItems.map((item) => ({ slug: item.slug, quantity: clampQuantity(item.quantity) }))),
    user_id: userId ?? "guest",
    guest: guest ? "1" : "0",
    subtotal_cents: String(subtotalCents),
    shipping_cents: String(shippingCents),
    shipping_method: shippingMethod,
    pickup_instructions_required: shippingMethod === "pickup" ? "1" : "0",
    guest_email: customerEmail || "",
  };
}

async function parseIncomingRequest(req: Request): Promise<ParsedRequest> {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    return {
      slug: String(body?.slug || body?.productId || ""),
      items: normalizeItems(body?.items, String(body?.slug || body?.productId || ""), body?.quantity),
      guest: Boolean(body?.guest),
      quantity: clampQuantity(body?.quantity),
      shippingMethod: body?.shippingMethod === "pickup" ? "pickup" : "ship",
      customerEmail: typeof body?.customerEmail === "string" ? body.customerEmail.trim() : "",
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const form = await req.formData();
    return {
      slug: String(form.get("slug") || form.get("productId") || ""),
      items: normalizeItems(
        undefined,
        String(form.get("slug") || form.get("productId") || ""),
        clampQuantity(form.get("quantity"))
      ),
      guest: String(form.get("guest") || "") === "1",
      quantity: clampQuantity(form.get("quantity")),
      shippingMethod: String(form.get("shippingMethod") || "") === "pickup" ? "pickup" : "ship",
      customerEmail: String(form.get("customerEmail") || "").trim(),
    };
  }

  return { slug: "", items: [], guest: false, quantity: 1, shippingMethod: "ship", customerEmail: "" };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug") || "";
    const guest = url.searchParams.get("guest") === "1";
    const quantity = clampQuantity(url.searchParams.get("quantity") || 1);
    const items = normalizeItems(undefined, slug, quantity);
    const shippingMethod: ShippingMethod =
      url.searchParams.get("shippingMethod") === "pickup" ? "pickup" : "ship";
    const customerEmail = String(url.searchParams.get("customerEmail") || "").trim();

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
        const next = `/api/checkout?slug=${encodeURIComponent(slug)}&quantity=${quantity}&shippingMethod=${shippingMethod}${customerEmail ? `&customerEmail=${encodeURIComponent(customerEmail)}` : ""}`;
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
      line_items: buildLineItems(items, shippingMethod),
      allow_promotion_codes: true,
      customer_email: (email ?? customerEmail) || undefined,
      shipping_address_collection: shippingMethod === "ship" ? {
        allowed_countries: ["US"],
      } : undefined,
      success_url: `${origin}/store?success=1`,
      cancel_url: `${origin}/store?canceled=1`,
      client_reference_id: userId,
      metadata: buildMetadata(items, userId, guest, shippingMethod, customerEmail),
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
    const parsed = await parseIncomingRequest(req);
    const { slug, items, guest, quantity, customerEmail } = parsed;
    const shippingMethod: ShippingMethod = parsed.shippingMethod === "pickup" ? "pickup" : "ship";
    const normalizedItems = normalizeItems(items, slug, quantity);

    if (!normalizedItems.length) {
      return NextResponse.json(
        { error: "Your cart is empty." },
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

    if (guest && shippingMethod === "pickup" && !customerEmail) {
      return NextResponse.json(
        { error: "Email is required for local pickup instructions." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: buildLineItems(normalizedItems, shippingMethod),
      allow_promotion_codes: true,
      customer_email: (user?.email ?? customerEmail) || undefined,
      shipping_address_collection:
        shippingMethod === "ship"
          ? {
              allowed_countries: ["US"],
            }
          : undefined,
      success_url: `${origin}/store?success=1`,
      cancel_url: `${origin}/store?canceled=1`,
      client_reference_id: user?.id,
      metadata: buildMetadata(normalizedItems, user?.id, guest, shippingMethod, customerEmail),
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
