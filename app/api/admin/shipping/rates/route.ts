// app/api/admin/shipping/rates/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";

type RateReqBody = {
  to?: {
    name?: string;
    address_line1?: string;
    address_line2?: string;
    city_locality?: string;
    state_province?: string;
    postal_code?: string;
    country_code?: string;

    // allow legacy keys too (just in case)
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postal?: string;
    country?: string;
  };
  pkg?: {
    weight_oz?: number;
    length_in?: number;
    width_in?: number;
    height_in?: number;

    // allow legacy keys too
    weightOz?: number;
    lengthIn?: number;
    widthIn?: number;
    heightIn?: number;
  };
};

function clean(v: any) {
  return String(v ?? "").trim();
}

function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export async function POST(req: Request) {
  // ✅ Auth gate (admin only)
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ✅ Env check
  const shipEngineKey =
    process.env.SHIPENGINE_API_KEY ||
    process.env.SHIPENGINE_KEY ||
    process.env.SHIP_ENGINE_API_KEY;

  if (!shipEngineKey) {
    return NextResponse.json(
      { error: "Missing SHIPENGINE_API_KEY env var" },
      { status: 500 }
    );
  }

  let body: RateReqBody = {};
  try {
    body = (await req.json()) as RateReqBody;
  } catch {
    body = {};
  }

  const toRaw = body.to ?? {};
  const pkgRaw = body.pkg ?? {};

  // ✅ IMPORTANT: read address_line1 (and fallback to address1)
  const to = {
    name: clean(toRaw.name) || "Store",
    address_line1: clean(toRaw.address_line1 || toRaw.address1),
    address_line2: clean(toRaw.address_line2 || toRaw.address2),
    city_locality: clean(toRaw.city_locality || toRaw.city),
    state_province: clean(toRaw.state_province || toRaw.state),
    postal_code: clean(toRaw.postal_code || toRaw.postal),
    country_code: (clean(toRaw.country_code || toRaw.country) || "US").toUpperCase(),
  };

  const pkg = {
    weight_oz: num(pkgRaw.weight_oz ?? pkgRaw.weightOz, 0),
    length_in: num(pkgRaw.length_in ?? pkgRaw.lengthIn, 0),
    width_in: num(pkgRaw.width_in ?? pkgRaw.widthIn, 0),
    height_in: num(pkgRaw.height_in ?? pkgRaw.heightIn, 0),
  };

  // ✅ Validate BEFORE calling ShipEngine (no more provider error strings)
  if (!to.address_line1) {
    return NextResponse.json({ error: "Address line 1 is required." }, { status: 400 });
  }
  if (!to.city_locality) {
    return NextResponse.json({ error: "City is required." }, { status: 400 });
  }
  if (!to.state_province) {
    return NextResponse.json({ error: "State is required." }, { status: 400 });
  }
  if (!to.postal_code) {
    return NextResponse.json({ error: "Postal code is required." }, { status: 400 });
  }
  if (!pkg.weight_oz || pkg.weight_oz <= 0) {
    return NextResponse.json({ error: "Weight must be > 0." }, { status: 400 });
  }
  if (![pkg.length_in, pkg.width_in, pkg.height_in].every((n) => n > 0)) {
    return NextResponse.json({ error: "Dimensions must be > 0." }, { status: 400 });
  }

  // ✅ Ship-from (your defaults; override via env if you want)
  const shipFrom = {
    name: process.env.SHIP_FROM_NAME || "ReefCultures",
    address_line1: process.env.SHIP_FROM_ADDRESS1 || "1488 Page Industrial Blvd",
    address_line2: process.env.SHIP_FROM_ADDRESS2 || "",
    city_locality: process.env.SHIP_FROM_CITY || "St. Louis",
    state_province: process.env.SHIP_FROM_STATE || "MO",
    postal_code: process.env.SHIP_FROM_POSTAL || process.env.SHIP_FROM_ZIP || "63132",
    country_code: (process.env.SHIP_FROM_COUNTRY || "US").toUpperCase(),
  };

  // ✅ ShipEngine: Rate Estimate
  // Docs: POST https://api.shipengine.com/v1/rates/estimate
  const sePayload = {
    shipment: {
      ship_from: shipFrom,
      ship_to: to,
      packages: [
        {
          weight: { value: pkg.weight_oz, unit: "ounce" },
          dimensions: {
            unit: "inch",
            length: pkg.length_in,
            width: pkg.width_in,
            height: pkg.height_in,
          },
        },
      ],
    },
  };

  const resp = await fetch("https://api.shipengine.com/v1/rates/estimate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "API-Key": shipEngineKey,
    },
    body: JSON.stringify(sePayload),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    return NextResponse.json(
      { error: "ShipEngine rate request failed", details: text },
      { status: 502 }
    );
  }

  const data = await resp.json().catch(() => ({}));

  const ratesRaw: any[] = Array.isArray(data?.rate_response?.rates)
    ? data.rate_response.rates
    : Array.isArray(data?.rates)
      ? data.rates
      : [];

  // Shape exactly like your Rate type in the client
  const rates = ratesRaw
    .map((r) => {
      const amount =
        typeof r?.shipping_amount?.amount === "number"
          ? r.shipping_amount.amount
          : typeof r?.rate === "number"
            ? r.rate
            : typeof r?.amount === "number"
              ? r.amount
              : null;

      return {
        rate_id: String(r?.rate_id ?? r?.rateId ?? r?.id ?? ""),
        carrier_friendly_name: r?.carrier_friendly_name ?? r?.carrier ?? r?.carrier_code ?? undefined,
        service_type: r?.service_type ?? r?.service_code ?? r?.service ?? "Service",
        service_code: r?.service_code ?? r?.service_type ?? undefined,
        amount: amount ?? 0,
        currency: (r?.shipping_amount?.currency ?? r?.currency ?? "USD").toUpperCase(),
        delivery_days: r?.delivery_days ?? r?.estimated_delivery_days ?? null,
        estimated_delivery_date: r?.estimated_delivery_date ?? null,
      };
    })
    .filter((r) => r.rate_id && typeof r.amount === "number" && r.amount >= 0);

  return NextResponse.json({ rates });
}