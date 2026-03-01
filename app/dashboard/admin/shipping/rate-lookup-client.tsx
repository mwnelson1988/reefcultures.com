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

type FormState = {
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  preset: "BOX_16OZ" | "BOX_32OZ" | "BOX_64OZ" | "BOX_1GAL" | "CUSTOM";
  weightOz: string;
  lengthIn: string;
  widthIn: string;
  heightIn: string;
};

const DEFAULTS: Record<Exclude<FormState["preset"], "CUSTOM">, { w: number; l: number; wi: number; h: number }> = {
  BOX_16OZ: { w: 40, l: 10, wi: 8, h: 6 },
  BOX_32OZ: { w: 64, l: 10, wi: 8, h: 6 },
  BOX_64OZ: { w: 96, l: 12, wi: 10, h: 8 },
  BOX_1GAL: { w: 192, l: 12, wi: 12, h: 10 },
};

function money(n: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
  } catch {
    return `$${n.toFixed(2)}`;
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-[rgba(var(--ocean-500),0.45)] " +
        (props.className || "")
      }
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-[rgba(var(--ocean-500),0.45)] " +
        (props.className || "")
      }
    />
  );
}

export default function RateLookupClient() {
  const [form, setForm] = useState<FormState>({
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "MO",
    postal: "",
    country: "US",
    preset: "BOX_16OZ",
    weightOz: String(DEFAULTS.BOX_16OZ.w),
    lengthIn: String(DEFAULTS.BOX_16OZ.l),
    widthIn: String(DEFAULTS.BOX_16OZ.wi),
    heightIn: String(DEFAULTS.BOX_16OZ.h),
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rates, setRates] = useState<Rate[]>([]);

  const dimsDisabled = useMemo(() => form.preset !== "CUSTOM", [form.preset]);

  function applyPreset(p: FormState["preset"]) {
    if (p === "CUSTOM") return;
    const d = DEFAULTS[p];
    setForm((s) => ({
      ...s,
      preset: p,
      weightOz: String(d.w),
      lengthIn: String(d.l),
      widthIn: String(d.wi),
      heightIn: String(d.h),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setRates([]);
    setLoading(true);

    try {
      const body = {
        to: {
          name: form.name || "Store",
          address_line1: form.address1,
          address_line2: form.address2 || undefined,
          city_locality: form.city,
          state_province: form.state,
          postal_code: form.postal,
          country_code: form.country,
        },
        pkg: {
          weight_oz: Number(form.weightOz),
          length_in: Number(form.lengthIn),
          width_in: Number(form.widthIn),
          height_in: Number(form.heightIn),
        },
      };

      const res = await fetch("/api/admin/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to fetch rates");

      setRates(Array.isArray(data?.rates) ? data.rates : []);
      if (!Array.isArray(data?.rates) || !data.rates.length) {
        setError("No rates returned. Double-check the destination and try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch rates");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <form onSubmit={onSubmit} className="lg:col-span-5 space-y-5">
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <div className="text-sm font-semibold">Destination</div>
          <div className="mt-4 grid gap-4">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Store / Customer" />
            </Field>
            <Field label="Address line 1">
              <Input value={form.address1} onChange={(e) => setForm({ ...form, address1: e.target.value })} required />
            </Field>
            <Field label="Address line 2">
              <Input value={form.address2} onChange={(e) => setForm({ ...form, address2: e.target.value })} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City">
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </Field>
              <Field label="State">
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Postal code">
                <Input value={form.postal} onChange={(e) => setForm({ ...form, postal: e.target.value })} required />
              </Field>
              <Field label="Country">
                <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value.toUpperCase() })} required />
              </Field>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <div className="text-sm font-semibold">Package</div>
          <div className="mt-4 grid gap-4">
            <Field label="Preset">
              <Select
                value={form.preset}
                onChange={(e) => {
                  const v = e.target.value as FormState["preset"];
                  if (v === "CUSTOM") setForm((s) => ({ ...s, preset: "CUSTOM" }));
                  else applyPreset(v);
                }}
              >
                <option value="BOX_16OZ">16oz (10×8×6, ~2.5lb)</option>
                <option value="BOX_32OZ">32oz (10×8×6, ~4lb)</option>
                <option value="BOX_64OZ">64oz (12×10×8, ~6lb)</option>
                <option value="BOX_1GAL">1 gal (12×12×10, ~12lb)</option>
                <option value="CUSTOM">Custom</option>
              </Select>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Weight (oz)">
                <Input
                  value={form.weightOz}
                  onChange={(e) => setForm({ ...form, weightOz: e.target.value })}
                  inputMode="numeric"
                  required
                />
              </Field>
              <div className="hidden sm:block" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Length (in)">
                <Input
                  value={form.lengthIn}
                  onChange={(e) => setForm({ ...form, lengthIn: e.target.value })}
                  inputMode="numeric"
                  required
                  disabled={dimsDisabled}
                />
              </Field>
              <Field label="Width (in)">
                <Input
                  value={form.widthIn}
                  onChange={(e) => setForm({ ...form, widthIn: e.target.value })}
                  inputMode="numeric"
                  required
                  disabled={dimsDisabled}
                />
              </Field>
              <Field label="Height (in)">
                <Input
                  value={form.heightIn}
                  onChange={(e) => setForm({ ...form, heightIn: e.target.value })}
                  inputMode="numeric"
                  required
                  disabled={dimsDisabled}
                />
              </Field>
            </div>

            <button
              type="submit"
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-95 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Fetching rates…" : "Get rates"}
            </button>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </form>

      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-ink/10 bg-white p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Results</div>
              <div className="mt-1 text-xs text-ink/60">
                USPS Priority / Express and UPS fast services are shown.
              </div>
            </div>
            <div className="text-xs text-ink/60">{rates.length ? `${rates.length} options` : ""}</div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-ink/10">
            <table className="w-full text-sm">
              <thead className="bg-ink/5">
                <tr>
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
                    <td className="px-4 py-6 text-sm text-ink/60" colSpan={3}>
                      Enter an address and click <span className="font-semibold">Get rates</span>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
