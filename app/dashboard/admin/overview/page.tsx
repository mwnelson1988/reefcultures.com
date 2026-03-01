import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { supabaseServer } from "@/lib/supabase/server";
import { mustGetOrgId } from "@/lib/org";
import { isAdmin } from "@/lib/auth/isAdmin";

function centsToUsd(cents: number) {
  const n = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n / 100);
}

function isoToDateLabel(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

type ProfitRow = {
  order_id: string;
  placed_at: string | null;
  status: string;
  total_cents: number;
  profit_cents: number;
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await supabaseServer();

  // ✅ must be signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  // ✅ must be admin — otherwise send to user dashboard
  const admin = await isAdmin();
  if (!admin) redirect("/dashboard/overview");

  // ✅ now it's safe to scope org data
  const orgId = mustGetOrgId();

  // 30-day window
  const now = new Date();
  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: profitRows } = await supabase
    .from("v_order_profit")
    .select("order_id, placed_at, status, total_cents, profit_cents")
    .eq("org_id", orgId)
    .gte("placed_at", start)
    .order("placed_at", { ascending: false })
    .limit(50);

  const rows: ProfitRow[] = (profitRows as any) ?? [];

  const revenue30 = rows.reduce((sum, r) => sum + (r.total_cents || 0), 0);
  const profit30 = rows.reduce((sum, r) => sum + (r.profit_cents || 0), 0);
  const orders30 = rows.length;
  const needsFulfillment = rows.filter((r) =>
    ["paid", "processing", "fulfilled", "partially_shipped"].includes(String(r.status || ""))
  ).length;

  return (
    <div>
      {/* Dark hero (brand) */}
      <section className="ocean-shell hero-bg angle-divider noise">
        <Container className="py-12 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <div className="caps text-[11px] text-white/70">Admin</div>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              ReefCultures Ops Dashboard
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/75">
              Revenue, profit, order flow, and fulfillment status — scoped to your ReefCultures org.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button href="/dashboard/admin/orders" className="px-6 py-3">
                View orders
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

      {/* Readable paper section */}
      <section className="paper-shell">
        <Container className="py-12 sm:py-14">
          <div className="mx-auto max-w-6xl">
            {/* Stat cards (force dark text) */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm text-slate-950">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Revenue (30d)
                </div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                  {centsToUsd(revenue30)}
                </div>
                <div className="mt-1 text-xs text-slate-600">Last 30 days</div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm text-slate-950">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Profit (30d)
                </div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                  {centsToUsd(profit30)}
                </div>
                <div className="mt-1 text-xs text-slate-600">After fees + costs</div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm text-slate-950">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Orders (30d)
                </div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                  {orders30}
                </div>
                <div className="mt-1 text-xs text-slate-600">Placed last 30 days</div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm text-slate-950">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Needs fulfillment
                </div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">
                  {needsFulfillment}
                </div>
                <div className="mt-1 text-xs text-slate-600">Paid / processing</div>
              </div>
            </div>

            {/* Main grid */}
            <div className="mt-10 grid gap-6 lg:grid-cols-12 items-start">
              {/* Recent Orders */}
              <Card className="lg:col-span-8 text-slate-950">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">Recent orders</div>
                    <p className="mt-2 text-sm text-slate-700">
                      Latest orders from the last 30 days. Click through to manage shipping + costs.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/admin/orders"
                    className="text-sm font-semibold text-slate-900 underline-offset-4 hover:underline"
                  >
                    View all
                  </Link>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-black/10">
                  <div className="grid grid-cols-12 gap-2 bg-slate-50 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    <div className="col-span-4">Order</div>
                    <div className="col-span-3">Date</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-2 text-right">Profit</div>
                  </div>

                  {rows.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-slate-700">
                      No orders in the last 30 days yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-black/10">
                      {rows.slice(0, 10).map((r) => (
                        <Link
                          key={r.order_id}
                          href={`/dashboard/admin/orders/${r.order_id}`}
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

              {/* Quick Actions */}
              <Card className="lg:col-span-4 text-slate-950">
                <div className="text-sm font-semibold text-slate-950">Ops quick actions</div>
                <p className="mt-2 text-sm text-slate-700">
                  Common actions for fulfillment and finance.
                </p>

                <div className="mt-6 grid gap-3">
                  <Button href="/dashboard/admin/orders" className="px-6 py-3">
                    Manage orders
                  </Button>
                  <Button href="/dashboard/shipping" variant="secondary" className="px-6 py-3">
                    Shipping board
                  </Button>
                  <Button href="/dashboard/costs" variant="secondary" className="px-6 py-3">
                    Cost defaults
                  </Button>
                </div>

                <div className="mt-6 rounded-2xl border border-black/10 bg-slate-50 p-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Org scope
                  </div>
                  <div className="mt-2 text-xs text-slate-700 break-all">{orgId}</div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}