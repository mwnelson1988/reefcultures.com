"use client";

import { useState } from "react";

export function ShipStationSyncButton({
  daysDefault = 7,
}: {
  daysDefault?: number;
}) {
  const [days, setDays] = useState<number>(daysDefault);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.set("days", String(days));
      const res = await fetch("/api/admin/integrations/shipstation/sync", {
        method: "POST",
        body: form,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Sync failed");

      setMsg(
        `Synced: ${json.upserted ?? 0} orders (fetched ${json.fetched ?? 0}, items ${json.items_written ?? 0}).`
      );
    } catch (e: any) {
      setMsg(e?.message || "Sync failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="flex items-center gap-2">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
          eBay Sync
        </div>
        <input
          type="number"
          min={1}
          max={60}
          value={days}
          onChange={(e) => setDays(Math.max(1, Math.min(60, Number(e.target.value) || 7)))}
          className="w-20 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none ring-0"
        />
        <div className="text-xs text-white/60">days</div>
      </div>

      <button
        onClick={run}
        disabled={loading}
        className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
      >
        {loading ? "Syncing…" : "Sync from ShipStation"}
      </button>

      {msg ? <div className="text-xs text-white/70">{msg}</div> : null}
    </div>
  );
}
