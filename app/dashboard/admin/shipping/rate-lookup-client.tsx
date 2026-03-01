// app/dashboard/admin/shipping/rate-lookup-client.tsx
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

const DEFAULTS: Record<
  Exclude<FormState["preset"], "CUSTOM">,
  { w: number; l: number; wi: number; h: number }
> = {
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
      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
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
        "w-full rounded-xl border border-white/10 bg-[#0F1A2E] px-3 py-2 text-sm text-white placeholder:text-white/40 " +
        "focus:outline-none focus:ring-2 focus:ring-[rgba(var(--ocean-500),0.45)] disabled:opacity-60 " +
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
        "w-full rounded-xl border border-white/10 bg-[#0F1A2E] px-3 py-2 text-sm text-white " +
        "focus:outline-none focus:ring-2 focus:ring-[rgba(var(--ocean-500),0.45)] " +
        (props.className || "")
      }
    />
  );
}

// client-side validation helpers
function clean(s: string) {
  return (s || "").trim();
}
function isUSCountry(code: string) {
  const c = clean(code).toUpperCase();
  return c === "US" || c === "USA";
}
function normalizeState2(s: string) {
  return clean(s).toUpperCase().slice(0, 2);
}
function normalizePostal(s: string, country: string) {
  const p = clean(s);
  if (isUSCountry(country)) return p.replace(/[^\d]/g, "").slice(0, 5);
  return p;
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

  // label creation state
  const [printingRateId, setPrintingRateId] = useState<string | null>(null);
  const [printError, setPrintError] = useState<string | null>(null);

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

  function validateForm(): string | null {
    const country = clean(form.country).toUpperCase() || "US";
    const address1 = clean(form.address1);
    const city = clean(form.city);
    const postal = normalizePostal(form.postal, country);
    const state = normalizeState2(form.state);

    if (!address1) return "Address line 1 is required.";
    if (!city) return "City is required.";
    if (!postal) return "Postal code is required.";

    if (isUSCountry(country)) {
      if (state.length !== 2) return "State must be a 2-letter code (e.g., MO).";
      if (postal.length !== 5) return "ZIP must be 5 digits.";
    }

    const w = Number(form.weightOz);
    const l = Number(form.lengthIn);
    const wi = Number(form.widthIn);
    const h = Number(form.heightIn);
    if (!Number.isFinite(w) || w <= 0) return "Weight must be a number greater than 0.";
    if (![l, wi, h].every((n) => Number.isFinite(n) && n > 0))
      return "Dimensions must be numbers greater than 0.";

    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPrintError(null);
    setRates([]);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const country = clean(form.country).toUpperCase() || "US";
      const postal = normalizePostal(form.postal, country);
      const state = normalizeState2(form.state);

      const body = {
        to: {
          name: clean(form.name) || "Store",
          address_line1: clean(form.address1),
          address_line2: clean(form.address2) || undefined,
          city_locality: clean(form.city),
          state_province: state,
          postal_code: postal,
          country_code: country,
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

  async function printLabel(rateId: string) {
    setPrintError(null);
    setPrintingRateId(rateId);

    try {
      const res = await fetch("/api/admin/shipping/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate_id: rateId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to create label");

      const url = data?.label_url as string | undefined;
      if (!url) throw new Error("Label created but no label_url was returned");

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setPrintError(e?.message || "Failed to create label");
    } finally {
      setPrintingRateId(null);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <form onSubmit={onSubmit} className="lg:col-span-5 space-y-5">
        <div className="rounded-2xl border border-white/10 bg-[#0F1A2E] p-5">
          <div className="text-sm font-semibold text-white">Destination</div>

          <div className="mt-4 grid gap-4">
            <Field label="Name">
              <Input
                name="name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onBlur={(e) => setForm((s) => ({ ...s, name: clean(e.target.value) }))}
                placeholder="Store / Customer"
              />
            </Field>

            <Field label="Address line 1">
              <Input
                name="address-line1"
                autoComplete="address-line1"
                value={form.address1}
                onChange={(e) => setForm({ ...form, address1: e.target.value })}
                onBlur={(e) => setForm((s) => ({ ...s, address1: clean(e.target.value) }))}
                placeholder="1488 Page Industrial Blvd"
                required
              />
            </Field>

            <Field label="Address line 2">
              <Input
                name="address-line2"
                autoComplete="address-line2"
                value={form.address2}
                onChange={(e) => setForm({ ...form, address2: e.target.value })}
                onBlur={(e) => setForm((s) => ({ ...s, address2: clean(e.target.value) }))}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City">
                <Input
                  name="address-level2"
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  onBlur={(e) => setForm((s) => ({ ...s, city: clean(e.target.value) }))}
                  placeholder="St. Louis"
                  required
                />
              </Field>

              <Field label="State">
                <Input
                  name="address-level1"
                  autoComplete="address-level1"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  onBlur={(e) =>
                    setForm((s) => ({ ...s, state: normalizeState2(e.target.value) }))
                  }
                  placeholder="MO"
                  required
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Postal code">
                <Input
                  name="postal-code"
                  autoComplete="postal-code"
                  value={form.postal}
                  onChange={(e) => setForm({ ...form, postal: e.target.value })}
                  onBlur={(e) => {
                    const country = clean(form.country).toUpperCase() || "US";
                    setForm((s) => ({ ...s, postal: normalizePostal(e.target.value, country) }));
                  }}
                  placeholder="63132"
                  required
                />
              </Field>

              <Field label="Country">
                <Input
                  name="country"
                  autoComplete="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  onBlur={(e) =>
                    setForm((s) => ({ ...s, country: clean(e.target.value).toUpperCase().slice(0, 2) }))
                  }
                  placeholder="US"
                  required
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0F1A2E] p-5">
          <div className="text-sm font-semibold text-white">Package</div>

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
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0B1220] transition hover:opacity-95 disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Fetching rates…" : "Get rates"}
            </button>

            {error ? (
              <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </form>

      <div className="lg:col-span-7">
        <div className="rounded-2xl border border-white/10 bg-[#0F1A2E] p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Results</div>
              <div className="mt-1 text-xs text-white/60">
                USPS Priority / Express and UPS fast services are shown.
              </div>
            </div>
            <div className="text-xs text-white/60">{rates.length ? `${rates.length} options` : ""}</div>
          </div>

          {printError ? (
            <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {printError}
            </div>
          ) : null}

          <div className="mt-5 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white/60">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-white/60">
                    ETA
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-white/60">
                    Cost
                  </th>
                </tr>
              </thead>

              <tbody>
                {rates.length ? (
                  rates.map((r) => (
                    <tr key={r.rate_id} className="border-t border-white/10">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">
                          {r.carrier_friendly_name || "Carrier"} · {r.service_type}
                        </div>
                        <div className="mt-1 text-xs text-white/60">{r.service_code || r.rate_id}</div>
                      </td>

                      <td className="px-4 py-3 text-white/80">
                        {typeof r.delivery_days === "number" ? (
                          <>
                            {r.delivery_days} day{r.delivery_days === 1 ? "" : "s"}
                          </>
                        ) : r.estimated_delivery_date ? (
                          new Date(r.estimated_delivery_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                          })
                        ) : (
                          "—"
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="font-extrabold text-white">
                          {money(Number(r.amount), (r.currency || "usd").toUpperCase())}
                        </div>

                        <button
                          type="button"
                          onClick={() => printLabel(r.rate_id)}
                          disabled={printingRateId === r.rate_id}
                          className="mt-2 inline-flex items-center justify-center rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B1220] transition hover:opacity-95 disabled:opacity-60"
                          title="Creates (buys) a label in ShipEngine and opens the PDF"
                        >
                          {printingRateId === r.rate_id ? "Creating…" : "Print label"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-sm text-white/60" colSpan={3}>
                      Enter an address and click <span className="font-semibold text-white">Get rates</span>.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-xs text-white/50">
            Tip: Use presets for fast quoting, or switch to{" "}
            <span className="text-white/70">Custom</span> for one-off store shipments.
          </div>
        </div>
      </div>
    </div>
  );
}