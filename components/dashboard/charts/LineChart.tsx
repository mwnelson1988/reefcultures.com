// components/dashboard/charts/LineChart.tsx
"use client";

import * as React from "react";

export type LinePoint = {
  xLabel: string;
  y: number; // already in dollars (or units), NOT cents
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function formatY(v: number, prefix?: string) {
  const p = prefix ?? "";
  // keep it clean: $12, $1.2k
  const abs = Math.abs(v);
  if (abs >= 1000000) return `${p}${(v / 1000000).toFixed(1)}M`;
  if (abs >= 1000) return `${p}${(v / 1000).toFixed(1)}k`;
  return `${p}${Math.round(v)}`;
}

export function LineChart({
  title,
  subtitle,
  seriesA,
  seriesB,
  yPrefix,
}: {
  title: string;
  subtitle?: string;
  seriesA: LinePoint[];
  seriesB?: LinePoint[] | null;
  yPrefix?: string;
}) {
  const W = 960;
  const H = 260;

  const padL = 44;
  const padR = 18;
  const padT = 22;
  const padB = 44;

  const a = seriesA ?? [];
  const b = seriesB ?? null;

  const n = Math.max(a.length, b?.length ?? 0, 2);
  const xs = Array.from({ length: n }, (_, i) => i);

  const values: number[] = [];
  for (const p of a) values.push(Number(p.y) || 0);
  if (b) for (const p of b) values.push(Number(p.y) || 0);

  const minY = Math.min(...values, 0);
  const maxY = Math.max(...values, 1);

  const span = maxY - minY || 1;
  const yMin = minY - span * 0.05;
  const yMax = maxY + span * 0.10;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xAt = (i: number) => padL + (innerW * i) / (n - 1);
  const yAt = (v: number) => {
    const t = (v - yMin) / (yMax - yMin);
    return padT + innerH - innerH * clamp(t, 0, 1);
  };

  function pathFor(series: LinePoint[]) {
    if (!series.length) return "";
    const pts = series.map((p, i) => `${xAt(i)},${yAt(p.y)}`).join(" ");
    // polyline works great and stays fast
    return pts;
  }

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => {
    const t = i / ticks;
    const v = yMin + (yMax - yMin) * (1 - t);
    return { v, y: padT + innerH * t };
  });

  // Show fewer x labels (prevents clutter)
  const xLabelEvery = Math.max(1, Math.floor(n / 6));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-white/60">{subtitle}</div> : null}
        </div>
        <div className="text-xs text-white/60">
          {b ? "A: current • B: compare" : "Current"}
        </div>
      </div>

      <div className="mt-4 w-full overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[260px] w-full">
          {/* grid + y ticks */}
          {yTicks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={padL}
                x2={W - padR}
                y1={t.y}
                y2={t.y}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <text
                x={padL - 10}
                y={t.y + 4}
                textAnchor="end"
                fontSize="11"
                fill="rgba(255,255,255,0.55)"
              >
                {formatY(t.v, yPrefix)}
              </text>
            </g>
          ))}

          {/* x axis labels */}
          {xs.map((i) => {
            const lbl = a[i]?.xLabel ?? b?.[i]?.xLabel ?? "";
            if (!lbl) return null;
            if (i % xLabelEvery !== 0 && i !== n - 1) return null;
            return (
              <text
                key={i}
                x={xAt(i)}
                y={H - 18}
                textAnchor="middle"
                fontSize="11"
                fill="rgba(255,255,255,0.55)"
              >
                {lbl}
              </text>
            );
          })}

          {/* series B (compare) */}
          {b && b.length ? (
            <polyline
              points={pathFor(b)}
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {/* series A (current) */}
          {a.length ? (
            <polyline
              points={pathFor(a)}
              fill="none"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {/* points */}
          {a.map((p, i) => (
            <circle
              key={i}
              cx={xAt(i)}
              cy={yAt(p.y)}
              r="2.2"
              fill="rgba(255,255,255,0.95)"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}