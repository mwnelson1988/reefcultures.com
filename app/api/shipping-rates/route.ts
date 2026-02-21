import { NextResponse } from "next/server";
import { products } from "@/lib/store/products";

/**
 * ShipStation API (ShipEngine rebrand) live rate shopping.
 * - We return a simplified "Shippo-like" shape so the existing frontend keeps working.
 * Docs:
 *  - POST https://api.shipstation.com/v2/rates
 */

type AddressInput = {
  name?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string; // default US
};

function reqEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name} env var.`);
  return v;
}

function toInt(val: string | undefined, fallback: number) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function centsFromAmount(amount: number | string) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round(n * 100));
}

function buildShipFrom() {
  return {
    name: process.env.SHIP_FROM_NAME || "ReefCultures",
    phone: process.env.SHIP_FROM_PHONE || undefined,
    email: process.env.SHIP_FROM_EMAIL || undefined,
    address_line1: reqEnv("SHIP_FROM_STREET1"),
    address_line2: process.env.SHIP_FROM_STREET2 || undefined,
    city_locality: reqEnv("SHIP_FROM_CITY"),
    state_province: reqEnv("SHIP_FROM_STATE"),
    postal_code: reqEnv("SHIP_FROM_ZIP"),
    country_code: (process.env.SHIP_FROM_COUNTRY || "US").toUpperCase(),
    address_residential_indicator: "unknown",
  } as const;
}

function buildShipTo(address: AddressInput) {
  return {
    name: address.name || "Customer",
    address_line1: address.street1,
    address_line2: address.street2 || undefined,
    city_locality: address.city,
    state_province: address.state,
    postal_code: address.zip,
    country_code: (address.country || "US").toUpperCase(),
    address_residential_indicator: "unknown",
  } as const;
}

function productWeightOz(productId: string, quantity: number) {
  const p = products.find((x) => x.id === productId);
  if (!p) throw new Error("Unknown product.");

  // Defaults are in .env.example — tune once you weigh your packed shipments.
  const w16 = toInt(process.env.WEIGHT_16OZ_OZ, 32);
  const w32 = toInt(process.env.WEIGHT_32OZ_OZ, 48);

  const unitOz = p.sizeOz === 16 ? w16 : w32;
  const totalOz = Math.max(1, unitOz * Math.max(1, quantity));
  return totalOz;
}

export async function POST(req: Request) {
  try {
    const apiKey = reqEnv("SHIPSTATION_API_KEY");

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });

    const productId = String(body.productId || "");
    const quantity = Math.max(1, Number(body.quantity || 1));
    const address: AddressInput | undefined = body.address;

    if (!productId || !address?.street1 || !address?.city || !address?.state || !address?.zip) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Parcel defaults (inches + ounces)
    const length = toInt(process.env.PARCEL_LENGTH_IN, 8);
    const width = toInt(process.env.PARCEL_WIDTH_IN, 6);
    const height = toInt(process.env.PARCEL_HEIGHT_IN, 6);
    const totalOz = productWeightOz(productId, quantity);

    const shipmentRequest = {
      ship_to: buildShipTo(address),
      ship_from: buildShipFrom(),
      packages: [
        {
          package_code: "package",
          weight: { value: totalOz, unit: "ounce" },
          // Dimensions are optional, but help rate accuracy for some carriers.
          dimensions: { unit: "inch", length, width, height },
        },
      ],
    };

    // Rate options: keep it broad so the customer can pick cheapest / fastest.
    // You can later restrict by carrier_ids or service_codes if you want.
    const rateOptions = {
      calculate_tax_amount: false,
      preferred_currency: "usd",
    };

    const res = await fetch("https://api.shipstation.com/v2/rates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        shipment_request: shipmentRequest,
        rate_options: rateOptions,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || data?.error || "Failed to fetch shipping rates." },
        { status: res.status }
      );
    }

    // Expected response shape (simplified):
    // data.rate_response.rates[] with rate_id, carrier_friendly_name, service_type, shipping_amount
    const rateResponse = data?.rate_response || {};
    const shipmentId = String(rateResponse?.shipment_id || data?.shipment_id || "");
    const rates = Array.isArray(rateResponse?.rates) ? rateResponse.rates : [];

    const mappedRates = rates
      .filter((r: any) => r && r.rate_id && r.shipping_amount && r.shipping_amount.amount != null)
      .map((r: any) => ({
        // Frontend currently expects Shippo-ish fields
        object_id: String(r.rate_id),
        provider: String(r.carrier_friendly_name || r.carrier_code || "Carrier"),
        servicelevel: {
          name: String(r.service_type || r.service_code || "Service"),
          token: String(r.service_code || r.service_type || ""),
        },
        amount: String(r.shipping_amount.amount),
        currency: String((r.shipping_amount.currency || "usd").toUpperCase()),
        estimated_days: typeof r.delivery_days === "number" ? r.delivery_days : undefined,
        // Keep extra fields if you want them later
        _raw: {
          carrier_id: r.carrier_id ?? null,
          service_code: r.service_code ?? null,
          package_type: r.package_type ?? null,
          rate_type: r.rate_type ?? null,
        },
      }));

    if (!shipmentId) {
      // Some accounts may not return shipment_id for certain workflows; still return rates.
      return NextResponse.json({ shipmentId: "", rates: mappedRates });
    }

    return NextResponse.json({ shipmentId, rates: mappedRates });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error." }, { status: 500 });
  }
}
