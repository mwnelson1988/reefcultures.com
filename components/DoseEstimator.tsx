"use client";

import { useMemo, useState } from "react";

type DoseEstimatorProps = {
  compact?: boolean;
};

function formatRange(min: number, max: number) {
  const round = (value: number) => {
    if (value < 10) return Math.round(value * 10) / 10;
    return Math.round(value);
  };

  return `${round(min)}–${round(max)} mL`;
}

export default function DoseEstimator({ compact = false }: DoseEstimatorProps) {
  const [gallons, setGallons] = useState(75);

  const result = useMemo(() => {
    const low = gallons * 0.25;
    const medium = gallons * 0.5;
    const high = gallons * 0.75;

    return {
      light: formatRange(low * 0.6, low),
      standard: formatRange(low, medium),
      heavy: formatRange(medium, high),
    };
  }, [gallons]);

  return (
    <div
      className={[
        "rounded-3xl border border-white/10 bg-white/[0.03] ring-1 ring-white/[0.06]",
        compact ? "p-5" : "p-6 sm:p-7",
      ].join(" ")}
    >
      <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">
        Dosing estimator
      </div>
      <div className="mt-2 text-xl font-semibold text-white">
        Start with system volume, then adjust to response.
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/72">
        A practical starting point for refrigerated live phytoplankton is to begin
        modestly, build consistency, and scale up only as your reef shows demand.
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <label className="text-[11px] uppercase tracking-[0.22em] text-white/55">
            Tank size
          </label>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={400}
              step={5}
              value={gallons}
              onChange={(e) => setGallons(Number(e.target.value))}
              className="w-full accent-white"
            />
            <div className="min-w-[86px] rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-sm font-semibold text-white">
              {gallons} gal
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-white/52">
            Begin conservatively. Monitor nutrient load, skimmer behavior, water
            clarity, and livestock response before increasing daily volume.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {[
            ["Light routine", result.light],
            ["Standard routine", result.standard],
            ["Heavy feeding", result.heavy],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4"
            >
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/52">
                {label}
              </div>
              <div className="mt-2 text-base font-semibold text-white">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
