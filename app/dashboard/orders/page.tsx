// app/dashboard/orders/page.tsx
import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { supabaseServer } from "@/lib/supabase/server";
import { mustGetOrgId } from "@/lib/org";

function centsToUsd(cents: number) {
  const n = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n / 100);
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

export default async function OrdersPage() {
  const orgId = mustGetOrgId();
  const supabase = await supabaseServer();

  const now = new Date();
  const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString(); // show 90 days

  const { data, error } = await supabase
    .from("v_order_profit")
    .select("order_id, placed_at, status, total_cents, profit_cents")
    .eq("org_id", orgId)
    .gte("placed_at", start)
    .order("placed_at", { ascending: false })
    .limit(250);

  if (error) {
    return (
      <section className="paper-shell">
        <Container className="py-12 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <Card className="text-slate-950">
              <div className="text-sm font-semibold text-slate-950">Orders page error</div>
              <p className="mt-2 text-sm text-slate-700">
                The dashboard can’t load orders yet. This is usually one of:
                missing <code className="px-1 py-0.5 rounded bg-slate-100">v_order_profit</code>,
                RLS blocking the view, or the view referencing a missing table.
              </p>

              <div className="mt-4 rounded-2xl border border-black/10 bg-slate-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Supabase error
                </div>
                <div className="mt-2 text-sm text-slate-900 break-words">{error.message}</div>
                {"details" in error && (error as any).details ? (
                  <div className="mt-2 text-xs text-slate-600 break-words">
                    {(error as any).details}
                  </div>
                ) : null}
                {"hint" in error && (error as any).hint ? (
                  <div className="mt-2 text-xs text-slate-600 break-words">{(error as any).hint}</div>
                ) : null}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button href="/dashboard" className="px-6 py-3">
                  Back to dashboard
                </Button>
                <Button
                  href="/store"
                  variant="secondary"
                  className="px-6 py-3 !bg-white !text-slate-950 !border !border-black/10 hover:!bg-slate-50"
                >
                  Open storefront
                </Button>
              </div>

              <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4 text-xs text-slate-600">
                <div className="font-semibold text-slate-800">Debug</div>
                <div className="mt-2 break-all">org_id: {orgId}</div>
                <div className="mt-2">
                  Try in Supabase SQL editor:
                  <div className="mt-2 whitespace-pre-wrap rounded bg-slate-50 p-3 text-[11px] text-slate-700">
                    {"select * from pg_views where viewname = 'v_order_profit';\nselect * from public.v_order_profit limit 1;"}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    );
  }

  const rows: ProfitRow[] = (data as any) ?? [];

  return (
    <div>
      <section className="ocean-shell hero-bg angle-divider noise">
        <Container className="py-12 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <div className="caps text-[11px] text-white/70">Admin</div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Orders
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/75">
              View and manage orders for your ReefCultures org.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button href="/dashboard" className="px-6 py-3">
                Back to dashboard
              </Button>
              <Button
                href="/store"
                variant="secondary"
                className="px-6 py-3 !bg-white/95 !text-slate-950 !border !border-black/10 hover:!bg-white"
              >
                Open storefront
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="paper-shell">
        <Container className="py-12 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <Card className="text-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-950">Order list</div>
                  <p className="mt-2 text-sm text-slate-700">
                    Click an order to view details, update shipping status, add costs, and track profit.
                  </p>
                </div>

                <div className="text-xs text-slate-600 mt-1">
                  Showing last <span className="font-semibold text-slate-900">90 days</span>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <div className="col-span-4">Order</div>
                  <div className="col-span-3">Placed</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-2 text-right">Profit</div>
                </div>

                {rows.length === 0 ? (
                  <div className="px-4 py-8 text-sm text-slate-700">
                    No orders yet. Once Stripe checkout completes, webhooks will populate orders/payments.
                  </div>
                ) : (
                  <div className="divide-y divide-black/10">
                    {rows.map((r) => (
                      <Link
                        key={r.order_id}
                        href={`/dashboard/orders/${r.order_id}`}
                        className="grid grid-cols-12 gap-2 px-4 py-3 text-sm hover:bg-slate-50 transition"
                      >
                        <div className="col-span-4">
                          <div className="font-semibold text-slate-950">
                            {r.order_id.slice(0, 8).toUpperCase()}
                          </div>
                          <div className="text-xs text-slate-600">
                            Total: {centsToUsd(r.total_cents)}
                          </div>
                        </div>
                        <div className="col-span-3 text-slate-700">{isoToDateLabel(r.placed_at)}</div>
                        <div className="col-span-3 text-slate-700">{r.status}</div>
                        <div className="col-span-2 text-right font-semibold text-slate-950">
                          {centsToUsd(r.profit_cents)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}