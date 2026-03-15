import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { mustGetOrgId } from "@/lib/org";

export const dynamic = "force-dynamic";

function jsonError(
  message: string,
  status = 400,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

async function requireAdmin(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  orgId: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, message: "Not authenticated" };
  }

  const { data: membership, error } = await supabase
    .from("organization_members")
    .select("role,is_active")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return { ok: false as const, status: 500, message: error.message };
  }

  const active = membership?.is_active === true;
  const role = String(membership?.role ?? "");
  const isAdmin = active && (role === "owner" || role === "admin");

  if (!isAdmin) {
    return { ok: false as const, status: 403, message: "Not authorized" };
  }

  return { ok: true as const };
}

function mustEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function safeText(value: unknown) {
  return String(value ?? "").trim();
}

function safeNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function dollarsToCents(value: unknown) {
  return Math.round(safeNumber(value) * 100);
}

function mapEbayStatus(order: any) {
  const raw = String(
    order?.orderFulfillmentStatus ||
      order?.orderPaymentStatus ||
      order?.orderStatus ||
      "processing"
  ).toLowerCase();

  if (raw.includes("cancel")) return "canceled";
  if (raw.includes("refund")) return "refunded";
  if (raw.includes("ship")) return "shipped";
  if (raw.includes("paid")) return "paid";
  if (raw.includes("complete")) return "completed";
  return "processing";
}

async function getEbayAccessToken() {
  const clientId = mustEnv("EBAY_CLIENT_ID");
  const clientSecret = mustEnv("EBAY_CLIENT_SECRET");
  const refreshToken = mustEnv("EBAY_REFRESH_TOKEN");

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const tokenRes = await fetch(
    "https://api.ebay.com/identity/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    }
  );

  const raw = await tokenRes.text();
  let json: any = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }

  if (!tokenRes.ok) {
    throw new Error(
      json?.error_description ||
        json?.error ||
        raw ||
        `eBay token request failed (${tokenRes.status})`
    );
  }

  const accessToken = safeText(json?.access_token);
  if (!accessToken) {
    throw new Error("eBay token response did not include access_token");
  }

  return accessToken;
}

async function fetchEbayOrders(days: number) {
  const marketplaceId = mustEnv("EBAY_MARKETPLACE_ID");
  const accessToken = await getEbayAccessToken();

  const now = new Date();
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const filter = `creationdate:[${start.toISOString()}..${now.toISOString()}]`;
  const url = new URL("https://api.ebay.com/sell/fulfillment/v1/order");
  url.searchParams.set("limit", "200");
  url.searchParams.set("filter", filter);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-EBAY-C-MARKETPLACE-ID": marketplaceId,
    },
    cache: "no-store",
  });

  const raw = await res.text();
  let json: any = null;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new Error(
      json?.errors?.[0]?.message ||
        json?.message ||
        raw ||
        `eBay orders request failed (${res.status})`
    );
  }

  return Array.isArray(json?.orders) ? json.orders : [];
}

function mapOrderRow(orgId: string, order: any) {
  const orderId =
    safeText(order?.orderId) ||
    safeText(order?.legacyOrderId) ||
    safeText(order?.purchaseOrderNumber);

  if (!orderId) return null;

  const totalValue =
    order?.pricingSummary?.total?.value ??
    order?.totalFeeBasisAmount?.value ??
    order?.totalMarketplaceFee?.value ??
    0;

  const totalCents = dollarsToCents(totalValue);

  const fullName = safeText(
    order?.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo?.fullName
  );

  const externalRef =
    safeText(order?.legacyOrderId) ||
    safeText(order?.orderId) ||
    safeText(order?.purchaseOrderNumber);

  return {
    id: `ebay_${orderId}`,
    org_id: orgId,
    channel: "ebay",
    status: mapEbayStatus(order),
    placed_at: order?.creationDate ?? new Date().toISOString(),
    created_at: order?.creationDate ?? new Date().toISOString(),
    total_cents: totalCents,
    profit_cents: 0,
    stripe_checkout_session_id: `ebay:${externalRef}`,
    customer_name: fullName || null,
    customer_email: safeText(order?.buyer?.username) || null,
    shipping_name: fullName || null,
    shipping_address_1:
      safeText(
        order?.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
          ?.contactAddress?.addressLine1
      ) || null,
    shipping_address_2:
      safeText(
        order?.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
          ?.contactAddress?.addressLine2
      ) || null,
    shipping_city:
      safeText(
        order?.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
          ?.contactAddress?.city
      ) || null,
    shipping_state:
      safeText(
        order?.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
          ?.contactAddress?.stateOrProvince
      ) || null,
    shipping_postal_code:
      safeText(
        order?.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
          ?.contactAddress?.postalCode
      ) || null,
    shipping_country:
      safeText(
        order?.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo
          ?.contactAddress?.countryCode
      ) || null,
    external_source: "ebay",
    external_order_id: externalRef,
    meta: {
      ebay_order_id: safeText(order?.orderId) || null,
      legacy_order_id: safeText(order?.legacyOrderId) || null,
      payment_status: safeText(order?.orderPaymentStatus) || null,
      fulfillment_status: safeText(order?.orderFulfillmentStatus) || null,
      raw: order,
    },
  };
}

async function upsertOrders(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  rows: Record<string, any>[]
) {
  if (!rows.length) return { imported: 0 };

  const attempt = await supabase.from("orders").upsert(rows, {
    onConflict: "id",
  });

  if (!attempt.error) {
    return { imported: rows.length };
  }

  const fallbackRows = rows.map((r) => ({
    id: r.id,
    org_id: r.org_id,
    channel: r.channel,
    status: r.status,
    placed_at: r.placed_at,
    created_at: r.created_at,
    total_cents: r.total_cents,
    profit_cents: r.profit_cents,
    stripe_checkout_session_id: r.stripe_checkout_session_id,
  }));

  const fallback = await supabase.from("orders").upsert(fallbackRows, {
    onConflict: "id",
  });

  if (fallback.error) {
    throw new Error(fallback.error.message);
  }

  return { imported: fallbackRows.length };
}

export async function POST(req: Request) {
  try {
    const orgId = mustGetOrgId();
    const supabase = await supabaseServer();

    const admin = await requireAdmin(supabase, orgId);
    if (!admin.ok) {
      return jsonError(admin.message, admin.status);
    }

    const url = new URL(req.url);
    const body = await req.json().catch(() => ({} as any));
    const daysFromQuery = Number(url.searchParams.get("days") ?? "");
    const daysFromBody = Number(body?.days ?? "");

    const rawDays = Number.isFinite(daysFromBody)
      ? daysFromBody
      : daysFromQuery;
    const safeDays = Number.isFinite(rawDays)
      ? Math.max(1, Math.min(30, Math.floor(rawDays)))
      : 7;

    const ebayOrders = await fetchEbayOrders(safeDays);
    const mapped = ebayOrders
      .map((order: any) => mapOrderRow(orgId, order))
      .filter(Boolean) as Record<string, any>[];

    const result = await upsertOrders(supabase, mapped);

    return NextResponse.json({
      ok: true,
      imported: result.imported,
      fetched: ebayOrders.length,
      message: `Imported ${result.imported} eBay orders`,
    });
  } catch (e: any) {
    return jsonError(e?.message || "eBay sync failed", 500);
  }
}
