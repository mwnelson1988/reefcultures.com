// components/dashboard/PeriodBar.tsx
"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PeriodParams } from "@/lib/dashboard/period";

type Period = "day" | "week" | "month" | "quarter" | "half" | "year";
type Compare = "none" | "yoy" | "prev";

const PERIODS: { id: Period; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "quarter", label: "Quarter" },
  { id: "half", label: "Half-year" },
  { id: "year", label: "Year" },
];

const COMPARES: { id: Compare; label: string }[] = [
  { id: "none", label: "No compare" },
  { id: "yoy", label: "YoY" },
  { id: "prev", label: "Prev period" },
];

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

type Props = {
  /**
   * Optional: some server pages pass computed params.
   * This component primarily reads from URL query params, but we accept this
   * prop to keep TS happy and to allow future enhancement if desired.
   */
  params?: PeriodParams;
};

export function PeriodBar(_props: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const period = (sp.get("period") as Period) || "month";
  const compare = (sp.get("compare") as Compare) || "none";
  const date = sp.get("date") || todayISO();

  const label = useMemo(() => {
    const c = compare !== "none" ? ` • ${compare.toUpperCase()}` : "";
    return `${period.toUpperCase()} • ${date}${c}`;
  }, [period, date, compare]);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    next.set(key, value);
    if (next.get("compare") === "none") next.delete("compare");
    router.push(`${pathname}?${next.toString()}`);
  }

  function shift(direction: -1 | 1) {
    const d = new Date(date + "T00:00:00");
    if (Number.isNaN(d.getTime())) return;

    switch (period) {
      case "day":
        d.setDate(d.getDate() + direction);
        break;
      case "week":
        d.setDate(d.getDate() + direction * 7);
        break;
      case "month":
        d.setMonth(d.getMonth() + direction);
        break;
      case "quarter":
        d.setMonth(d.getMonth() + direction * 3);
        break;
      case "half":
        d.setMonth(d.getMonth() + direction * 6);
        break;
      case "year":
        d.setFullYear(d.getFullYear() + direction);
        break;
    }

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setParam("date", `${yyyy}-${mm}-${dd}`);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs text-white/70">
          <span className="font-semibold text-white/90">Scope:</span>{" "}
          <span className="font-mono">{label}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => shift(-1)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/80 hover:bg-black/30 transition"
            aria-label="Previous"
            type="button"
          >
            ←
          </button>

          <input
            value={date}
            onChange={(e) => setParam("date", e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/90 outline-none"
            type="date"
          />

          <button
            onClick={() => shift(1)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/80 hover:bg-black/30 transition"
            aria-label="Next"
            type="button"
          >
            →
          </button>

          <select
            value={period}
            onChange={(e) => setParam("period", e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/90 outline-none"
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            value={compare}
            onChange={(e) => setParam("compare", e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/90 outline-none"
          >
            {COMPARES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// Support both default and named imports.
export default PeriodBar;