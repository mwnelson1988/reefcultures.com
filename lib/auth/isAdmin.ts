// lib/auth/isAdmin.ts
import { mustGetOrgId } from "@/lib/org";
import { supabaseServer } from "@/lib/supabase/server";

export type OrgMembership = {
  org_id: string;
  user_id: string;
  role: string | null;
  is_active: boolean | null;
};

export type SupabaseUser = {
  id: string;
  email?: string | null;
};

/**
 * Fetch the membership row for a user in the active org.
 */
export async function getActiveOrgMembership(
  user?: SupabaseUser | null
): Promise<OrgMembership | null> {
  const supabase = await supabaseServer();

  let u: SupabaseUser;

  // If user passed in
  if (user) {
    u = user;
  } else {
    const {
      data: { user: fetched },
    } = await supabase.auth.getUser();

    if (!fetched) return null;

    u = fetched as SupabaseUser;
  }

  // At this point, `u` is guaranteed defined.

  const orgId = mustGetOrgId();

  const { data, error } = await supabase
    .from("organization_members")
    .select("org_id,user_id,role,is_active")
    .eq("org_id", orgId)
    .eq("user_id", u.id)
    .maybeSingle();

  if (error || !data) return null;

  return data as OrgMembership;
}

/**
 * Role-based admin check.
 */
export async function isAdmin(
  user?: SupabaseUser | null
): Promise<boolean> {
  const m = await getActiveOrgMembership(user);
  if (!m) return false;
  if (m.is_active === false) return false;

  const role = String(m.role || "").toLowerCase();
  return role === "owner" || role === "admin";
}