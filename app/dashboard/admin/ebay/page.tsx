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
    <div className="rounded-2xl border border-white/10 bg-[#0F1A2E] p-5 text-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-semibold text-white">Import</div>
          <div className="mt-1 text-xs text-white/60">
            Your eBay Developer account must be approved and env vars configured.
          </div>
        </div>

        <button
          onClick={syncNow}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-[#0B1220] transition hover:opacity-95 disabled:opacity-60"
        >
          {loading ? "Syncing…" : "Sync now"}
        </button>
      </div>

      {msg ? (
        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white">
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

      <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
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
    <div className="rounded-2xl border border-white/10 bg-[#0B1220] p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">{value}</div>
    </div>
  );
}