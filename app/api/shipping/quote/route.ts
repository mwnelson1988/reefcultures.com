// app/api/shipping/quote/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type Item = { sku: string; name: string; qty: number; unit_amount: number };

type Address = {
  name: string;
  email?: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city_locality: string;
  state_province: string;
  postal_code: string;
  country_code: string;
};

type Body = {
  items: Item[];
  address: Address;
};

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} in environment`);
  return v;
}

function normalizePhone(input?: string) {
  const digits = (input || "").replace(/[^\d]/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return "0000000000";
}

function normalizeState(input?: string) {
  return (input || "").trim().toUpperCase().slice(0, 2);
}

function moneyToCents(amount: string | number) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

let cachedCarrierIds: { ids: string[]; expiresAt: number } | null = null;

async function getCarrierIds(apiKey: string) {
  const now = Date.now();
  if (cachedCarrierIds && cachedCarrierIds.expiresAt > now) return cachedCarrierIds.ids;

  const raw = process.env.SHIPENGINE_CARRIER_IDS || "";
  const fromEnv = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (fromEnv.length) {
    cachedCarrierIds = { ids: fromEnv, expiresAt: now + 15 * 60 * 1000 };
    return fromEnv;
  }

  const res = await fetch("https://api.shipengine.com/v1/carriers", {
    method: "GET",
    headers: { "Content-Type": "application/json", "API-Key": apiKey },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      data?.errors?.[0]?.message ||
      data?.message ||
      "Unable to fetch carriers. Set SHIPENGINE_CARRIER_IDS in env.";
    throw new Error(msg);
  }

  const ids = Array.isArray(data?.carriers)
    ? data.carriers
        .filter((c: any) => c?.carrier_id && c?.is_enabled !== false)
        .map((c: any) => c.carrier_id)
        .filter(Boolean)
    : [];

  if (!ids.length) {
    throw new Error(
      "No enabled carriers found. Enable USPS/UPS in ShipEngine or set SHIPENGINE_CARRIER_IDS."
    );
  }

  cachedCarrierIds = { ids, expiresAt: now + 15 * 60 * 1000 };
  return ids;
}

/**
 * STRICT allow-list of service codes/types so you don't get a million options.
 * ShipEngine values can vary slightly per account/config, so we match by BOTH:
 * - service_code (preferred)
 * - service_type text (fallback)
 */
const ALLOW_SERVICE_CODE = new Set<string>([
  // UPS
  "ups_next_day_air",
  "ups_next_day_air_saver",
  "ups_next_day_air_early_am",
  "ups_2nd_day_air",
  "ups_2nd_day_air_am",
  "ups_3_day_select",

  // USPS
  "usps_priority_mail_express",
  "usps_priority_mail_express_hfp",
  "usps_priority_mail",
]);

function isAllowedService(r: any) {
  const code = String(r?.service_code || "").toLowerCase().trim();
  const type = String(r?.service_type || "").toLowerCase().trim();
  const carrier = String(r?.carrier_friendly_name || "").toLowerCase().trim();

  // Prefer service_code allow-list
  if (code && ALLOW_SERVICE_CODE.has(code)) return true;

  // Fallback: match obvious fast keywords
  const text = `${carrier} ${type} ${code}`.toLowerCase();

  // UPS fast
  if (text.includes("ups")) {
    if (text.includes("next day") || text.includes("next-day") || text.includes("overnight"))
      return true;
    if (text.includes("2nd day") || text.includes("second day") || text.includes("2 day"))
      return true;
    if (text.includes("3 day") || text.includes("3-day") || text.includes("3 day select"))
      return true;
    return false; // kill UPS Ground etc
  }

  // USPS fast-ish
  if (text.includes("usps")) {
    if (text.includes("priority mail express")) return true;
    // If you decide you ONLY want Express, tell me and I'll remove this line:
    if (text.includes("priority mail")) return true;
    return false; // kill media mail, ground advantage, etc
  }

  // If carrier isn't clearly UPS/USPS, drop it (keeps list clean)
  return false;
}

function speedBucket(r: { service_code: string; service_type: string; delivery_days: number | null }) {
  const d = typeof r.delivery_days === "number" ? r.delivery_days : null;
  if (d != null) {
    if (d <= 1) return "overnight";
    if (d <= 2) return "2day";
    return "3day";
  }

  const text = `${r.service_code || ""} ${r.service_type || ""}`.toLowerCase();
  if (text.includes("next_day") || text.includes("next day") || text.includes("overnight"))
    return "overnight";
  if (text.includes("2nd") || text.includes("2 day") || text.includes("second day")) return "2day";
  return "3day";
}

/**
 * Reduce options further:
 * Keep only the cheapest rate per bucket (overnight / 2day / 3day) per carrier.
 * This prevents duplicates like "UPS 2nd Day Air" + "UPS 2nd Day Air AM" etc.
 */
function dedupeAndCap(rates: any[]) {
  const best = new Map<string, any>(); // key = carrier|bucket

  for (const r of rates) {
    const carrier = String(r.carrier_friendly_name || "").toLowerCase();
    const bucket = speedBucket(r);
    const key = `${carrier}|${bucket}`;
    const existing = best.get(key);
    if (!existing) {
      best.set(key, r);
      continue;
    }
    if (moneyToCents(r.amount) < moneyToCents(existing.amount)) best.set(key, r);
  }

  const out = Array.from(best.values());

  // Sort by speed bucket (overnight, 2day, 3day), then cheapest
  const order: Record<string, number> = { overnight: 1, "2day": 2, "3day": 3 };
  out.sort((a, b) => {
    const ab = speedBucket(a);
    const bb = speedBucket(b);
    const o = (order[ab] || 99) - (order[bb] || 99);
    if (o !== 0) return o;
    return moneyToCents(a.amount) - moneyToCents(b.amount);
  });

  // Optional: hard cap total options (keeps it super clean)
  return out.slice(0, 6);
}

export async function POST(req: Request) {
  try {
    // Accept either variable name.
    // Many folks paste their ShipEngine key into SHIPSTATION_API_KEY by mistake.
    const SHIPENGINE_API_KEY =
      process.env.SHIPENGINE_API_KEY || process.env.SHIPSTATION_API_KEY;
    if (!SHIPENGINE_API_KEY) {
      throw new Error("Missing SHIPENGINE_API_KEY (or SHIPSTATION_API_KEY) in environment");
    }

    const from_name =
      process.env.SHIP_FROM_NAME || process.env.SHIP_FROM_COMPANY || "ReefCultures";
    const from_company = process.env.SHIP_FROM_COMPANY || "ReefCultures";
    const from_phone = normalizePhone(process.env.SHIP_FROM_PHONE);

    const from_address1 =
      process.env.SHIP_FROM_ADDRESS1 || process.env.SHIP_FROM_STREET1 || "";
    const from_address2 = process.env.SHIP_FROM_ADDRESS2 || "";

    const from_city = process.env.SHIP_FROM_CITY || "";
    const from_state = normalizeState(process.env.SHIP_FROM_STATE);
    const from_postal =
      process.env.SHIP_FROM_POSTAL_CODE || process.env.SHIP_FROM_ZIP || "";
    const from_country = (process.env.SHIP_FROM_COUNTRY || "US").toUpperCase();

    if (!from_address1 || !from_city || !from_state || !from_postal) {
      return jsonError(
        "Missing SHIP_FROM_* origin address env vars (address1/city/state/postal).",
        500
      );
    }

    const body = (await req.json()) as Partial<Body>;
    const items = Array.isArray(body.items) ? body.items : [];
    const to = body.address as Address | undefined;

    if (!items.length) return jsonError("Missing items", 400);
    if (
      !to ||
      !to.name ||
      !to.address_line1 ||
      !to.city_locality ||
      !to.state_province ||
      !to.postal_code ||
      !to.country_code
    ) {
      return jsonError("Missing or incomplete destination address", 400);
    }

    const shipToCountry = (to.country_code || "US").toUpperCase();
    const shipToState = normalizeState(to.state_province);
    const shipToPhone = normalizePhone(to.phone);

    if (shipToCountry === "US" && shipToState.length !== 2) {
      return jsonError("State must be a 2-letter code for US (example: MO).", 400);
    }

    const totalQty = items.reduce((sum, it) => sum + (it.qty || 0), 0);
    const weightOz = Math.max(16, Math.min(80, 32 * totalQty + 16));
    const dims =
      totalQty > 1 ? { length: 10, width: 8, height: 6 } : { length: 8, width: 6, height: 4 };

    const carrier_ids = await getCarrierIds(SHIPENGINE_API_KEY);

    const payload: any = {
      rate_options: { carrier_ids },
      shipment: {
        ship_from: {
          name: from_name,
          company_name: from_company,
          phone: from_phone,
          address_line1: from_address1,
          address_line2: from_address2 || undefined,
          city_locality: from_city,
          state_province: from_state,
          postal_code: from_postal,
          country_code: from_country,
        },
        ship_to: {
          name: to.name,
          phone: shipToPhone,
          address_line1: to.address_line1,
          address_line2: to.address_line2 || undefined,
          city_locality: to.city_locality,
          state_province: shipToState,
          postal_code: to.postal_code,
          country_code: shipToCountry,
        },
        packages: [
          {
            weight: { value: weightOz, unit: "ounce" },
            dimensions: { ...dims, unit: "inch" },
          },
        ],
      },
    };

    const seRes = await fetch("https://api.shipengine.com/v1/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": SHIPENGINE_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    const seData = await seRes.json().catch(() => ({}));
    if (!seRes.ok) {
      return jsonError(seData?.errors?.[0]?.message || "ShipEngine rate error", 400);
    }

    const ratesRaw = Array.isArray(seData?.rate_response?.rates)
      ? seData.rate_response.rates
      : [];

    // Map -> filter strictly -> dedupe/cap
    const mapped = ratesRaw
      .map((r: any) => ({
        rate_id: r.rate_id,
        carrier_id: r.carrier_id,
        carrier_friendly_name: r.carrier_friendly_name,
        service_type: r.service_type,
        service_code: r.service_code,
        amount: r.shipping_amount?.amount ?? r.amount,
        currency: r.shipping_amount?.currency ?? r.currency ?? "usd",
        delivery_days: r.delivery_days ?? null,
        estimated_delivery_date: r.estimated_delivery_date ?? null,
      }))
      .filter((r: any) => r.rate_id);

    const allowed = mapped.filter(isAllowedService);
    const rates = dedupeAndCap(allowed);

    if (!rates.length) {
      return jsonError(
        "No fast UPS/USPS services (Overnight / 2-Day / 3-Day) were returned for this address.",
        400
      );
    }

    const quote_key = crypto.randomUUID();
    const expires_at = new Date(Date.now() + 1000 * 60 * 30).toISOString();

    const sb = supabaseAdmin();
    const { error: upErr } = await sb.from("shipping_quotes").upsert(
      {
        quote_key,
        expires_at,
        items,
        ship_to: {
          ...to,
          phone: shipToPhone,
          state_province: shipToState,
          country_code: shipToCountry,
        },
        rates,
        created_at: new Date().toISOString(),
      },
      { onConflict: "quote_key" }
    );

    if (upErr) return jsonError(`Supabase error: ${upErr.message}`, 500);

    return NextResponse.json({ quote_key, expires_at, rates });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to create shipping quote" },
      { status: 500 }
    );
  }
}