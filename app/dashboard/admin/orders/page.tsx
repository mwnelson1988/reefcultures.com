// app/dashboard/admin/orders/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { mustGetOrgId } from "@/lib/org";

export const dynamic = "force-dynamic";

function centsToUsd(cents: number) {
  const n = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n / 100);
}

function isoToDateLabel(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

type ProfitRow = {
  order_id: string;
  placed_at: string | null;
  status: string;
  total_cents: number;
  profit_cents: number;
};

export default async function AdminOrdersPage() {
  const orgId = mustGetOrgId();
  const supabase = await supabaseServer();

  const now = new Date();
  const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("v_order_profit")
    .select("order_id, placed_at, status, total_cents, profit_cents")
    .eq("org_id", orgId)
    .gte("placed_at", start)
    .order("placed_at", { ascending: false })
    .limit(250);

  if (error) {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Admin</div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Orders</h1>
          <p className="mt-2 text-sm text-white/70">
            The orders view is currently unavailable. This usually means the view
            <code className="mx-1 rounded bg-black/20 px-1 py-0.5">v_order_profit</code> isn’t present or RLS is blocking it.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Supabase error</div>
          <div className="mt-2 break-words text-sm text-white/85">{error.message}</div>
          <div className="mt-3 text-xs text-white/60 break-all">org_id: {orgId}</div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/70">
          Try in Supabase SQL editor:
          <div className="mt-2 whitespace-pre-wrap rounded bg-black/20 p-3 font-mono text-[11px] text-white/75">
            {"select * from pg_views where viewname = 'v_order_profit';\nselect * from public.v_order_profit limit 1;"}
          </div>
        </div>
      </div>
    );
  }

  const rows: ProfitRow[] = (data as any) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Admin</div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Orders</h1>
        <p className="mt-2 text-sm text-white/70">Last 90 days of orders with revenue and profit rollups.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="grid grid-cols-12 gap-2 bg-black/20 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-white/60">
          <div className="col-span-4">Order</div>
          <div className="col-span-3">Placed</div>
          <div className="col-span-3">Status</div>
          <div className="col-span-2 text-right">Profit</div>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-10 text-sm text-white/70">
            No orders yet. Once Stripe checkout completes, webhooks will populate orders/payments.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {rows.map((r) => (
              <Link
                key={r.order_id}
                href={`/dashboard/admin/orders/${r.order_id}`}
                className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-white/85 transition hover:bg-white/[0.06]"
              >
                <div className="col-span-4">
                  <div className="font-semibold text-white">{r.order_id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-xs text-white/60">Total: {centsToUsd(r.total_cents)}</div>
                </div>
                <div className="col-span-3 text-white/70">{isoToDateLabel(r.placed_at)}</div>
                <div className="col-span-3 text-white/70">{r.status}</div>
                <div className="col-span-2 text-right font-semibold text-white">
                  {centsToUsd(r.profit_cents)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
