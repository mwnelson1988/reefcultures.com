"use client";

import { useState } from "react";

export default function EbaySyncClient({ daysDefault = 7 }) {
  const [days, setDays] = useState(daysDefault);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function runSync() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/admin/ebay/sync?days=${days}`, {
        method: "POST",
      });

      const raw = await res.text();

      let json: any = null;
      try {
        json = raw ? JSON.parse(raw) : null;
      } catch {
        json = null;
      }

      if (!res.ok) {
        throw new Error(
          json?.error || raw || `Import failed with status ${res.status}`
        );
      }

      setMessage(
        json?.message || `Imported ${json?.imported ?? 0} orders`
      );
    } catch (err: any) {
      setMessage(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold">eBay Import</div>
          <div className="text-xs text-white/60">
            Pull orders directly from the eBay API.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-16 rounded-lg bg-black/30 px-2 py-1 text-sm"
          />
          <div className="text-xs text-white/60">days</div>

          <button
            onClick={runSync}
            disabled={loading}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-60"
          >
            {loading ? "Syncing..." : "Sync Now"}
          </button>
        </div>
      </div>

      {message ? <div className="mt-4 text-sm text-white/80">{message}</div> : null}
    </div>
  );
}
