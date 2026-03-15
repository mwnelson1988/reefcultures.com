// app/api/admin/shipping/rates/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";

type RateRequestBody = {
  to: {
    name?: string;
    address_line1?: string;
    address_line2?: string;
    city_locality?: string;
    state_province?: string;
    postal_code?: string;
    country_code?: string;
  };
  pkg: {
    weight_oz?: number;
    length_in?: number;
    width_in?: number;
    height_in?: number;
  };
};

function clean(s: unknown) {
  return String(s ?? "").trim();
}

function num(n: unknown, fallback = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? v : fallback;
}

function parseCarrierIds(): string[] {
  const many = clean(process.env.SHIPENGINE_CARRIER_IDS);
  if (many) {
    return many
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  const one = clean(process.env.SHIPENGINE_CARRIER_ID);
  return one ? [one] : [];
}

export async function POST(req: Request) {
  try {
    // ✅ Ensure authenticated + admin
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const apiKey = clean(process.env.SHIPENGINE_API_KEY);
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing SHIPENGINE_API_KEY env var" },
        { status: 500 }
      );
    }

    const carrierIds = parseCarrierIds();
    if (!carrierIds.length) {
      return NextResponse.json(
        {
          error:
            "Missing ShipEngine carrier id(s). Set SHIPENGINE_CARRIER_ID or SHIPENGINE_CARRIER_IDS in Vercel.",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RateRequestBody;

    // ✅ Pull "to" fields from the client payload
    const to_address_line1 = clean(body?.to?.address_line1);
    const to_city_locality = clean(body?.to?.city_locality);
    const to_state_province = clean(body?.to?.state_province).toUpperCase();
    const to_postal_code = clean(body?.to?.postal_code);
    const to_country_code = clean(body?.to?.country_code || "US").toUpperCase();

    // ✅ Pull package fields
    const weightOz = num(body?.pkg?.weight_oz, 0);
    const lengthIn = num(body?.pkg?.length_in, 0);
    const widthIn = num(body?.pkg?.width_in, 0);
    const heightIn = num(body?.pkg?.height_in, 0);

    // Basic validation so we fail cleanly BEFORE ShipEngine
    if (!to_address_line1) {
      return NextResponse.json(
        { error: "Address line 1 is required." },
        { status: 400 }
      );
    }
    if (!to_city_locality) {
      return NextResponse.json({ error: "City is required." }, { status: 400 });
    }
    if (!to_state_province) {
      return NextResponse.json({ error: "State is required." }, { status: 400 });
    }
    if (!to_postal_code) {
      return NextResponse.json(
        { error: "Postal code is required." },
        { status: 400 }
      );
    }
    if (!to_country_code) {
      return NextResponse.json(
        { error: "Country code is required." },
        { status: 400 }
      );
    }
    if (!weightOz || weightOz <= 0) {
      return NextResponse.json(
        { error: "Weight must be greater than 0." },
        { status: 400 }
      );
    }
    if (![lengthIn, widthIn, heightIn].every((n) => n > 0)) {
      return NextResponse.json(
        { error: "All dimensions must be greater than 0." },
        { status: 400 }
      );
    }

    // ✅ Ship-from (your warehouse/origin)
    const from_postal_code = clean(process.env.SHIP_FROM_POSTAL_CODE || "63366");
    const from_country_code = clean(process.env.SHIP_FROM_COUNTRY || "US").toUpperCase();

    // NOTE: ShipEngine rate estimate works fine with just postal+country,
    // but we include these if present to improve accuracy
    const from_city_locality = clean(process.env.SHIP_FROM_CITY || "O'Fallon");
    const from_state_province = clean(process.env.SHIP_FROM_STATE || "MO").toUpperCase();
    const from_address_line1 = clean(process.env.SHIP_FROM_ADDRESS1 || "");

    // ✅ Correct ShipEngine "rate estimate" payload shape
    const payload: any = {
      carrier_ids: carrierIds,
      from_country_code,
      from_postal_code,
      to_country_code,
      to_postal_code,
      weight: { value: weightOz, unit: "ounce" },
      dimensions: { unit: "inch", length: lengthIn, width: widthIn, height: heightIn },
      confirmation: "none",
      address_residential_indicator: "unknown",
    };

    // Add optional address detail if available (helps validation + accuracy)
    if (from_city_locality) payload.from_city_locality = from_city_locality;
    if (from_state_province) payload.from_state_province = from_state_province;
    if (from_address_line1) payload.from_address_line1 = from_address_line1;

    payload.to_city_locality = to_city_locality;
    payload.to_state_province = to_state_province;
    payload.to_address_line1 = to_address_line1;

    const resp = await fetch("https://api.shipengine.com/v1/rates/estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "ShipEngine rate request failed", details: text },
        { status: 502 }
      );
    }

    const data = await resp.json();

    // Normalize rates into the client’s expected format
    const ratesRaw: any[] = Array.isArray(data) ? data : Array.isArray(data?.rates) ? data.rates : [];

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
          rate_id: r?.rate_id || r?.rate?.rate_id || r?.id || null,
          carrier_friendly_name: r?.carrier_friendly_name || r?.carrier || r?.carrier_code || "Carrier",
          service_type: r?.service_type || r?.service_code || r?.service || "Service",
          service_code: r?.service_code || r?.service || null,
          amount: typeof amount === "number" ? amount : 0,
          currency: (r?.shipping_amount?.currency || r?.currency || "USD").toUpperCase(),
          delivery_days: r?.delivery_days ?? r?.estimated_delivery_days ?? null,
          estimated_delivery_date: r?.estimated_delivery_date ?? null,
        };
      })
      .filter((r) => r.rate_id && typeof r.amount === "number");

    return NextResponse.json({ rates });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Unexpected error in admin shipping rates route",
        details: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}