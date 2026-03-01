"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/Container";

type Rate = {
  rate_id: string;
  carrier_id: string;
  carrier_friendly_name: string;
  service_type: string;
  service_code: string;
  amount: string | number;
  currency: string;
  delivery_days: number | null;
  estimated_delivery_date: string | null;
};

type QuoteResponse = {
  quote_key: string;
  expires_at: string;
  rates: Rate[];
};

function money(amount: string | number, currency = "usd") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  const ok = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(ok);
}

function normalizeStateInput(v: string) {
  return v.trim().toUpperCase().slice(0, 2);
}

function digitsOnly(v: string) {
  return (v || "").replace(/[^\d]/g, "");
}

function normalizeZip(v: string) {
  const d = digitsOnly(v);
  // allow 5 or 9, but send 5 to start
  if (d.length >= 5) return d.slice(0, 5);
  return d;
}

/**
 * Keep only fast services:
 * - delivery_days <= 3 when present
 * - OR service text includes overnight/next day/2 day/2nd day/3 day
 * Then cap list and keep it clean.
 */
function filterFastRates(rates: Rate[]) {
  const fastRegex = /(overnight|next\s?day|1\s?day|2\s?day|2nd\s?day|three\s?day|3\s?day)/i;

  const fast = rates.filter((r) => {
    const dd = r.delivery_days;
    if (typeof dd === "number" && dd > 0 && dd <= 3) return true;

    const text = `${r.carrier_friendly_name} ${r.service_type} ${r.service_code}`.toLowerCase();
    return fastRegex.test(text);
  });

  // If ShipEngine didn't give delivery_days and regex catches too much/too little,
  // we still keep this predictable:
  const sorted = [...fast].sort((a, b) => {
    const ac = typeof a.amount === "string" ? Number(a.amount) : a.amount;
    const bc = typeof b.amount === "string" ? Number(b.amount) : b.amount;
    return (Number.isFinite(ac) ? ac : 0) - (Number.isFinite(bc) ? bc : 0);
  });

  // Reduce “too many options” by keeping cheapest per carrier+service_type
  const seen = new Set<string>();
  const deduped: Rate[] = [];
  for (const r of sorted) {
    const key = `${r.carrier_friendly_name}|${r.service_type}|${r.service_code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(r);
  }

  // Cap to a clean list
  return deduped.slice(0, 6);
}

export default function ShippingClient() {
  const sp = useSearchParams();
  const lookupKey = useMemo(() => sp.get("lookupKey") || "", [sp]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [stateProv, setStateProv] = useState("MO");
  const [zip, setZip] = useState("");

  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [selectedRateId, setSelectedRateId] = useState<string>("");

  const items = useMemo(() => {
    const sku =
      lookupKey === "rc_32oz_onetime"
        ? "PHYTO_32OZ"
        : lookupKey === "rc_16oz_onetime"
        ? "PHYTO_16OZ"
        : "PHYTO_16OZ";

    const productName =
      sku === "PHYTO_32OZ"
        ? "32oz Premium Live Phytoplankton"
        : "16oz Premium Live Phytoplankton";

    const unit_amount = sku === "PHYTO_32OZ" ? 2799 : 1999;
    return [{ sku, name: productName, qty: 1, unit_amount }];
  }, [lookupKey]);

  const productLabel =
    lookupKey === "rc_32oz_onetime"
      ? "32oz Premium Live Phytoplankton"
      : "16oz Premium Live Phytoplankton";

  async function getRates() {
    setErr(null);

    if (!lookupKey) {
      setErr("Missing lookupKey (open this page from Store → Checkout).");
      return;
    }

    const st = normalizeStateInput(stateProv);
    const z = normalizeZip(zip);

    if (!name || !address1 || !city || !st || !z) {
      setErr("Please fill in name + address + city + state + ZIP.");
      return;
    }

    if (st.length !== 2) {
      setErr("State must be the 2-letter code (example: MO).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address: {
            name,
            email: email || undefined,
            phone: phone || undefined,
            address_line1: address1,
            address_line2: address2 || undefined,
            city_locality: city,
            state_province: st,
            postal_code: z,
            country_code: "US",
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to fetch rates");

      const filteredRates = filterFastRates(Array.isArray(data?.rates) ? data.rates : []);
      if (!filteredRates.length) {
        throw new Error("No 1–3 day / overnight / 2-day rates were returned for this address.");
      }

      setQuote({
        quote_key: data.quote_key,
        expires_at: data.expires_at,
        rates: filteredRates,
      });
      setSelectedRateId(filteredRates[0]?.rate_id || "");
    } catch (e: any) {
      setErr(e?.message || "Failed to fetch rates");
      setQuote(null);
      setSelectedRateId("");
    } finally {
      setLoading(false);
    }
  }

  async function goToCheckout() {
    setErr(null);

    if (!lookupKey) {
      setErr("Missing lookupKey.");
      return;
    }
    if (!quote?.quote_key || !selectedRateId) {
      setErr("Select a shipping option first.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lookupKey,
          quote_key: quote.quote_key,
          selected_rate_id: selectedRateId,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Checkout failed");
      if (!data?.url) throw new Error("Missing Stripe session URL");

      window.location.href = data.url;
    } catch (e: any) {
      setErr(e?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-paper">
      <Container className="pt-24 sm:pt-28 pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="caps text-[11px] text-slate-500">Shipping</div>
          <h1 className="font-heading heading mt-3 text-3xl">
            Enter your address to see fast shipping rates
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            We only show Overnight, 2-Day, and up to 3-Day options (when available).
          </p>

          {!lookupKey ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              Missing <code>lookupKey</code>. Go to the{" "}
              <Link className="underline" href="/store">
                Store
              </Link>{" "}
              and click Checkout again.
            </div>
          ) : null}

          {err ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {err}
            </div>
          ) : null}

          {/* Address Card */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="caps text-[11px] text-slate-500">Product</div>
                <div className="mt-1 text-slate-900 font-semibold">{productLabel}</div>
              </div>
              <Link className="btn-ghost" href="/store">
                ← Back to Store
              </Link>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-slate-700">Full name</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-slate-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Matthew Nelson"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-slate-700">Email (optional)</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-slate-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-slate-700">Phone (optional)</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-slate-400"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(615) 969-9223"
                />
                <span className="text-xs text-slate-500">
                  Optional, but carriers sometimes require it.
                </span>
              </label>
            </div>

            <div className="mt-4 grid gap-4">
              <label className="grid gap-1 text-sm">
                <span className="text-slate-700">Address line 1</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-slate-400"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  placeholder="123 Main St"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="text-slate-700">Address line 2 (optional)</span>
                <input
                  className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-slate-400"
                  value={address2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Apt / Suite"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="grid gap-1 text-sm">
                  <span className="text-slate-700">City</span>
                  <input
                    className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-slate-400"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="O'Fallon"
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="text-slate-700">State</span>
                  <input
                    className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-slate-400"
                    value={stateProv}
                    onChange={(e) => setStateProv(e.target.value.toUpperCase())}
                    placeholder="MO"
                    maxLength={2}
                  />
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="text-slate-700">ZIP</span>
                  <input
                    className="h-11 rounded-xl border border-slate-200 px-3 outline-none focus:border-slate-400"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="63368"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button className="btn-primary" onClick={getRates} disabled={loading}>
                  {loading ? "Getting rates..." : "Get fast rates"}
                </button>
                <div className="text-xs text-slate-500">
                  US only • Overnight / 2-Day / up to 3-Day
                </div>
              </div>
            </div>
          </div>

          {/* Rates */}
          {quote?.rates?.length ? (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between gap-6 flex-wrap">
                <div>
                  <div className="caps text-[11px] text-slate-500">Fast options</div>
                  <h2 className="font-heading heading mt-2 text-xl">
                    Choose a shipping option
                  </h2>
                </div>
                <div className="text-xs text-slate-500">
                  Quote expires: {new Date(quote.expires_at).toLocaleTimeString()}
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {quote.rates.map((r) => {
                  const selected = r.rate_id === selectedRateId;
                  const eta =
                    r.delivery_days != null
                      ? `${r.delivery_days} day(s)`
                      : r.estimated_delivery_date
                      ? `ETA ${new Date(r.estimated_delivery_date).toLocaleDateString()}`
                      : "ETA unknown";

                  return (
                    <button
                      key={r.rate_id}
                      type="button"
                      onClick={() => setSelectedRateId(r.rate_id)}
                      className={[
                        "w-full text-left rounded-2xl border px-4 py-4 transition",
                        selected
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 hover:border-slate-400 bg-white",
                      ].join(" ")}
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="text-sm font-semibold text-slate-900">
                            {r.carrier_friendly_name} — {r.service_type}
                          </div>
                          <div className="mt-1 text-xs text-slate-600">{eta}</div>
                        </div>
                        <div className="text-sm font-semibold text-slate-900">
                          {money(r.amount, r.currency)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3 pb-2">
                <button
                  className="btn-primary"
                  onClick={goToCheckout}
                  disabled={loading || !selectedRateId}
                >
                  {loading ? "Creating checkout..." : "Continue to payment"}
                </button>

                <button
                  className="btn-outline"
                  onClick={() => {
                    setQuote(null);
                    setSelectedRateId("");
                  }}
                  disabled={loading}
                >
                  Edit address
                </button>
              </div>

              <div className="text-xs text-slate-500">
                Shipping will appear as a separate line item in Stripe Checkout.
              </div>
            </div>
          ) : null}

          <div className="h-10" style={{ paddingBottom: "env(safe-area-inset-bottom)" as any }} />
        </div>
      </Container>
    </div>
  );
}