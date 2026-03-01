import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
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

  if (code && ALLOW_SERVICE_CODE.has(code)) return true;

  const text = `${carrier} ${type} ${code}`.toLowerCase();

  if (text.includes("ups")) {
    if (text.includes("next day") || text.includes("next-day") || text.includes("overnight"))
      return true;
    if (text.includes("2nd day") || text.includes("second day") || text.includes("2 day"))
      return true;
    if (text.includes("3 day") || text.includes("3-day") || text.includes("3 day select"))
      return true;
    return false;
  }

  if (text.includes("usps")) {
    if (text.includes("priority mail express")) return true;
    if (text.includes("priority mail")) return true;
    return false;
  }

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

function dedupeAndCap(rates: any[]) {
  const best = new Map<string, any>();

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
  const order: Record<string, number> = { overnight: 1, "2day": 2, "3day": 3 };
  out.sort((a, b) => {
    const ab = speedBucket(a);
    const bb = speedBucket(b);
    const o = (order[ab] || 99) - (order[bb] || 99);
    if (o !== 0) return o;
    return moneyToCents(a.amount) - moneyToCents(b.amount);
  });

  return out.slice(0, 8);
}

export async function POST(req: Request) {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return jsonError("Unauthorized", 401);

    const admin = await isAdmin();
    if (!admin) return jsonError("Forbidden", 403);

    const SHIPENGINE_API_KEY = process.env.SHIPENGINE_API_KEY || process.env.SHIPSTATION_API_KEY;
    if (!SHIPENGINE_API_KEY) {
      return jsonError("Missing SHIPENGINE_API_KEY in environment", 500);
    }

    const from_name = process.env.SHIP_FROM_NAME || process.env.SHIP_FROM_COMPANY || "ReefCultures";
    const from_company = process.env.SHIP_FROM_COMPANY || "ReefCultures";
    const from_phone = normalizePhone(process.env.SHIP_FROM_PHONE);

    const from_address1 = process.env.SHIP_FROM_ADDRESS1 || process.env.SHIP_FROM_STREET1 || "";
    const from_address2 = process.env.SHIP_FROM_ADDRESS2 || "";

    const from_city = process.env.SHIP_FROM_CITY || "";
    const from_state = normalizeState(process.env.SHIP_FROM_STATE);
    const from_postal = process.env.SHIP_FROM_POSTAL_CODE || process.env.SHIP_FROM_ZIP || "";
    const from_country = (process.env.SHIP_FROM_COUNTRY || "US").toUpperCase();

    if (!from_address1 || !from_city || !from_state || !from_postal) {
      return jsonError(
        "Missing SHIP_FROM_* origin address env vars (address1/city/state/postal).",
        500
      );
    }

    const body = (await req.json().catch(() => ({}))) as any;
    const to = body?.to || {};
    const pkg = body?.pkg || {};

    if (!to.address_line1 || !to.city_locality || !to.state_province || !to.postal_code) {
      return jsonError("Missing destination address fields", 400);
    }

    const weight_oz = Number(pkg.weight_oz);
    const length_in = Number(pkg.length_in);
    const width_in = Number(pkg.width_in);
    const height_in = Number(pkg.height_in);

    if (!Number.isFinite(weight_oz) || weight_oz <= 0) return jsonError("Invalid weight_oz", 400);
    if (![length_in, width_in, height_in].every((n) => Number.isFinite(n) && n > 0)) {
      return jsonError("Invalid dimensions", 400);
    }

    const shipToCountry = (to.country_code || "US").toUpperCase();
    const shipToState = normalizeState(to.state_province);
    const shipToPhone = normalizePhone(to.phone);

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
          name: to.name || "Store",
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
            weight: { value: weight_oz, unit: "ounce" },
            dimensions: { length: length_in, width: width_in, height: height_in, unit: "inch" },
          },
        ],
      },
    };

    const seRes = await fetch("https://api.shipengine.com/v1/rates", {
      method: "POST",
      headers: { "Content-Type": "application/json", "API-Key": SHIPENGINE_API_KEY },
      body: JSON.stringify(payload),
    });

    const seData = await seRes.json().catch(() => ({}));
    if (!seRes.ok) {
      return jsonError(seData?.errors?.[0]?.message || "ShipEngine rate error", 400);
    }

    const ratesRaw = Array.isArray(seData?.rate_response?.rates) ? seData.rate_response.rates : [];

    const mapped = ratesRaw
      .map((r: any) => ({
        rate_id: r.rate_id,
        carrier_id: r.carrier_id,
        carrier_friendly_name: r.carrier_friendly_name,
        service_type: r.service_type,
        service_code: r.service_code,
        amount: Number(r.shipping_amount?.amount ?? r.amount),
        currency: r.shipping_amount?.currency ?? r.currency ?? "usd",
        delivery_days: r.delivery_days ?? null,
        estimated_delivery_date: r.estimated_delivery_date ?? null,
      }))
      .filter((r: any) => r.rate_id && Number.isFinite(r.amount));

    const allowed = mapped.filter(isAllowedService);
    const rates = dedupeAndCap(allowed);

    return NextResponse.json({ rates });
  } catch (err: any) {
    return jsonError(err?.message || "Failed to fetch rates", 500);
  }
}
