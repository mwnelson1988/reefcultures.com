import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { mustGetOrgId } from "@/lib/org";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const orgId = mustGetOrgId();
  const supabase = await supabaseServer();

  // 1) Must be signed in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent("/dashboard")}`);
  }

  // 2) Must be active owner/admin in organization_members
  const { data: membership, error } = await supabase
    .from("organization_members")
    .select("role,is_active")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  // If RLS blocks or query fails, show readable error
  if (error) {
    return (
      <section className="paper-shell">
        <Container className="py-16">
          <Card className="text-slate-950">
            <div className="text-sm font-semibold text-slate-950">Dashboard error</div>
            <p className="mt-3 text-sm text-slate-700">
              Could not verify your admin access.
            </p>

            <div className="mt-3 rounded-2xl border border-black/10 bg-slate-50 p-4 text-xs text-slate-700">
              <div className="font-semibold text-slate-900">Debug</div>
              <div className="mt-2 break-all">org_id: {orgId}</div>
              <div className="break-all">user: {user.email}</div>
              <div className="break-all">error: {error.message}</div>
            </div>

            <div className="mt-6">
              <Button href="/" className="px-6 py-3">
                Back home
              </Button>
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  const active = membership?.is_active === true;
  const role = String(membership?.role || "").toLowerCase();
  const isAdmin = active && (role === "owner" || role === "admin");

  if (!isAdmin) {
    return (
      <section className="paper-shell">
        <Container className="py-16">
          <Card className="text-slate-950">
            <div className="text-sm font-semibold text-slate-950">Not authorized</div>
            <p className="mt-3 text-sm text-slate-700">
              You’re signed in as <span className="font-semibold">{user.email}</span>, but this
              account does not have admin access to the ReefCultures dashboard.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Button
                href="/"
                variant="secondary"
                className="px-6 py-3 !bg-white !text-slate-950 !border !border-black/10"
              >
                Back home
              </Button>
              <Button href="/account" className="px-6 py-3">
                Account
              </Button>
            </div>

            <div className="mt-6 rounded-2xl border border-black/10 bg-slate-50 p-4 text-xs text-slate-700">
              <div className="font-semibold text-slate-900">Debug</div>
              <div className="mt-2 break-all">org_id: {orgId}</div>
              <div>role: {role || "null"}</div>
              <div>is_active: {String(active)}</div>
              <div>membership: {membership ? "found" : "null"}</div>
            </div>
          </Card>
        </Container>
      </section>
    );
  }

  return <>{children}</>;
}