import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { supabaseServer } from "@/lib/supabase/server";
import { mustGetOrgId } from "@/lib/org";
import { isAdmin } from "@/lib/auth/isAdmin";

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
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function titleCaseStatus(status?: string | null) {
  if (!status) return "—";
  return status
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusClasses(status?: string | null) {
  const value = String(status || "").toLowerCase();

  if (["paid", "processing"].includes(value)) {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }

  if (["fulfilled", "partially_shipped"].includes(value)) {
    return "border-sky-400/20 bg-sky-400/10 text-sky-200";
  }

  if (["cancelled", "refunded", "failed"].includes(value)) {
    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }

  return "border-white/10 bg-white/[0.05] text-white/70";
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const admin = await isAdmin();
  if (!admin) redirect("/dashboard/overview");

  const orgId = mustGetOrgId();

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
    ["paid", "processing", "fulfilled", "partially_shipped"].includes(
      String(r.status || "").toLowerCase()
    )
  ).length;

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-[28px] border border-white/10 bg-gradient-to-br from-[rgba(7,19,40,0.96)] via-[rgba(8,27,58,0.94)] to-[rgba(4,12,28,0.98)] p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
              Admin Overview
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              ReefCultures Ops Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/68 sm:text-base">
              Monitor revenue, profit, fulfillment activity, and recent order flow
              across your ReefCultures admin workspace.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="/dashboard/admin/orders" className="px-5 py-3">
              Manage orders
            </Button>
            <Button
              href="/store"
              variant="secondary"
              className="px-5 py-3 !border !border-white/12 !bg-white/[0.06] !text-white hover:!bg-white/[0.09]"
            >
              Open storefront
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Revenue (30d)
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {centsToUsd(revenue30)}
          </div>
          <div className="mt-2 text-sm text-white/55">Last 30 days</div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Profit (30d)
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {centsToUsd(profit30)}
          </div>
          <div className="mt-2 text-sm text-white/55">After fees + costs</div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Orders (30d)
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {orders30}
          </div>
          <div className="mt-2 text-sm text-white/55">Placed in the last 30 days</div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Needs fulfillment
          </div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {needsFulfillment}
          </div>
          <div className="mt-2 text-sm text-white/55">Paid / processing / active</div>
        </div>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-8 border-white/10 bg-white/[0.04] text-white shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-lg font-semibold tracking-tight text-white">
                Recent orders
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                Latest orders from the last 30 days. Open any order to review
                fulfillment, shipping, and order-level profitability.
              </p>
            </div>

            <Link
              href="/dashboard/admin/orders"
              className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/80 transition hover:bg-white/[0.07] hover:text-white"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(3,10,24,0.55)]">
            <div className="hidden grid-cols-12 gap-3 border-b border-white/10 bg-white/[0.04] px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45 md:grid">
              <div className="col-span-4">Order</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-3">Status</div>
              <div className="col-span-3 text-right">Profit</div>
            </div>

            {rows.length === 0 ? (
              <div className="px-5 py-8 text-sm text-white/60">
                No orders in the last 30 days yet.
              </div>
            ) : (
              <div className="divide-y divide-white/8">
                {rows.slice(0, 10).map((r) => (
                  <Link
                    key={r.order_id}
                    href={`/dashboard/admin/orders/${r.order_id}`}
                    className="block transition hover:bg-white/[0.04]"
                  >
                    <div className="grid gap-4 px-5 py-4 md:grid-cols-12 md:items-center md:gap-3">
                      <div className="md:col-span-4">
                        <div className="text-sm font-semibold tracking-[0.02em] text-white">
                          {r.order_id.slice(0, 8).toUpperCase()}
                        </div>
                        <div className="mt-1 text-xs text-white/50">
                          Total: {centsToUsd(r.total_cents)}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="text-xs uppercase tracking-[0.16em] text-white/35 md:hidden">
                          Date
                        </div>
                        <div className="mt-1 text-sm text-white/70 md:mt-0">
                          {isoToDateLabel(r.placed_at)}
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <div className="text-xs uppercase tracking-[0.16em] text-white/35 md:hidden">
                          Status
                        </div>
                        <div className="mt-1 md:mt-0">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(
                              r.status
                            )}`}
                          >
                            {titleCaseStatus(r.status)}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-3 md:text-right">
                        <div className="text-xs uppercase tracking-[0.16em] text-white/35 md:hidden">
                          Profit
                        </div>
                        <div className="mt-1 text-sm font-semibold text-white md:mt-0">
                          {centsToUsd(r.profit_cents)}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-4 border-white/10 bg-white/[0.04] text-white shadow-[0_12px_40px_rgba(0,0,0,0.2)] backdrop-blur-sm">
          <div>
            <div className="text-lg font-semibold tracking-tight text-white">
              Ops quick actions
            </div>
            <p className="mt-2 text-sm leading-6 text-white/60">
              Common shortcuts for order management, shipping, and cost controls.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <Button href="/dashboard/admin/orders" className="px-5 py-3">
              Manage orders
            </Button>

            <Button
              href="/dashboard/shipping"
              variant="secondary"
              className="px-5 py-3 !border !border-white/10 !bg-white/[0.04] !text-white hover:!bg-white/[0.07]"
            >
              Shipping board
            </Button>

            <Button
              href="/dashboard/costs"
              variant="secondary"
              className="px-5 py-3 !border !border-white/10 !bg-white/[0.04] !text-white hover:!bg-white/[0.07]"
            >
              Cost defaults
            </Button>
          </div>

          <div className="mt-6 rounded-[22px] border border-white/10 bg-black/20 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Org scope
            </div>
            <div className="mt-2 break-all text-sm leading-6 text-white/68">
              {orgId}
            </div>
          </div>

          <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              Signed in
            </div>
            <div className="mt-2 break-all text-sm leading-6 text-white/68">
              {user.email}
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}