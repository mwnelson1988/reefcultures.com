import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { getSessionUser } from "@/lib/supabase/server";
import StatCard from "@/components/dashboard/StatCard";
import QuickActions from "@/components/dashboard/QuickActions";

export default async function DashboardPage() {
  const user = await getSessionUser();

  return (
    <div>
      <section className="ocean-shell hero-bg angle-divider noise">
        <Container className="py-14">
          <div className="mx-auto max-w-4xl">
            <div className="caps text-[11px] text-white/65">Account</div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
              Customer Dashboard
            </h1>
            <p className="mt-4 text-sm text-white/75">
              Manage your account, view order status, and access subscription tools.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="glass-card rounded-2xl border border-white/10 p-4">
                <div className="text-xs font-semibold text-white/60">Status</div>
                <div className="mt-2 text-xl font-extrabold tracking-tight text-white">Active</div>
                <div className="mt-1 text-xs text-white/55">Signed in & ready</div>
              </div>
              <div className="glass-card rounded-2xl border border-white/10 p-4">
                <div className="text-xs font-semibold text-white/60">Orders</div>
                <div className="mt-2 text-xl font-extrabold tracking-tight text-white">—</div>
                <div className="mt-1 text-xs text-white/55">Webhook-enabled</div>
              </div>
              <div className="glass-card rounded-2xl border border-white/10 p-4">
                <div className="text-xs font-semibold text-white/60">Shipping</div>
                <div className="mt-2 text-xl font-extrabold tracking-tight text-white">Live</div>
                <div className="mt-1 text-xs text-white/55">Rates at checkout</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="paper-shell">
        <Container className="py-16">
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            <div className="lg:col-span-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard title="Email" value={user?.email ?? "—"} subtext="Signed in" />
                <StatCard title="Orders" value="0" subtext="No orders yet" />
                <StatCard title="Checkout" value="Ready" subtext="Stripe wired" />
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                  <div className="text-sm font-semibold">Account tools</div>
                  <p className="mt-3 text-sm text-ink/70">
                    Manage billing securely through Stripe&apos;s customer portal.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Button href="/store" variant="secondary" className="px-6 py-3">
                      Shop
                    </Button>
                    <form action="/api/stripe/portal" method="post">
                      <Button type="submit" className="px-6 py-3">
                        Manage subscription
                      </Button>
                    </form>
                  </div>
                  <p className="mt-4 text-xs text-ink/55">
                    Portal opens in Stripe&apos;s secure environment.
                  </p>
                </Card>

                <Card>
                  <div className="text-sm font-semibold">Order status</div>
                  <p className="mt-3 text-sm text-ink/70">
                    Order history will appear here after checkout. Webhook-verified completion is enabled.
                  </p>
                  <div className="mt-6 rounded-2xl border border-border/10 bg-paper-2 p-4">
                    <div className="text-xs font-semibold text-ink/55 uppercase tracking-wide">
                      Status
                    </div>
                    <div className="mt-2 text-sm text-ink/70">No orders found yet.</div>
                  </div>
                </Card>
              </div>
            </div>

            <div className="lg:col-span-4">
              <QuickActions />
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
