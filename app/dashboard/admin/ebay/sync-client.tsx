"use client";

import { useState } from "react";

type SyncResult = {
  imported: number;
  skipped: number;
  message?: string;
};

export default function EbayClient() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);

  async function syncNow() {
    setLoading(true);
    setMsg(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/ebay/sync", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Sync failed");

      setResult({
        imported: Number(data?.imported || 0),
        skipped: Number(data?.skipped || 0),
        message: data?.message,
      });

      if (data?.message) setMsg(String(data.message));
    } catch (e: any) {
      setMsg(e?.message || "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 text-slate-900 shadow-sm ring-1 ring-black/5 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100 dark:ring-white/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Import</div>
          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Your eBay Developer account must be approved and env vars configured.
          </div>
        </div>

        <button
          onClick={syncNow}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-95 disabled:opacity-60 dark:bg-white dark:text-slate-900"
        >
          {loading ? "Syncing…" : "Sync now"}
        </button>
      </div>

      {msg ? (
        <div className="mt-4 rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-100">
          {msg}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Kpi label="Imported" value={String(result.imported)} />
          <Kpi label="Skipped" value={String(result.skipped)} />
          <Kpi label="Status" value="OK" />
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100">
        <div className="font-semibold">Not approved yet?</div>
        <div className="mt-1">
          If eBay says your Developer account is pending approval, that’s normal. Once approved,
          add{" "}
          <span className="font-mono text-[12px]">EBAY_CLIENT_ID</span>,{" "}
          <span className="font-mono text-[12px]">EBAY_CLIENT_SECRET</span>, and{" "}
          <span className="font-mono text-[12px]">EBAY_REFRESH_TOKEN</span> to your environment.
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 text-slate-900 shadow-sm ring-1 ring-black/5 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-100 dark:ring-white/10">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}