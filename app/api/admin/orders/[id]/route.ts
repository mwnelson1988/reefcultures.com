import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { mustGetOrgId } from "@/lib/org";

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

  if (error) {
    return { ok: false as const, status: 500, message: error.message };
  }

  const active = membership?.is_active === true;
  const role = membership?.role;
  const isAdmin = active && (role === "owner" || role === "admin");

  if (!isAdmin) {
    return { ok: false as const, status: 403, message: "Not authorized" };
  }

  return { ok: true as const, userId: user.id };
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const orgId = mustGetOrgId();
  const supabase = await supabaseServer();

  const admin = await requireAdmin(supabase, orgId);
  if (!admin.ok) return jsonError(admin.message, admin.status);

  const form = await req.formData();
  const action = String(form.get("action") || "").trim();

  if (!action) return jsonError("Missing action");

  // Ensure order belongs to this org (avoid blind writes)
  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select("id")
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (orderErr) return jsonError(orderErr.message, 500);
  if (!order) return jsonError("Order not found", 404);

  if (action === "update_status") {
    const status = String(form.get("status") || "").trim();
    if (!status) return jsonError("Missing status");

    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("org_id", orgId)
      .eq("id", id);

    if (error) return jsonError(error.message, 500);

    return NextResponse.redirect(new URL(`/dashboard/orders/${id}`, req.url), 303);
  }

  if (action === "add_cost") {
    const label = String(form.get("label") || "").trim();
    const amountRaw = String(form.get("amount_cents") || "").trim();
    const amount = Number(amountRaw);

    if (!label) return jsonError("Missing cost label");
    if (!Number.isFinite(amount) || amount < 0) return jsonError("Invalid amount_cents");

    const { error } = await supabase.from("order_costs").insert({
      org_id: orgId,
      order_id: id,
      label,
      amount_cents: Math.round(amount),
    });

    if (error) return jsonError(error.message, 500);

    return NextResponse.redirect(new URL(`/dashboard/orders/${id}`, req.url), 303);
  }

  if (action === "upsert_shipment") {
    const shipment_status = String(form.get("shipment_status") || "label_created").trim();
    const carrier = String(form.get("carrier") || "").trim() || null;
    const service = String(form.get("service") || "").trim() || null;
    const tracking_number = String(form.get("tracking_number") || "").trim() || null;
    const tracking_url = String(form.get("tracking_url") || "").trim() || null;

    const labelCostRaw = String(form.get("label_cost_cents") || "0").trim();
    const label_cost_cents = Number(labelCostRaw);
    if (!Number.isFinite(label_cost_cents) || label_cost_cents < 0) {
      return jsonError("Invalid label_cost_cents");
    }

    const shippedAtRaw = String(form.get("shipped_at") || "").trim();
    const shipped_at = shippedAtRaw ? shippedAtRaw : null;

    // Update most recent shipment if exists, else create one
    const { data: existing, error: shipErr } = await supabase
      .from("shipments")
      .select("id")
      .eq("org_id", orgId)
      .eq("order_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (shipErr) return jsonError(shipErr.message, 500);

    if (existing?.id) {
      const { error } = await supabase
        .from("shipments")
        .update({
          status: shipment_status,
          carrier,
          service,
          tracking_number,
          tracking_url,
          label_cost_cents: Math.round(label_cost_cents),
          shipped_at,
        })
        .eq("org_id", orgId)
        .eq("id", existing.id);

      if (error) return jsonError(error.message, 500);
    } else {
      const { error } = await supabase.from("shipments").insert({
        org_id: orgId,
        order_id: id,
        status: shipment_status,
        carrier,
        service,
        tracking_number,
        tracking_url,
        label_cost_cents: Math.round(label_cost_cents),
        shipped_at,
      });

      if (error) return jsonError(error.message, 500);
    }

    return NextResponse.redirect(new URL(`/dashboard/orders/${id}`, req.url), 303);
  }

  return jsonError(`Unknown action: ${action}`);
}