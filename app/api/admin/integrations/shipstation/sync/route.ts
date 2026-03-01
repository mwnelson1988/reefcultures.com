import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { mustGetOrgId } from "@/lib/org";
import { syncShipStationOrders } from "@/lib/integrations/shipstationSync";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function requireAdmin(
  supabase: Awaited<ReturnType<typeof supabaseServer>>,
  orgId: string
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, status: 401, message: "Not authenticated" };
  }

  const { data: membership, error } = await supabase
    .from("organization_members")
    .select("role,is_active")
    .eq("org_id", orgId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { ok: false as const, status: 500, message: error.message };

  const active = membership?.is_active === true;
  const role = String(membership?.role ?? "");
  const isAdmin = active && (role === "owner" || role === "admin");

  if (!isAdmin) {
    return { ok: false as const, status: 403, message: "Not authorized" };
  }

  return { ok: true as const };
}

export async function POST(req: Request) {
  const orgId = mustGetOrgId();
  const supabase = await supabaseServer();

  const admin = await requireAdmin(supabase, orgId);
  if (!admin.ok) return jsonError(admin.message, admin.status);

  const form = await req.formData();
  const days = Number(String(form.get("days") ?? "7"));
  const safeDays = Number.isFinite(days)
    ? Math.max(1, Math.min(60, Math.floor(days)))
    : 7;

  try {
    const result = await syncShipStationOrders({
      days: safeDays,
      pageSize: 100,
      maxPages: 10,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return jsonError(e?.message || "ShipStation sync failed", 500);
  }
}
