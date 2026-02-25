// components/dashboard/SubscriptionCard.tsx
"use client";

import { useMemo, useState } from "react";

type Sub = {
  statusLabel: string;
  statusHint: string;
  planLabel: string;
  nextShipLabel: string;
  nextShipHint: string;
};

function statusTone(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("active")) return "ok";
  if (s.includes("trial")) return "trial";
  if (s.includes("past")) return "warn";
  if (s.includes("cancel") || s.includes("paused") || s.includes("inactive")) return "muted";
  return "muted";
}

export default function SubscriptionCard({ subscription }: { subscription: Sub }) {
  const [loading, setLoading] = useState(false);

  const tone = useMemo(() => statusTone(subscription.statusLabel), [subscription.statusLabel]);

  async function openPortal() {
    try {
      setLoading(true);

      // Keep it simple: server already sets return_url to /dashboard
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error((data as any)?.error || "Portal request failed");
      if (!(data as any)?.url) throw new Error("Missing portal URL");

      window.location.href = (data as any).url;
    } catch (e) {
      console.error(e);
      alert("Could not open billing. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const pill =
    tone === "ok"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
      : tone === "trial"
      ? "border-sky-500/20 bg-sky-500/10 text-sky-700"
      : tone === "warn"
      ? "border-amber-500/20 bg-amber-500/10 text-amber-800"
      : "border-black/10 bg-black/[0.03] text-[rgb(var(--ink-700))]";

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold tracking-tight">Subscription</h3>
          <p className="mt-1 text-sm text-[rgb(var(--ink-700))]">
            Keep your reef fed automatically.
          </p>
        </div>

        <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${pill}`}>
          {subscription.statusLabel}
        </span>
      </div>

      {/* Body (less nested boxes, cleaner hierarchy) */}
      <div className="mt-4">
        <div className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-[rgb(var(--ink-700))]">
            Plan
          </div>
          <div className="mt-1 text-sm font-extrabold">{subscription.planLabel}</div>

          <div className="mt-4 flex items-start justify-between gap-4 border-t border-black/10 pt-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[rgb(var(--ink-700))]">
                Next shipment
              </div>
              <div className="mt-1 text-sm font-extrabold">{subscription.nextShipLabel}</div>
              <div className="mt-1 text-xs text-[rgb(var(--ink-700))]">
                {subscription.nextShipHint}
              </div>
            </div>

            {/* Small “hint” area instead of another card */}
            <div className="hidden sm:block text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[rgb(var(--ink-700))]">
                Status
              </div>
              <div className="mt-1 text-xs text-[rgb(var(--ink-700))]">
                {subscription.statusHint}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs (clear + consistent) */}
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={openPortal}
          disabled={loading}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-[rgb(var(--ocean-950))] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Opening…" : "Manage subscription"}
        </button>

        <a
          href="/store"
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-black/[0.02]"
        >
          Shop add-ons
        </a>
      </div>

      {/* Tiny footer note (optional but adds “premium” polish) */}
      <div className="mt-3 text-xs text-[rgb(var(--ink-700))]">
        Update payment method, shipping details, or cancel anytime in billing.
      </div>
    </div>
  );
}