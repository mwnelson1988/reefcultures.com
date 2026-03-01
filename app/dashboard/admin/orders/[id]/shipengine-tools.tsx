"use client";

import { useMemo, useState } from "react";

type Rate = {
  rate_id: string;
  carrier_friendly_name?: string;
  service_type: string;
  service_code?: string;
  amount: number;
  currency: string;
  delivery_days?: number | null;
  estimated_delivery_date?: string | null;
};

type Suggested = {
  preset: string;
  weight_oz: number;
  length_in: number;
  width_in: number;
  height_in: number;
};

type Pkg = {
  weight_oz: number;
  length_in: number;
  width_in: number;
  height_in: number;
};

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

export default function ShipEngineTools({ orderId }: { orderId: string }) {
  const [loadingRates, setLoadingRates] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggested, setSuggested] = useState<Suggested | null>(null);
  const [pkg, setPkg] = useState<Pkg | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);
  const [selectedRate, setSelectedRate] = useState<string | null>(null);
  const [labelUrl, setLabelUrl] = useState<string | null>(null);
  const [tracking, setTracking] = useState<string | null>(null);

  const pkgState = useMemo(() => {
    const p = pkg || suggested;
    return {
      weight_oz: p?.weight_oz ?? 0,
      length_in: p?.length_in ?? 0,
      width_in: p?.width_in ?? 0,
      height_in: p?.height_in ?? 0,
    };
  }, [pkg, suggested]);

  async function fetchRates() {
    setError(null);
    setLabelUrl(null);
    setTracking(null);
    setSelectedRate(null);
    setRates([]);
    setLoadingRates(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/shipengine/rates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pkg: pkg }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to fetch rates");

      setSuggested(data?.suggested || null);
      setPkg(data?.pkg || null);
      setRates(Array.isArray(data?.rates) ? data.rates : []);
      if (!Array.isArray(data?.rates) || !data.rates.length) {
        setError("No rates returned. Check carriers enabled in ShipEngine.");
      }
    } catch (e: any) {
      setError(e?.message || "Failed to fetch rates");
    } finally {
      setLoadingRates(false);
    }
  }

  async function buyLabel() {
    if (!selectedRate) return;

    setError(null);
    setLabelUrl(null);
    setTracking(null);
    setLoadingLabel(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/shipengine/label`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate_id: selectedRate }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to create label");

      setLabelUrl(data?.label_pdf || data?.label_png || null);
      setTracking(data?.tracking_number || null);

      if (data?.warning) {
        setError(String(data.warning));
      }

      // Open label in a new tab automatically (best UX for printing).
      const url = data?.label_pdf || data?.label_png;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setError(e?.message || "Failed to create label");
    } finally {
      setLoadingLabel(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-border/10 bg-paper-2 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-ink/55">
            ShipEngine
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">Quote rates + buy a label</div>
          <div className="mt-1 text-xs text-ink/60">
            Uses the order’s ship-to address and your SHIP_FROM_* origin.
          </div>
        </div>

        <button
          onClick={fetchRates}
          disabled={loadingRates}
          className="inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-95 disabled:opacity-60"
        >
          {loadingRates ? "Fetching…" : "Get rates"}
        </button>
      </div>

      {suggested ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <Field label="Preset" value={suggested.preset} />
          <Field label="Weight (oz)" value={String(pkgState.weight_oz)} editable onChange={(v) => setPkg({ ...pkgState, weight_oz: Number(v) })} />
          <Field label="Dims (in)" value={`${pkgState.length_in}×${pkgState.width_in}×${pkgState.height_in}`} />
          <button
            type="button"
            onClick={() => setPkg(suggested)}
            className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink hover:bg-ink/5"
          >
            Reset
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="mt-4 overflow-hidden rounded-xl border border-ink/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink/5">
            <tr>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                Select
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                Service
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                ETA
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-ink/60">
                Cost
              </th>
            </tr>
          </thead>
          <tbody>
            {rates.length ? (
              rates.map((r) => (
                <tr key={r.rate_id} className="border-t border-ink/10">
                  <td className="px-4 py-3">
                    <input
                      type="radio"
                      name="rate"
                      checked={selectedRate === r.rate_id}
                      onChange={() => setSelectedRate(r.rate_id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-ink">
                      {r.carrier_friendly_name || "Carrier"} · {r.service_type}
                    </div>
                    <div className="mt-1 text-xs text-ink/60">{r.service_code || r.rate_id}</div>
                  </td>
                  <td className="px-4 py-3 text-ink/80">
                    {typeof r.delivery_days === "number" ? (
                      <>{r.delivery_days} day{r.delivery_days === 1 ? "" : "s"}</>
                    ) : r.estimated_delivery_date ? (
                      new Date(r.estimated_delivery_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                      })
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-ink">
                    {money(Number(r.amount), (r.currency || "usd").toUpperCase())}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-sm text-ink/60">
                  Click <span className="font-semibold">Get rates</span> to load options.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-ink/60">
          {tracking ? (
            <span>
              Tracking: <span className="font-semibold text-ink">{tracking}</span>
            </span>
          ) : null}
          {labelUrl ? (
            <span className="ml-3">
              Label: <a className="underline" href={labelUrl} target="_blank" rel="noreferrer">open</a>
            </span>
          ) : null}
        </div>

        <button
          onClick={buyLabel}
          disabled={!selectedRate || loadingLabel}
          className="inline-flex items-center justify-center rounded-xl bg-[rgb(var(--ocean-700))] px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-95 disabled:opacity-60"
        >
          {loadingLabel ? "Buying…" : "Buy label"}
        </button>
      </div>

      <div className="mt-3 text-xs text-ink/60">
        Tip: After printing, paste tracking into the shipment form above (or we can auto-fill that
        next).
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable?: boolean;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-ink/10 bg-white px-3 py-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/55">{label}</div>
      {editable ? (
        <input
          className="mt-1 w-full rounded-lg border border-ink/10 bg-white px-2 py-1 text-sm font-semibold text-ink"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          inputMode="numeric"
        />
      ) : (
        <div className="mt-1 text-sm font-semibold text-ink">{value}</div>
      )}
    </div>
  );
}
