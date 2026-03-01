// lib/integrations/shipstationSync.ts
// Sync ShipStation orders (including eBay) into Supabase.

import { listOrders, type ShipStationOrder } from "@/lib/integrations/shipstation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { mustGetOrgId } from "@/lib/org";

function toCents(n: any): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.round(v * 100);
}

function mapStatus(orderStatus?: string | null): string {
  const s = String(orderStatus || "").toLowerCase();
  if (s.includes("cancel")) return "canceled";
  if (s.includes("refund")) return "refunded";
  if (s.includes("shipped")) return "shipped";
  if (s.includes("await")) return "paid";
  if (s.includes("hold")) return "processing";
  if (s.includes("pending")) return "processing";
  return s || "processing";
}

function detectChannel(o: ShipStationOrder): { channel: string; source: string } {
  const src = `${o.orderSource ?? ""} ${o.advancedOptions?.source ?? ""}`.toLowerCase();
  if (src.includes("ebay")) return { channel: "ebay", source: "shipstation" };
  if (src.includes("amazon")) return { channel: "amazon", source: "shipstation" };
  if (src.includes("shopify")) return { channel: "shopify", source: "shipstation" };
  return { channel: "shipstation", source: "shipstation" };
}

function shipToJson(o: ShipStationOrder) {
  const a = o.shipTo ?? {};
  return {
    name: a.name ?? null,
    company: a.company ?? null,
    line1: a.street1 ?? null,
    line2: a.street2 ?? null,
    city: a.city ?? null,
    state: a.state ?? null,
    postal: a.postalCode ?? null,
    country: a.country ?? null,
    phone: a.phone ?? null,
    residential: a.residential ?? null,
  };
}

export type ShipStationSyncResult = {
  fetched: number;
  upserted: number;
  items_written: number;
  pages: number;
};

/**
 * Sync orders modified within the last N days.
 *
 * IMPORTANT:
 * We store a stable external key in `stripe_checkout_session_id` as:
 *   shipstation:<orderId>
 * so we can upsert idempotently without requiring DB schema changes.
 */
export async function syncShipStationOrders(opts?: {
  days?: number;
  pageSize?: number;
  maxPages?: number;
}) {
  const orgId = mustGetOrgId();
  const sb = supabaseAdmin();

  const days = Math.max(1, Math.min(60, Number(opts?.days ?? 7) || 7));
  const pageSize = Math.max(25, Math.min(500, Number(opts?.pageSize ?? 100) || 100));
  const maxPages = Math.max(1, Math.min(25, Number(opts?.maxPages ?? 10) || 10));

  const end = new Date();
  const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
  const modifyDateStart = start.toISOString();
  const modifyDateEnd = end.toISOString();

  let fetched = 0;
  let upserted = 0;
  let itemsWritten = 0;
  let pagesUsed = 0;

  for (let page = 1; page <= maxPages; page++) {
    const res = await listOrders({ modifyDateStart, modifyDateEnd, page, pageSize });
    pagesUsed = Math.max(pagesUsed, res.pages || 1);
    const orders = res.orders || [];
    if (orders.length === 0) break;

    fetched += orders.length;

    for (const o of orders) {
      const externalKey = `shipstation:${o.orderId}`;
      const { channel, source } = detectChannel(o);

      const placedAt = o.orderDate || o.createDate || o.modifyDate || new Date().toISOString();

      const payload: any = {
        org_id: orgId,

        // external idempotency key
        stripe_checkout_session_id: externalKey,

        // customer
        customer_email: o.customerEmail ?? null,
        customer_name: o.shipTo?.name ?? o.billTo?.name ?? null,
        ship_to: shipToJson(o),

        // basic commerce
        status: mapStatus(o.orderStatus),
        currency: "usd",
        subtotal_cents: 0,
        discount_cents: 0,
        tax_cents: toCents(o.taxAmount),
        shipping_charged_cents: toCents(o.shippingAmount),
        total_cents: toCents(o.orderTotal),
        placed_at: placedAt,

        // metadata (safe, optional columns may exist)
        source,
        channel,
        notes: o.customerNotes ?? null,
      };

      // Upsert order
      const { data: orderRow, error: orderErr } = await sb
        .from("orders")
        .upsert(payload, { onConflict: "stripe_checkout_session_id" })
        .select("id")
        .single();

      if (orderErr || !orderRow?.id) {
        // If the table doesn't have the optional columns (source/channel/notes), retry with minimal payload.
        const minimal: any = {
          org_id: orgId,
          stripe_checkout_session_id: externalKey,
          customer_email: o.customerEmail ?? null,
          customer_name: o.shipTo?.name ?? o.billTo?.name ?? null,
          ship_to: shipToJson(o),
          status: mapStatus(o.orderStatus),
          currency: "usd",
          subtotal_cents: 0,
          discount_cents: 0,
          tax_cents: toCents(o.taxAmount),
          shipping_charged_cents: toCents(o.shippingAmount),
          total_cents: toCents(o.orderTotal),
          placed_at: placedAt,
        };

        const retry = await sb
          .from("orders")
          .upsert(minimal, { onConflict: "stripe_checkout_session_id" })
          .select("id")
          .single();

        if (retry.error || !retry.data?.id) {
          // give up on this order, continue
          // eslint-disable-next-line no-console
          console.error("[shipstation-sync] order upsert failed", orderErr?.message, retry.error?.message);
          continue;
        }

        // Use retry id
        const orderId = retry.data.id as string;
        upserted += 1;
        await writeOrderItems(sb, orgId, orderId, o);
        itemsWritten += (o.items?.length ?? 0);
        continue;
      }

      const orderId = orderRow.id as string;
      upserted += 1;

      await writeOrderItems(sb, orgId, orderId, o);
      itemsWritten += (o.items?.length ?? 0);
    }

    if (page >= (res.pages || 1)) break;
  }

  return {
    fetched,
    upserted,
    items_written: itemsWritten,
    pages: pagesUsed,
  } satisfies ShipStationSyncResult;
}

async function writeOrderItems(
  sb: ReturnType<typeof supabaseAdmin>,
  orgId: string,
  orderId: string,
  o: ShipStationOrder
) {
  try {
    await sb.from("order_items").delete().eq("org_id", orgId).eq("order_id", orderId);
  } catch {
    // ignore
  }

  const items = Array.isArray(o.items) ? o.items : [];
  if (items.length === 0) return;

  const rows = items.map((it) => ({
    org_id: orgId,
    order_id: orderId,
    product_id: null,
    name: it?.name ?? "Item",
    sku: it?.sku ?? null,
    quantity: Number(it?.quantity ?? 1) || 1,
    unit_price_cents: toCents(it?.unitPrice),
    unit_cost_cents: 0,
    packaging_cost_cents: 0,
  }));

  const ins = await sb.from("order_items").insert(rows);
  if (ins.error) {
    // eslint-disable-next-line no-console
    console.error("[shipstation-sync] order_items insert failed", ins.error.message);
  }
}
