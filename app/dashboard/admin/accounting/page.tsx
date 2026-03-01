// app/dashboard/admin/accounting/page.tsx
import { mustGetOrgId } from "@/lib/org";
import { supabaseServer } from "@/lib/supabase/server";
import {
  getPeriodParams,
  getPeriodWindow,
  bucketKindForPeriod,
  toISODate,
  monthKey,
} from "@/lib/dashboard/period";
import PeriodBar from "@/components/dashboard/PeriodBar";
import { LineChart, LinePoint } from "@/components/dashboard/charts/LineChart";
import { fetchProfitRows } from "@/lib/dashboard/profit";
import { getStripeRevenueSummary } from "@/lib/dashboard/stripeRevenue";

export const dynamic = "force-dynamic";

function centsToUsd(cents: number) {
  const n = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n / 100);
}

function shortDateLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function shortMonthLabel(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-").map((x) => Number(x));
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

type ProfitRow = {
  placed_at: string | null;
  total_cents: number;
  profit_cents: number;
};

function makeBucketKeys(start: Date, end: Date, kind: "day" | "month") {
  const keys: string[] = [];
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);

  if (kind === "month") {
    d.setDate(1);
    while (d < end) {
      keys.push(monthKey(d));
      d.setMonth(d.getMonth() + 1);
    }
    return keys;
  }

  while (d < end) {
    keys.push(toISODate(d));
    d.setDate(d.getDate() + 1);
  }
  return keys;
}

function bucketize(rows: ProfitRow[], kind: "day" | "month") {
  const map = new Map<string, { revenue: number; profit: number }>();
  for (const r of rows) {
    if (!r.placed_at) continue;
    const dt = new Date(r.placed_at);
    if (Number.isNaN(dt.getTime())) continue;
    const key = kind === "month" ? monthKey(dt) : toISODate(dt);
    const cur = map.get(key) || { revenue: 0, profit: 0 };
    cur.revenue += r.total_cents || 0;
    cur.profit += r.profit_cents || 0;
    map.set(key, cur);
  }
  return map;
}

export default async function AccountingPage({
  searchParams,
}: {
  // Next.js 15: searchParams can be async
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const orgId = mustGetOrgId();
  const supabase = await supabaseServer();

  const sp = (await searchParams) ?? {};
  const params = getPeriodParams(sp);
  const win = getPeriodWindow(params);
  const kind = bucketKindForPeriod(params.period);

  const curRes = await fetchProfitRows({
    supabase,
    orgId,
    startIso: win.currentStart.toISOString(),
    endIso: win.currentEnd.toISOString(),
    limit: 5000,
  });

  const current = (curRes.rows as any as ProfitRow[]) ?? [];
  const curRevenue = current.reduce((s, r) => s + (r.total_cents || 0), 0);
  const curProfit = current.reduce((s, r) => s + (r.profit_cents || 0), 0);
  const curOrders = current.length;
  const curAov = curOrders ? Math.round(curRevenue / curOrders) : 0;

  let compareRevenue = 0;
  let compareProfit = 0;
  let compareOrders = 0;

  let compareSeriesRevenue: LinePoint[] | null = null;
  let compareSeriesProfit: LinePoint[] | null = null;

  const keys = makeBucketKeys(win.currentStart, win.currentEnd, kind);

  const curBuckets = bucketize(current, kind);
  const curSeriesRevenue: LinePoint[] = keys.map((k) => ({
    xLabel: kind === "month" ? shortMonthLabel(k) : shortDateLabel(k),
    y: Math.round((curBuckets.get(k)?.revenue ?? 0) / 100),
  }));
  const curSeriesProfit: LinePoint[] = keys.map((k) => ({
    xLabel: kind === "month" ? shortMonthLabel(k) : shortDateLabel(k),
    y: Math.round((curBuckets.get(k)?.profit ?? 0) / 100),
  }));

  if (win.compareStart && win.compareEnd) {
    const cmpRes = await fetchProfitRows({
      supabase,
      orgId,
      startIso: win.compareStart.toISOString(),
      endIso: win.compareEnd.toISOString(),
      limit: 5000,
    });

    const cmp = (cmpRes.rows as any as ProfitRow[]) ?? [];
    compareRevenue = cmp.reduce((s, r) => s + (r.total_cents || 0), 0);
    compareProfit = cmp.reduce((s, r) => s + (r.profit_cents || 0), 0);
    compareOrders = cmp.length;

    const cmpBuckets = bucketize(cmp, kind);
    compareSeriesRevenue = keys.map((k) => ({
      xLabel: kind === "month" ? shortMonthLabel(k) : shortDateLabel(k),
      y: Math.round((cmpBuckets.get(k)?.revenue ?? 0) / 100),
    }));
    compareSeriesProfit = keys.map((k) => ({
      xLabel: kind === "month" ? shortMonthLabel(k) : shortDateLabel(k),
      y: Math.round((cmpBuckets.get(k)?.profit ?? 0) / 100),
    }));
  }

  const deltaPct = (a: number, b: number) => {
    if (!b) return null;
    return ((a - b) / b) * 100;
  };

  const revenueDelta = win.compareStart ? deltaPct(curRevenue, compareRevenue) : null;
  const profitDelta = win.compareStart ? deltaPct(curProfit, compareProfit) : null;

  const stripeSummary = await getStripeRevenueSummary({
    start: win.currentStart,
    end: win.currentEnd,
  }).catch(() => null);

  return (
    <div className="space-y-6">
      <PeriodBar params={params} />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Accounting</div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">Revenue & Profit</div>
        <div className="mt-2 text-sm text-white/70">
          Switch day/week/month/quarter/half/year and optionally compare YoY or previous period.
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Revenue" value={centsToUsd(curRevenue)} delta={revenueDelta} />
          <Kpi label="Profit" value={centsToUsd(curProfit)} delta={profitDelta} />
          <Kpi
            label="Orders"
            value={String(curOrders)}
            delta={win.compareStart ? deltaPct(curOrders, compareOrders) : null}
          />
          <Kpi label="AOV" value={centsToUsd(curAov)} delta={null} />
        </div>

        {!curRes.usedView ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/75">
            Profit is being computed from <span className="font-semibold text-white">orders</span>
            because <code className="mx-1 rounded bg-black/30 px-1 py-0.5 text-xs">v_order_profit</code> isn’t available.
          </div>
        ) : null}

        {stripeSummary ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Stripe reconciliation</div>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <MiniKpi label="Gross" value={centsToUsd(stripeSummary.gross_cents)} />
              <MiniKpi label="Fees" value={centsToUsd(stripeSummary.fee_cents)} />
              <MiniKpi label="Net" value={centsToUsd(stripeSummary.net_cents)} />
            </div>
            <div className="mt-2 text-xs text-white/60">Source: Stripe balance transactions in the selected window.</div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/60">
            Stripe reconciliation is unavailable (missing Stripe key, permissions, or no balance transactions yet).
          </div>
        )}
      </div>

      <LineChart
        title="Revenue trend"
        subtitle={win.compareStart ? "Current vs compare" : "Current period"}
        seriesA={curSeriesRevenue}
        seriesB={compareSeriesRevenue}
        yPrefix="$"
      />

      <LineChart
        title="Profit trend"
        subtitle={win.compareStart ? "Current vs compare" : "Current period"}
        seriesA={curSeriesProfit}
        seriesB={compareSeriesProfit}
        yPrefix="$"
      />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="text-sm font-semibold text-white">Notes</div>
        <div className="mt-2 text-sm text-white/70">
          If profit looks off, verify your per-item costs and fees are being written consistently.
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta }: { label: string; value: string; delta: number | null }) {
  const showDelta = typeof delta === "number" && Number.isFinite(delta);
  const sign = showDelta ? (delta >= 0 ? "+" : "") : "";
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-xs text-white/70">
        {showDelta ? <span className="font-semibold text-white">{sign}{delta.toFixed(1)}%</span> : <span>—</span>}
      </div>
    </div>
  );
}

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-1 text-lg font-extrabold tracking-tight text-white">{value}</div>
    </div>
  );
}
