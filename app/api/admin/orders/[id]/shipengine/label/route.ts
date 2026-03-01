import { NextResponse } from "next/server";
import { mustGetOrgId } from "@/lib/org";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdminClient } from "@/lib/supabase/admin";
import { isAdmin } from "@/lib/auth/isAdmin";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function toCents(amount: any) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const supabase = await supabaseServer();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return jsonError("Unauthorized", 401);
    if (!(await isAdmin())) return jsonError("Forbidden", 403);

    const body = (await req.json().catch(() => ({}))) as any;
    const rate_id = String(body?.rate_id || "").trim();
    if (!rate_id) return jsonError("Missing rate_id", 400);

    const SHIPENGINE_API_KEY = process.env.SHIPENGINE_API_KEY || process.env.SHIPSTATION_API_KEY;
    if (!SHIPENGINE_API_KEY) return jsonError("Missing SHIPENGINE_API_KEY in environment", 500);

    // Create label from a chosen rate.
    // ShipEngine will return a tracking number + download URL(s).
    const seRes = await fetch("https://api.shipengine.com/v1/labels", {
      method: "POST",
      headers: { "Content-Type": "application/json", "API-Key": SHIPENGINE_API_KEY },
      body: JSON.stringify({
        rate_id,
        label_format: "pdf",
        label_layout: "4x6",
      }),
    });

    const seData = await seRes.json().catch(() => ({}));
    if (!seRes.ok) {
      const msg = seData?.errors?.[0]?.message || seData?.message || "ShipEngine label error";
      return jsonError(msg, 400);
    }

    const tracking_number = seData?.tracking_number ? String(seData.tracking_number) : null;
    const carrier = seData?.carrier_id ? String(seData.carrier_id) : null;
    const service = seData?.service_code ? String(seData.service_code) : seData?.service_type ? String(seData.service_type) : null;

    const label_cost_cents = toCents(seData?.shipment_cost?.amount ?? seData?.shipment_cost ?? seData?.rate?.shipping_amount?.amount);

    const label_pdf = seData?.label_download?.pdf ? String(seData.label_download.pdf) : null;
    const label_png = seData?.label_download?.png ? String(seData.label_download.png) : null;

    const tracking_url = seData?.tracking_url ? String(seData.tracking_url) : null;

    const orgId = mustGetOrgId();
    const admin = supabaseAdminClient();

    // Insert shipment record (non-destructive if you already have one; we create a new row).
    const insert = {
      org_id: orgId,
      order_id: id,
      status: "label_purchased",
      carrier,
      service,
      tracking_number,
      tracking_url,
      label_cost_cents,
      // NOTE: We intentionally do NOT store label download URLs in the DB by default.
      // Most teams treat label URLs as short-lived. The admin UI returns it so you can print.
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;

    const { error: insErr } = await admin.from("shipments").insert(insert);
    if (insErr) {
      // Don't fail label purchase if DB insert fails—return label URL so you can still ship.
      return NextResponse.json(
        {
          ok: true,
          warning: `Label purchased, but failed to save shipment record: ${insErr.message}`,
          tracking_number,
          tracking_url,
          label_pdf,
          label_png,
          label_cost_cents,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        tracking_number,
        tracking_url,
        label_pdf,
        label_png,
        label_cost_cents,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return jsonError(err?.message || "Failed to create label", 500);
  }
}
