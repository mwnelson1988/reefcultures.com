// app/dashboard/admin/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";

const adminNavItems = [
  { href: "/dashboard/admin/overview", label: "Overview" },
  { href: "/dashboard/admin/orders", label: "Orders" },
  { href: "/dashboard/admin/shipping", label: "Rate lookup" },
  { href: "/dashboard/admin/accounting", label: "Accounting" },
  { href: "/dashboard/admin/signups", label: "Signups" },
  { href: "/dashboard/admin/ebay", label: "eBay Orders" },
];

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/78 transition-all duration-200 hover:border-white/14 hover:bg-white/[0.06] hover:text-white"
    >
      <span>{label}</span>
      <span className="text-white/25 transition group-hover:text-white/45">›</span>
    </Link>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/dashboard");

  const admin = await isAdmin();
  if (!admin) redirect("/dashboard/overview");

  return (
    <div className="min-h-screen bg-[rgb(var(--ocean-950))] text-white">
      <DashboardTopbar />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="sticky top-24 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.03] shadow-[0_10px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <div className="border-b border-white/8 px-5 py-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Admin
                </div>
                <div className="mt-2 text-xl font-semibold tracking-tight text-white">
                  Ops Console
                </div>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Manage orders, fulfillment, accounting, signups, and eBay operations.
                </p>
              </div>

              <div className="px-4 py-4">
                <nav className="space-y-2">
                  {adminNavItems.map((item) => (
                    <NavItem key={item.href} href={item.href} label={item.label} />
                  ))}
                </nav>
              </div>

              <div className="border-t border-white/8 px-4 py-4">
                <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    Signed in
                  </div>
                  <div className="mt-2 break-all text-sm font-medium text-white/78">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-9">
            <div className="rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.035] to-white/[0.02] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:p-5 lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}