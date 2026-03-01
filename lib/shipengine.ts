// lib/shipengine.ts
// NOTE: This file now implements ShipStation rates (kept filename to avoid refactors).

export type ShipEngineAddress = {
  name?: string;
  phone?: string;
  address_line1: string;
  address_line2?: string;
  city_locality: string;
  state_province: string;
  postal_code: string;
  country_code: string; // "US"
};

export type RateRequestPackage = {
  weight: { value: number; unit: "ounce" | "pound" };
  dimensions: { unit: "inch"; length: number; width: number; height: number };
};

export type ShippingRateOption = {
  rate_id: string;
  carrier_id: string; // we will store carrierCode here
  carrier_friendly_name?: string;
  service_type: string; // serviceName
  service_code?: string; // serviceCode
  shipping_amount: { currency: string; amount: number }; // dollars
  delivery_days?: number;
  estimated_delivery_date?: string;
};

function authHeader() {
  const key = process.env.SHIPSTATION_API_KEY;
  const secret = process.env.SHIPSTATION_API_SECRET;

  if (!key) throw new Error("Missing SHIPSTATION_API_KEY");
  if (!secret) throw new Error("Missing SHIPSTATION_API_SECRET");

  const token = Buffer.from(`${key}:${secret}`).toString("base64");
  return `Basic ${token}`;
}

/**
 * ShipStation rates endpoint: /shipments/getrates
 * Docs vary a bit by account; this payload works for most ShipStation accounts.
 */
export async function shipengineEstimateRates(params: {
  ship_from: ShipEngineAddress;
  ship_to: ShipEngineAddress;
  pkg: RateRequestPackage;
}) {
  const res = await fetch("https://ssapi.shipstation.com/shipments/getrates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
    },
    body: JSON.stringify({
      carrierCode: null, // null = all connected carriers
      serviceCode: null, // null = all services
      packageCode: null,
      fromPostalCode: params.ship_from.postal_code,
      fromCountry: params.ship_from.country_code,

      toPostalCode: params.ship_to.postal_code,
      toCountry: params.ship_to.country_code,
      toState: params.ship_to.state_province,
      toCity: params.ship_to.city_locality,

      weight: {
        value: params.pkg.weight.value,
        units: params.pkg.weight.unit === "ounce" ? "ounces" : "pounds",
      },

      dimensions: {
        units: "inches",
        length: params.pkg.dimensions.length,
        width: params.pkg.dimensions.width,
        height: params.pkg.dimensions.height,
      },

      confirmation: "none",
      residential: true,
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`ShipStation rates failed: ${res.status} ${txt}`);
  }

  const data = await res.json();

  // ShipStation commonly returns an array of rate objects
  const arr: any[] = Array.isArray(data) ? data : Array.isArray(data?.rates) ? data.rates : [];

  const rates: ShippingRateOption[] = arr
    .map((r) => {
      const amount = Number(r.shipmentCost ?? r.cost ?? r.amount ?? r.shippingAmount);
      if (!Number.isFinite(amount)) return null;

      const carrierCode = String(r.carrierCode ?? r.carrier ?? r.carrier_id ?? "carrier");
      const carrierName = String(r.carrierFriendlyName ?? r.carrierName ?? carrierCode);
      const serviceCode = r.serviceCode != null ? String(r.serviceCode) : undefined;
      const serviceName = String(r.serviceName ?? r.service ?? serviceCode ?? "service");

      // Create a stable id if ShipStation doesn't provide one
      const rateId = String(r.rateId ?? `${carrierCode}:${serviceName}:${amount}`);

      return {
        rate_id: rateId,
        carrier_id: carrierCode,
        carrier_friendly_name: carrierName,
        service_type: serviceName,
        service_code: serviceCode,
        shipping_amount: { currency: "usd", amount },
        delivery_days: r.deliveryDays != null ? Number(r.deliveryDays) : undefined,
        estimated_delivery_date: r.estimatedDeliveryDate != null ? String(r.estimatedDeliveryDate) : undefined,
      } as ShippingRateOption;
    })
    .filter(Boolean) as ShippingRateOption[];

  rates.sort((a, b) => Number(a.shipping_amount.amount) - Number(b.shipping_amount.amount));
  return rates;
}