// lib/auth/isAdmin.ts
import { supabaseServer } from "../supabase/server";

/**
 * Checks if the current authenticated user
 * is owner or admin in ANY organization.
 *
 * Later we can scope this to a specific org_id
 * once we add "active org" selection.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("organization_members")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (error || !data?.length) return false;

  return data.some((m: any) => m.role === "owner" || m.role === "admin");
}