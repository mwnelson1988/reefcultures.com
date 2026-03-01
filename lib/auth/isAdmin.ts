// lib/auth/isAdmin.ts
import { mustGetOrgId } from "@/lib/org";
import { supabaseServer } from "@/lib/supabase/server";

export type OrgMembership = {
  org_id: string;
  user_id: string;
  role: string | null;
  is_active: boolean | null;
};

/**
 * Fetch the current user's membership row for the active org.
 * Table expected: organization_members (org_id, user_id, role, is_active)
 */
export async function getActiveOrgMembership(): Promise<OrgMembership | null> {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const orgId = mustGetOrgId();

  const { data, error } = await supabase
    .from("organization_members")
    .select("org_id,user_id,role,is_active")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as any;
}

/**
 * Role-based admin check scoped to the active org.
 * Admin roles: owner, admin
 */
export async function isAdmin(): Promise<boolean> {
  const m = await getActiveOrgMembership();
  if (!m) return false;
  if (m.is_active === false) return false;
  const role = String(m.role || "").toLowerCase();
  return role === "owner" || role === "admin";
}
