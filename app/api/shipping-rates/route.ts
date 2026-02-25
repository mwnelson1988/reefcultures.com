// app/api/shipping-rates/route.ts
import { NextResponse } from "next/server";
import { products, type Product } from "@/lib/store/products";

/**
 * LIVE SHIPPING RATES (ShipStation API / ShipEngine)
 *
 * Expected request body:
 * {
 *   "name": "Full Name",
 *   "address1": "123 Main St",
 *   "address2": "",
 *   "city": "St Louis",
 *   "state": "MO",
 *   "zip": "63101",
 *   "country": "US",
 *   "quantity": 1,
 *   "productId": "phyto-16oz"   // must match products[].slug
 * }
 */

type RateRequest = {
  name: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  quantity?: number;
  productId: string; // must match Product.slug
};

function toInt(val: string | undefined, fallback: number) {
  const n = Number.parseInt(String(val ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function inferSizeOz(product: Product | undefined): number {
  if (!product) return 32;

  const size = (product.size ?? "").toLowerCase();
  const m = size.match(/(\d+)\s*oz/);
  if (m?.[1]) {
    const oz = Number.parseInt(m[1], 10);
    if (Number.isFinite(oz)) return oz;
  }

  const slug = (product.slug ?? "").toLowerCase();
  const m2 = slug.match(/(\d+)\s*oz/);
  if (m2?.[1]) {
    const oz = Number.parseInt(m2[1], 10);
    if (Number.isFinite(oz)) return oz;
  }

  return 32;
}

function getTotalWeightOz(product: Product | undefined, quantity: number) {
  const w16 = toInt(process.env.WEIGHT_16OZ_OZ, 28);
  const w32 = toInt(process.env.WEIGHT_32OZ_OZ, 48);
  const w64 = toInt(process.env.WEIGHT_64OZ_OZ, 80);

  const sizeOz = inferSizeOz(product);
  const unitOz = sizeOz <= 16 ? w16 : sizeOz <= 32 ? w32 : w64;

  return Math.max(1, unitOz * Math.max(1, quantity));
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.SHIPSTATION_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing SHIPSTATION_API_KEY env var" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RateRequest;

    const {
      name,
      address1,
      address2,
      city,
      state,
      zip,
      country = "US",
      quantity = 1,
      productId,
    } = body;

    if (!address1 || !city || !state || !zip || !productId) {
      return NextResponse.json(
        { error: "Missing required address fields or productId" },
        { status: 400 }
      );
    }

    const product = products.find((p: Product) => p.slug === productId);

    if (!product) {
      return NextResponse.json(
        { error: "Unknown productId (must match products[].slug)", productId },
        { status: 400 }
      );
    }

    const totalWeightOz = getTotalWeightOz(product, quantity);

    const length = toInt(process.env.PACKAGE_LENGTH_IN, 9);
    const width = toInt(process.env.PACKAGE_WIDTH_IN, 6);
    const height = toInt(process.env.PACKAGE_HEIGHT_IN, 4);

    const shipFromPostal =
      process.env.SHIP_FROM_POSTAL_CODE ??
      process.env.SHIP_FROM_ZIP ??
      "63366";
    const shipFromState = process.env.SHIP_FROM_STATE ?? "MO";
    const shipFromCity = process.env.SHIP_FROM_CITY ?? "O'Fallon";
    const shipFromCountry = process.env.SHIP_FROM_COUNTRY ?? "US";

    const rateReqPayload = {
      shipment: {
        ship_from: {
          postal_code: shipFromPostal,
          state_code: shipFromState,
          city_locality: shipFromCity,
          country_code: shipFromCountry,
        },
        ship_to: {
          name,
          address_line1: address1,
          address_line2: address2 ?? "",
          city_locality: city,
          state_province: state,
          postal_code: zip,
          country_code: country,
        },
        packages: [
          {
            weight: { value: totalWeightOz, unit: "ounce" },
            dimensions: { unit: "inch", length, width, height },
          },
        ],
      },
    };

    const resp = await fetch("https://api.shipstation.com/v2/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "API-Key": apiKey,
      },
      body: JSON.stringify(rateReqPayload),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: "ShipStation rate request failed", details: text },
        { status: 502 }
      );
    }

    const data = await resp.json();

    const shipmentId =
      data?.shipment_id ?? data?.shipment?.shipment_id ?? null;

    const ratesRaw: any[] = Array.isArray(data?.rates)
      ? data.rates
      : Array.isArray(data)
        ? data
        : [];

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
          rate_id: r?.rate_id ?? r?.id ?? null,
          carrier: r?.carrier_code ?? r?.carrier ?? null,
          service: r?.service_code ?? r?.service ?? null,
          amount,
          delivery_days: r?.delivery_days ?? r?.estimated_delivery_days ?? null,
        };
      })
      .filter((r) => r.rate_id && typeof r.amount === "number");

    return NextResponse.json({ shipmentId, rates });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Unexpected error in shipping-rates route",
        details: String(err?.message ?? err),
      },
      { status: 500 }
    );
  }
}