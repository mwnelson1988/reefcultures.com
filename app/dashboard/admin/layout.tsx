// app/dashboard/admin/layout.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white/85 transition hover:bg-white/[0.07]"
    >
      {label}
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
    <div className="min-h-screen bg-[rgb(var(--ocean-950))]">
      {/* keep global topbar */}
      <DashboardTopbar />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:px-8">
        <aside className="lg:col-span-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
              Admin
            </div>
            <div className="mt-2 text-lg font-extrabold tracking-tight text-white">
              Ops Console
            </div>
            <div className="mt-4 grid gap-2">
              <NavItem href="/dashboard/admin/overview" label="Overview" />
              <NavItem href="/dashboard/admin/orders" label="Orders" />
              <NavItem href="/dashboard/admin/accounting" label="Accounting" />
              <NavItem href="/dashboard/admin/signups" label="Signups" />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
                Signed in
              </div>
              <div className="mt-1 break-all text-xs font-semibold text-white/80">
                {user.email}
              </div>
            </div>
          </div>
        </aside>

        <main className="lg:col-span-9">{children}</main>
      </div>
    </div>
  );
}
