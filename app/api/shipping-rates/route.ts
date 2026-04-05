// app/api/admin/shipping/rates/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";

type RateReq = {
  to: {
    name?: string;
    address_line1: string;
    address_line2?: string;
    city_locality: string;
    state_province: string;
    postal_code: string;
    country_code: string; // "US"
  };
  pkg: {
    weight_oz: number;
    length_in: number;
    width_in: number;
    height_in: number;
  };
};

function clean(s: string | undefined) {
  return (s || "").trim();
}

function parseCarrierIds(): string[] {
  const single = clean(process.env.SHIPENGINE_CARRIER_ID);
  const multi = clean(process.env.SHIPENGINE_CARRIER_IDS);

  const raw = multi || single;
  if (!raw) return [];

  return raw
    .split(",")
    .map((x) => clean(x))
    .filter(Boolean);
}

async function requireAdmin(req: Request) {
  // allow bypass token for server-to-server calls if you want it
  const bypass = req.headers.get("x-admin-bypass") || req.headers.get("x-admin-bypass-token");
  const bypassToken = process.env.ADMIN_BYPASS_TOKEN;
  if (bypassToken && bypass && bypass === bypassToken) return;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const admin = await isAdmin();
  if (!admin) throw new Error("Unauthorized");
}

export async function POST(req: Request) {
  try {
    await requireAdmin(req);

    const apiKey = process.env.SHIPENGINE_API_KEY;
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
            "Missing SHIPENGINE_CARRIER_ID (or SHIPENGINE_CARRIER_IDS) env var. Example: se-4981339",
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RateReq;

    const to = body?.to;
    const pkg = body?.pkg;

    // Basic validation (prevents ShipEngine “field_value_required” spam)
    if (!to?.address_line1 || !to?.city_locality || !to?.state_province || !to?.postal_code) {
      return NextResponse.json(
        { error: "Missing destination address fields" },
        { status: 400 }
      );
    }
    if (!to?.country_code) to.country_code = "US";

    if (!pkg || !Number.isFinite(pkg.weight_oz) || pkg.weight_oz <= 0) {
      return NextResponse.json({ error: "Invalid weight_oz" }, { status: 400 });
    }
    if (![pkg.length_in, pkg.width_in, pkg.height_in].every((n) => Number.isFinite(n) && n > 0)) {
      return NextResponse.json({ error: "Invalid package dimensions" }, { status: 400 });
    }

    // Ship-from (you already have these in Vercel)
    const fromPostal =
      process.env.SHIP_FROM_ZIP ||
      process.env.SHIP_FROM_POSTAL_CODE ||
      "63368";
    const fromState = process.env.SHIP_FROM_STATE || "MO";
    const fromCity = process.env.SHIP_FROM_CITY || "O'Fallon";
    const fromCountry = process.env.SHIP_FROM_COUNTRY || "US";

    // ShipEngine Estimate Rates API
    // Uses carrier_ids correctly (no more 123/456 nonsense)
    const payload = {
      carrier_ids: carrierIds,
      from_country_code: fromCountry,
      from_postal_code: fromPostal,
      from_city_locality: fromCity,
      from_state_province: fromState,

      to_country_code: clean(to.country_code).toUpperCase(),
      to_postal_code: clean(to.postal_code),
      to_city_locality: clean(to.city_locality),
      to_state_province: clean(to.state_province).toUpperCase(),

      weight: { value: Number(pkg.weight_oz), unit: "ounce" as const },
      dimensions: {
        unit: "inch" as const,
        length: Number(pkg.length_in),
        width: Number(pkg.width_in),
        height: Number(pkg.height_in),
      },
    };

    const resp = await fetch("https://api.shipengine.com/v1/rates/estimate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      // keep raw text
    }

    if (!resp.ok) {
      return NextResponse.json(
        {
          error: "ShipEngine rate request failed",
          status: resp.status,
          details: json ?? text,
        },
        { status: 502 }
      );
    }

    const ratesRaw: any[] = Array.isArray(json?.rate_response?.rates)
      ? json.rate_response.rates
      : Array.isArray(json?.rates)
        ? json.rates
        : Array.isArray(json)
          ? json
          : [];

    const rates = ratesRaw
      .map((r) => {
        const amount =
          typeof r?.shipping_amount?.amount === "number"
            ? r.shipping_amount.amount
            : typeof r?.shipping_amount?.value === "number"
              ? r.shipping_amount.value
              : typeof r?.rate === "number"
                ? r.rate
                : typeof r?.amount === "number"
                  ? r.amount
                  : null;

        const currency =
          r?.shipping_amount?.currency ?? r?.currency ?? "USD";

        return {
          rate_id: r?.rate_id ?? r?.id ?? null,
          carrier_friendly_name: r?.carrier_friendly_name ?? r?.carrier ?? null,
          service_type: r?.service_type ?? r?.service ?? r?.service_code ?? "Service",
          service_code: r?.service_code ?? null,
          amount,
          currency,
          delivery_days: r?.delivery_days ?? r?.estimated_delivery_days ?? null,
          estimated_delivery_date: r?.estimated_delivery_date ?? null,
        };
      })
      .filter((r) => r.rate_id && typeof r.amount === "number");

    return NextResponse.json({ rates });
  } catch (err: any) {
    const msg = String(err?.message ?? err);
    const status = msg.toLowerCase().includes("unauthorized") ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}