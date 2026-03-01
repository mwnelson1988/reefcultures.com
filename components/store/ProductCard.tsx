"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import type { Product } from "@/lib/store/products";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type Rate = {
  object_id: string;
  provider: string;
  servicelevel_name: string;
  servicelevel_token: string;
  amount: string;
  currency: string;
  estimated_days: number | null;
  duration_terms: string | null;
};

export function ProductCard({ product }: { product: Product }) {
  const [qty, setQty] = useState<number>(1);

  // Shipping modal state
  const [open, setOpen] = useState(false);
  const [loadingRates, setLoadingRates] = useState(false);
  const [rates, setRates] = useState<Rate[]>([]);
  const [shipmentId, setShipmentId] = useState<string>("");
  const [rateId, setRateId] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [addr, setAddr] = useState({
    name: "",
    street1: "",
    street2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const price = useMemo(() => (product.priceCents / 100).toFixed(2), [product.priceCents]);
  const total = useMemo(() => ((product.priceCents * qty) / 100).toFixed(2), [product.priceCents, qty]);

  const selectedRate = useMemo(() => rates.find((r) => r.object_id === rateId) || null, [rates, rateId]);

  async function getRates() {
    setError("");
    setRates([]);
    setShipmentId("");
    setRateId("");
    setLoadingRates(true);

    try {
      const res = await fetch("/api/shipping-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: qty,
          address: {
            name: addr.name || "Customer",
            street1: addr.street1,
            street2: addr.street2 || undefined,
            city: addr.city,
            state: addr.state,
            zip: addr.zip,
            country: addr.country || "US",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not fetch shipping rates.");
        return;
      }

      const nextRates = Array.isArray(data?.rates) ? (data.rates as Rate[]) : [];
      if (!nextRates.length) {
        setError("No shipping rates returned. Double-check the address.");
        return;
      }

      setRates(nextRates);
      setShipmentId(String(data?.shipment_object_id || ""));
      setRateId(nextRates[0].object_id);
    } catch (e: any) {
      setError(e?.message || "Could not fetch shipping rates.");
    } finally {
      setLoadingRates(false);
    }
  }

  function closeModal() {
    setOpen(false);
    setError("");
    setLoadingRates(false);
    setRates([]);
    setShipmentId("");
    setRateId("");
  }

  return (
    <Card className="p-6 flex flex-col">
      <div className="flex items-center justify-center">
        <div className="relative h-[340px] w-[240px]">
          <Image src={product.image} alt={product.name} fill className="object-contain" priority={false} />
        </div>
      </div>

      <div className="mt-4 text-xl font-semibold text-center">{product.name}</div>
      <div className="mt-3 text-sm opacity-80 text-center">{product.description}</div>

      <ul className="mt-4 space-y-2 text-sm">
        {product.bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-black/5 border border-border/12 text-xs">
              ✓
            </span>
            <span className="opacity-90">{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-end justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide opacity-70">Price</div>
          <div className="text-3xl font-extrabold">${price}</div>
        </div>

        <div className="text-right">
          <div className="text-xs uppercase tracking-wide opacity-70">Quantity</div>
          <div className="mt-2 inline-flex items-center rounded-xl border border-border/12 bg-white/70 overflow-hidden">
            <button
              type="button"
              className="px-3 py-2 text-sm hover:bg-black/5 transition"
              onClick={() => setQty((q) => clamp(q - 1, 1, 10))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-12 bg-transparent text-center text-sm outline-none py-2"
              value={qty}
              onChange={(e) => {
                const next = Number(e.target.value.replace(/[^0-9]/g, ""));
                setQty(clamp(Number.isFinite(next) && next > 0 ? next : 1, 1, 10));
              }}
              aria-label="Quantity"
            />
            <button
              type="button"
              className="px-3 py-2 text-sm hover:bg-black/5 transition"
              onClick={() => setQty((q) => clamp(q + 1, 1, 10))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <div className="mt-2 text-xs opacity-70">
            Total: <span className="font-semibold opacity-100">${total}</span>
          </div>
        </div>
      </div>

      <Button
        type="button"
        className="w-full py-3 text-base rounded-2xl mt-6"
        onClick={() => {
          setError("");
          setOpen(true);
          // Prefill ship-from ZIP shown by user? not needed
        }}
      >
        Checkout
      </Button>

      <div className="mt-3 text-xs opacity-70 text-center">Live shipping rates • Ships to US addresses</div>

      {/* Shipping modal */}
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close"
            onClick={closeModal}
          />
          <div className="relative w-[min(92vw,720px)] rounded-2xl border border-white/10 bg-ocean-950 p-6 shadow-2xl text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-semibold">Shipping & Checkout</div>
                <div className="mt-1 text-sm opacity-80">
                  Enter your shipping address to pull real-time carrier rates, then continue to secure checkout.
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-border/12 bg-white/70 px-3 py-2 text-sm hover:bg-black/5 transition"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-wide opacity-70">Name (optional)</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border/12 bg-white/70 px-3 py-2 text-sm outline-none"
                  value={addr.name}
                  onChange={(e) => setAddr((a) => ({ ...a, name: e.target.value }))}
                  placeholder="Full name"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-wide opacity-70">Street Address</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border/12 bg-white/70 px-3 py-2 text-sm outline-none"
                  value={addr.street1}
                  onChange={(e) => setAddr((a) => ({ ...a, street1: e.target.value }))}
                  placeholder="123 Main St"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs uppercase tracking-wide opacity-70">Apt / Suite (optional)</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border/12 bg-white/70 px-3 py-2 text-sm outline-none"
                  value={addr.street2}
                  onChange={(e) => setAddr((a) => ({ ...a, street2: e.target.value }))}
                  placeholder="Apt 2B"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide opacity-70">City</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border/12 bg-white/70 px-3 py-2 text-sm outline-none"
                  value={addr.city}
                  onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))}
                  placeholder="O'Fallon"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide opacity-70">State</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border/12 bg-white/70 px-3 py-2 text-sm outline-none"
                  value={addr.state}
                  onChange={(e) => setAddr((a) => ({ ...a, state: e.target.value.toUpperCase().slice(0, 2) }))}
                  placeholder="MO"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide opacity-70">ZIP</label>
                <input
                  className="mt-2 w-full rounded-xl border border-border/12 bg-white/70 px-3 py-2 text-sm outline-none"
                  value={addr.zip}
                  onChange={(e) => setAddr((a) => ({ ...a, zip: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) }))}
                  placeholder="63368"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wide opacity-70">Country</label>
                <select
                  className="mt-2 w-full rounded-xl border border-border/12 bg-white/70 px-3 py-2 text-sm outline-none"
                  value={addr.country}
                  onChange={(e) => setAddr((a) => ({ ...a, country: e.target.value }))}
                >
                  <option value="US">United States</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
              <Button type="button" className="md:w-auto" onClick={getRates} disabled={loadingRates}>
                {loadingRates ? "Getting rates…" : "Get real-time rates"}
              </Button>

              <div className="text-sm opacity-80">
                Quantity: <span className="font-semibold">{qty}</span> • Item total: <span className="font-semibold">${total}</span>
              </div>
            </div>

            {error ? (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}

            {rates.length ? (
              <div className="mt-6">
                <div className="text-sm font-semibold">Select shipping</div>
                <div className="mt-3 grid gap-2">
                  {rates.map((r) => {
                    const cents = Math.round(Number(r.amount) * 100);
                    const dollars = Number.isFinite(cents) ? (cents / 100).toFixed(2) : r.amount;
                    const label = `${r.provider} • ${r.servicelevel_name}`;
                    const eta =
                      r.estimated_days != null
                        ? `${r.estimated_days} business day${r.estimated_days === 1 ? "" : "s"}`
                        : (r.duration_terms || "");
                    return (
                      <label
                        key={r.object_id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border/12 bg-white/5/40 px-4 py-3 hover:bg-black/5 transition"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            name={`rate-${product.id}`}
                            value={r.object_id}
                            checked={rateId === r.object_id}
                            onChange={() => setRateId(r.object_id)}
                            className="mt-1"
                          />
                          <div>
                            <div className="text-sm font-semibold">{label}</div>
                            {eta ? <div className="text-xs opacity-75">{eta}</div> : null}
                          </div>
                        </div>
                        <div className="text-sm font-semibold">${dollars}</div>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="text-sm opacity-85">
                    Shipping: <span className="font-semibold">${selectedRate ? Number(selectedRate.amount).toFixed(2) : "—"}</span>
                    <span className="opacity-70"> • Taxes calculated at checkout</span>
                  </div>

                  {/* Submit to Stripe Checkout */}
                  <form action="/api/checkout" method="post" className="md:w-[280px]">
                    <input type="hidden" name="productId" value={product.id} />
                    <input type="hidden" name="quantity" value={String(qty)} />
                    <input type="hidden" name="shipmentObjectId" value={shipmentId} />
                    <input type="hidden" name="rateObjectId" value={rateId} />

                    <input type="hidden" name="name" value={addr.name || "Customer"} />
                    <input type="hidden" name="street1" value={addr.street1} />
                    <input type="hidden" name="street2" value={addr.street2} />
                    <input type="hidden" name="city" value={addr.city} />
                    <input type="hidden" name="state" value={addr.state} />
                    <input type="hidden" name="zip" value={addr.zip} />
                    <input type="hidden" name="country" value={addr.country || "US"} />

                    <Button type="submit" className="w-full py-3 text-base rounded-2xl" disabled={!rateId}>
                      Continue to checkout
                    </Button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
