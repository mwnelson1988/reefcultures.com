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
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold">Import</div>
          <div className="mt-1 text-xs text-ink/60">
            Your eBay Developer account must be approved and env vars configured.
          </div>
        </div>
        <button
          onClick={syncNow}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-ink px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Syncing…" : "Sync now"}
        </button>
      </div>

      {msg ? (
        <div className="mt-4 rounded-xl border border-ink/10 bg-ink/5 px-4 py-3 text-sm text-ink">
          {msg}
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Kpi label="Imported" value={String(result.imported)} />
          <Kpi label="Skipped" value={String(result.skipped)} />
          <Kpi label="Status" value={result.message ? "OK" : "OK"} />
        </div>
      ) : null}

      <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <div className="font-semibold">Not approved yet?</div>
        <div className="mt-1">
          If eBay says your Developer account is pending approval, that’s normal. Once approved,
          add <span className="font-mono text-[12px]">EBAY_CLIENT_ID</span>,
          <span className="font-mono text-[12px]"> EBAY_CLIENT_SECRET</span>, and
          <span className="font-mono text-[12px]"> EBAY_REFRESH_TOKEN</span> to your environment.
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">{label}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-ink">{value}</div>
    </div>
  );
}
