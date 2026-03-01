// app/dashboard/overview/page.tsx
import { redirect } from "next/navigation";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import StatCard from "@/components/dashboard/StatCard";
import OrdersTable from "@/components/dashboard/OrdersTable";
import SubscriptionCard from "@/components/dashboard/SubscriptionCard";
import QuickActions from "@/components/dashboard/QuickActions";
import { supabaseServer } from "@/lib/supabase/server";
import { getLiveDashboardData } from "@/lib/dashboard/live";
import { isAdmin } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";

export default async function UserOverviewPage() {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/dashboard");

  // If an admin lands here, keep it clean and send to admin console.
  if (await isAdmin()) redirect("/dashboard/admin");

  const live = await getLiveDashboardData(user.id).catch(() => null);

  const subscription =
    live?.subscription ??
    ({
      statusLabel: "None",
      statusHint: "No Auto-Ship plan yet.",
      planLabel: "—",
      nextShipLabel: "—",
      nextShipHint: "Start Auto-Ship to schedule recurring deliveries.",
    } as any);

  const orders = live?.orders ?? [];
  const stats =
    live?.stats ??
    ({
      totalOrders: 0,
      lastOrderLabel: "—",
      savingsLabel: "$0.00",
      savingsHint: "Auto-Ship savings will appear here.",
    } as any);

  return (
    <div className="min-h-screen bg-[rgb(var(--ocean-950))]">
      <DashboardTopbar />

      {/* Hero */}
      <section className="ocean-shell hero-bg angle-divider noise">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                Account
              </div>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Your ReefCultures Dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-white/75 sm:text-base">
                Orders, subscriptions, and shipping — built to feel like a premium product, not a generic portal.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="/store"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-white/95"
                >
                  Shop products
                </a>
                <a
                  href="/account"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 shadow-sm transition hover:bg-white/10"
                >
                  Manage account
                </a>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                  Signed in
                </div>
                <div className="mt-1 break-all text-sm font-semibold text-white/85">
                  {user.email}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
                      Orders
                    </div>
                    <div className="mt-1 text-lg font-extrabold text-white">
                      {stats.totalOrders}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
                      Last
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-white">
                      {stats.lastOrderLabel}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-white/60">
                      Savings
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-white">
                      {stats.savingsLabel}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-white/60">{stats.savingsHint}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total orders" value={String(stats.totalOrders)} hint="All time" />
                <StatCard label="Last order" value={stats.lastOrderLabel} hint="Most recent activity" />
                <StatCard label="Savings" value={stats.savingsLabel} hint="Auto-Ship (coming soon)" />
              </div>

              <div className="mt-6">
                <OrdersTable orders={orders} />
              </div>
            </div>

            <div className="lg:col-span-4">
              <SubscriptionCard subscription={subscription} />
              <div className="mt-6">
                <QuickActions />
              </div>
            </div>
          </div>

          {/* Premium empty-state for brand new users */}
          {orders.length === 0 ? (
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-bold tracking-tight text-white">Ready when you are</div>
              <div className="mt-2 max-w-2xl text-sm text-white/70">
                Your dashboard will automatically populate as soon as you place your first order.
                In the meantime, browse live phytoplankton and start an Auto-Ship plan for consistent reef nutrition.
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="/store"
                  className="rounded-xl bg-[rgb(var(--ocean-950))] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                >
                  Browse products
                </a>
                <a
                  href="/process"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 shadow-sm transition hover:bg-white/10"
                >
                  See our process
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
