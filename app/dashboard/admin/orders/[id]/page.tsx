import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { supabaseServer } from "@/lib/supabase/server";
import { mustGetOrgId } from "@/lib/org";

function centsToUsd(cents: number) {
  const n = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n / 100);
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Order = {
  id: string;
  status: string;
  currency: string;
  placed_at: string | null;
  created_at: string;
  updated_at: string;
  customer_email: string | null;
  customer_name: string | null;
  ship_to: any;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  shipping_charged_cents: number;
  total_cents: number;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
};

type OrderItem = {
  id: string;
  name: string;
  sku: string | null;
  quantity: number;
  unit_price_cents: number;
  unit_cost_cents: number;
  packaging_cost_cents: number;
};

type Shipment = {
  id: string;
  status: string;
  carrier: string | null;
  service: string | null;
  tracking_number: string | null;
  tracking_url: string | null;
  label_cost_cents: number;
  shipped_at: string | null;
  delivered_at: string | null;
  updated_at: string;
  created_at: string;
};

type Cost = {
  id: string;
  label: string;
  amount_cents: number;
  created_at: string;
};

type ProfitRow = {
  order_id: string;
  total_cents: number;
  cogs_cents: number;
  packaging_cents: number;
  label_cost_cents: number;
  extra_costs_cents: number;
  payment_fees_cents: number;
  refunds_cents: number;
  profit_cents: number;
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orgId = mustGetOrgId();
  const supabase = await supabaseServer();

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .select(
      "id,status,currency,placed_at,created_at,updated_at,customer_email,customer_name,ship_to,subtotal_cents,discount_cents,tax_cents,shipping_charged_cents,total_cents,stripe_checkout_session_id,stripe_payment_intent_id"
    )
    .eq("org_id", orgId)
    .eq("id", id)
    .maybeSingle();

  if (orderErr || !order) {
    return (
      <div className="paper-shell">
        <Container className="py-16">
          <Card>
            <div className="text-sm font-semibold">Order not found</div>
            <p className="mt-3 text-sm text-ink/70">
              {orderErr?.message ??
                "This order does not exist or you do not have access."}
            </p>
            <div className="mt-6">
              <Button href="/dashboard/admin/orders" className="px-6 py-3">
                Back to orders
              </Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  const o: Order = order as any;

  const { data: items } = await supabase
    .from("order_items")
    .select("id,name,sku,quantity,unit_price_cents,unit_cost_cents,packaging_cost_cents")
    .eq("org_id", orgId)
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const { data: shipments } = await supabase
    .from("shipments")
    .select(
      "id,status,carrier,service,tracking_number,tracking_url,label_cost_cents,shipped_at,delivered_at,updated_at,created_at"
    )
    .eq("org_id", orgId)
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  const { data: costs } = await supabase
    .from("order_costs")
    .select("id,label,amount_cents,created_at")
    .eq("org_id", orgId)
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  const { data: profit } = await supabase
    .from("v_order_profit")
    .select(
      "order_id,total_cents,cogs_cents,packaging_cents,label_cost_cents,extra_costs_cents,payment_fees_cents,refunds_cents,profit_cents"
    )
    .eq("org_id", orgId)
    .eq("order_id", id)
    .maybeSingle();

  const itemList: OrderItem[] = (items as any) ?? [];
  const shipList: Shipment[] = (shipments as any) ?? [];
  const costList: Cost[] = (costs as any) ?? [];
  const p: ProfitRow | null = (profit as any) ?? null;

  const shipTo = o.ship_to ?? {};
  const placed = o.placed_at ?? o.created_at;

  return (
    <div>
      <section className="ocean-shell hero-bg angle-divider noise">
        <Container className="py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="caps text-[11px] text-white/65">Admin · Order</div>
                <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                  {o.id.slice(0, 8).toUpperCase()}
                </h1>
                <p className="mt-3 text-sm text-white/75">
                  Placed {fmtDateTime(placed)} · Status:{" "}
                  <span className="font-semibold">{o.status}</span>
                </p>
              </div>
              <div className="flex gap-3">
                <Button href="/dashboard/admin/orders" variant="secondary" className="px-6 py-3">
                  Back
                </Button>
                <Button href="/store" className="px-6 py-3">
                  Storefront
                </Button>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass-card rounded-2xl border border-white/10 p-4">
                <div className="text-xs font-semibold text-white/60">Total</div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                  {centsToUsd(o.total_cents)}
                </div>
                <div className="mt-1 text-xs text-white/55">charged</div>
              </div>

              <div className="glass-card rounded-2xl border border-white/10 p-4">
                <div className="text-xs font-semibold text-white/60">Profit</div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                  {centsToUsd(p?.profit_cents ?? 0)}
                </div>
                <div className="mt-1 text-xs text-white/55">after costs</div>
              </div>

              <div className="glass-card rounded-2xl border border-white/10 p-4">
                <div className="text-xs font-semibold text-white/60">Fees</div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                  {centsToUsd(p?.payment_fees_cents ?? 0)}
                </div>
                <div className="mt-1 text-xs text-white/55">Stripe fees</div>
              </div>

              <div className="glass-card rounded-2xl border border-white/10 p-4">
                <div className="text-xs font-semibold text-white/60">Refunds</div>
                <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                  {centsToUsd(p?.refunds_cents ?? 0)}
                </div>
                <div className="mt-1 text-xs text-white/55">total refunds</div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="paper-shell">
        <Container className="py-16">
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-8 space-y-6">
              <Card>
                <div className="text-sm font-semibold">Order summary</div>

                <div className="mt-4 grid gap-2 text-sm text-ink/80">
                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Customer</div>
                    <div className="font-semibold text-ink">
                      {o.customer_name ?? "—"}{" "}
                      <span className="text-ink/60 font-normal">
                        {o.customer_email ? `(${o.customer_email})` : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Placed</div>
                    <div className="font-semibold text-ink">{fmtDateTime(placed)}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Stripe Checkout</div>
                    <div className="font-semibold text-ink">
                      {o.stripe_checkout_session_id ?? "—"}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Payment Intent</div>
                    <div className="font-semibold text-ink">
                      {o.stripe_payment_intent_id ?? "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-6 overflow-hidden rounded-2xl border border-border/10">
                  <div className="grid grid-cols-12 gap-2 bg-paper-2 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-ink/55">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-2 text-right">Qty</div>
                    <div className="col-span-2 text-right">Price</div>
                    <div className="col-span-2 text-right">Cost</div>
                  </div>

                  {itemList.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-ink/70">No items found.</div>
                  ) : (
                    <div className="divide-y divide-border/10">
                      {itemList.map((it) => (
                        <div key={it.id} className="grid grid-cols-12 gap-2 px-4 py-3 text-sm">
                          <div className="col-span-6">
                            <div className="font-semibold text-ink">{it.name}</div>
                            <div className="text-xs text-ink/55">{it.sku ?? "—"}</div>
                          </div>
                          <div className="col-span-2 text-right text-ink/70">{it.quantity}</div>
                          <div className="col-span-2 text-right font-semibold text-ink">
                            {centsToUsd(it.unit_price_cents)}
                          </div>
                          <div className="col-span-2 text-right text-ink/70">
                            {centsToUsd(it.unit_cost_cents)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Subtotal</div>
                    <div className="font-semibold text-ink">{centsToUsd(o.subtotal_cents)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Discount</div>
                    <div className="font-semibold text-ink">{centsToUsd(o.discount_cents)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Tax</div>
                    <div className="font-semibold text-ink">{centsToUsd(o.tax_cents)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Shipping charged</div>
                    <div className="font-semibold text-ink">
                      {centsToUsd(o.shipping_charged_cents)}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-ink/70">Total</div>
                    <div className="text-lg font-extrabold text-ink">{centsToUsd(o.total_cents)}</div>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="text-sm font-semibold">Fulfillment & shipping</div>
                <p className="mt-2 text-sm text-ink/70">
                  Shipping data lives in <code className="text-xs">shipments</code>. Update the most recent shipment
                  or create one if none exists.
                </p>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-border/10 bg-paper-2 p-4">
                    <div className="text-xs font-semibold text-ink/55 uppercase tracking-wide">
                      Ship to
                    </div>
                    <div className="mt-2 text-sm text-ink/80">
                      <div className="font-semibold">{shipTo?.name ?? o.customer_name ?? "—"}</div>
                      <div className="text-ink/70">
                        {shipTo?.address_line1 ?? shipTo?.line1 ?? "—"}
                      </div>
                      {shipTo?.address_line2 ? (
                        <div className="text-ink/70">{shipTo.address_line2}</div>
                      ) : null}
                      <div className="text-ink/70">
                        {shipTo?.city_locality ?? shipTo?.city ?? "—"},{" "}
                        {shipTo?.state_province ?? shipTo?.state ?? "—"}{" "}
                        {shipTo?.postal_code ?? shipTo?.postalCode ?? "—"}
                      </div>
                      <div className="text-ink/70">
                        {shipTo?.country_code ?? shipTo?.country ?? "—"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/10 bg-paper-2 p-4">
                    <div className="text-xs font-semibold text-ink/55 uppercase tracking-wide">
                      Shipment status
                    </div>

                    <form
                      action={`/api/admin/orders/${o.id}`}
                      method="post"
                      className="mt-3 space-y-3"
                    >
                      <input type="hidden" name="action" value="upsert_shipment" />

                      <label className="block text-xs font-semibold text-ink/55 uppercase tracking-wide">
                        Status
                      </label>
                      <select
                        name="shipment_status"
                        defaultValue={shipList[0]?.status ?? "label_created"}
                        className="w-full rounded-xl border border-border/20 bg-white px-3 py-2 text-sm"
                      >
                        <option value="none">none</option>
                        <option value="queued">queued</option>
                        <option value="label_created">label_created</option>
                        <option value="in_transit">in_transit</option>
                        <option value="out_for_delivery">out_for_delivery</option>
                        <option value="delivered">delivered</option>
                        <option value="exception">exception</option>
                        <option value="returned">returned</option>
                        <option value="canceled">canceled</option>
                      </select>

                      <label className="block text-xs font-semibold text-ink/55 uppercase tracking-wide">
                        Carrier
                      </label>
                      <input
                        name="carrier"
                        defaultValue={shipList[0]?.carrier ?? ""}
                        className="w-full rounded-xl border border-border/20 bg-white px-3 py-2 text-sm"
                        placeholder="USPS / UPS"
                      />

                      <label className="block text-xs font-semibold text-ink/55 uppercase tracking-wide">
                        Service
                      </label>
                      <input
                        name="service"
                        defaultValue={shipList[0]?.service ?? ""}
                        className="w-full rounded-xl border border-border/20 bg-white px-3 py-2 text-sm"
                        placeholder="Priority / 2nd Day Air"
                      />

                      <label className="block text-xs font-semibold text-ink/55 uppercase tracking-wide">
                        Tracking number
                      </label>
                      <input
                        name="tracking_number"
                        defaultValue={shipList[0]?.tracking_number ?? ""}
                        className="w-full rounded-xl border border-border/20 bg-white px-3 py-2 text-sm"
                        placeholder="9400..."
                      />

                      <label className="block text-xs font-semibold text-ink/55 uppercase tracking-wide">
                        Tracking URL
                      </label>
                      <input
                        name="tracking_url"
                        defaultValue={shipList[0]?.tracking_url ?? ""}
                        className="w-full rounded-xl border border-border/20 bg-white px-3 py-2 text-sm"
                        placeholder="https://..."
                      />

                      <label className="block text-xs font-semibold text-ink/55 uppercase tracking-wide">
                        Label cost (cents)
                      </label>
                      <input
                        name="label_cost_cents"
                        defaultValue={String(shipList[0]?.label_cost_cents ?? 0)}
                        className="w-full rounded-xl border border-border/20 bg-white px-3 py-2 text-sm"
                        inputMode="numeric"
                      />

                      <label className="block text-xs font-semibold text-ink/55 uppercase tracking-wide">
                        Shipped at (ISO)
                      </label>
                      <input
                        name="shipped_at"
                        defaultValue={shipList[0]?.shipped_at ?? ""}
                        className="w-full rounded-xl border border-border/20 bg-white px-3 py-2 text-sm"
                        placeholder="2026-02-25T18:00:00Z"
                      />

                      <Button type="submit" className="px-6 py-3">
                        Save shipment
                      </Button>
                    </form>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-xs font-semibold text-ink/55 uppercase tracking-wide">
                    Existing shipments
                  </div>

                  {shipList.length === 0 ? (
                    <div className="mt-3 text-sm text-ink/70">
                      No shipments recorded yet.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {shipList.map((s) => (
                        <div key={s.id} className="rounded-2xl border border-border/10 bg-paper-2 p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-ink">
                                {s.status}{" "}
                                <span className="text-ink/50 font-normal">
                                  · updated {fmtDateTime(s.updated_at)}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-ink/70">
                                {s.carrier ?? "—"} {s.service ? `· ${s.service}` : ""}
                              </div>
                              <div className="mt-1 text-sm text-ink/70">
                                Tracking:{" "}
                                {s.tracking_url ? (
                                  <a
                                    className="underline"
                                    href={s.tracking_url}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {s.tracking_number ?? "link"}
                                  </a>
                                ) : (
                                  s.tracking_number ?? "—"
                                )}
                              </div>
                              <div className="mt-1 text-sm text-ink/70">
                                Label cost: {centsToUsd(s.label_cost_cents)}
                              </div>
                            </div>
                            <div className="text-sm text-ink/70">
                              Shipped: {fmtDateTime(s.shipped_at)} <br />
                              Delivered: {fmtDateTime(s.delivered_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card>
                <div className="text-sm font-semibold">Costs & profit</div>
                <p className="mt-2 text-sm text-ink/70">
                  Add extra costs (heat packs, supplies, labor). Profit updates automatically.
                </p>

                <div className="mt-6 grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">COGS</div>
                    <div className="font-semibold text-ink">{centsToUsd(p?.cogs_cents ?? 0)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Packaging</div>
                    <div className="font-semibold text-ink">
                      {centsToUsd(p?.packaging_cents ?? 0)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Label cost</div>
                    <div className="font-semibold text-ink">
                      {centsToUsd(p?.label_cost_cents ?? 0)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Extra costs</div>
                    <div className="font-semibold text-ink">
                      {centsToUsd(p?.extra_costs_cents ?? 0)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-ink/70">Fees</div>
                    <div className="font-semibold text-ink">
                      {centsToUsd(p?.payment_fees_cents ?? 0)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-border/10 bg-paper-2 p-4">
                  <div className="text-xs font-semibold text-ink/55 uppercase tracking-wide">
                    Current profit
                  </div>
                  <div className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
                    {centsToUsd(p?.profit_cents ?? 0)}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-xs font-semibold text-ink/55 uppercase tracking-wide">
                    Extra costs
                  </div>

                  {costList.length === 0 ? (
                    <div className="mt-3 text-sm text-ink/70">
                      No extra costs recorded.
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {costList.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-xl border border-border/10 bg-white px-3 py-2 text-sm"
                        >
                          <div>
                            <div className="font-semibold text-ink">{c.label}</div>
                            <div className="text-xs text-ink/55">{fmtDateTime(c.created_at)}</div>
                          </div>
                          <div className="font-semibold text-ink">{centsToUsd(c.amount_cents)}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <form
                    action={`/api/admin/orders/${o.id}`}
                    method="post"
                    className="mt-4 grid gap-3"
                  >
                    <input type="hidden" name="action" value="add_cost" />

                    <label className="block text-xs font-semibold text-ink/55 uppercase tracking-wide">
                      Add cost
                    </label>
                    <input
                      name="label"
                      className="w-full rounded-xl border border-border/20 bg-white px-3 py-2 text-sm"
                      placeholder="Heat pack / Box / Labor / etc"
                      required
                    />
                    <input
                      name="amount_cents"
                      className="w-full rounded-xl border border-border/20 bg-white px-3 py-2 text-sm"
                      placeholder="Amount in cents (ex: 199)"
                      inputMode="numeric"
                      required
                    />
                    <Button type="submit" className="px-6 py-3">
                      Add cost
                    </Button>
                  </form>
                </div>
              </Card>

              <Card>
                <div className="text-sm font-semibold">Navigation</div>
                <div className="mt-4 flex flex-col gap-3">
                  <Button href="/dashboard/admin" variant="secondary" className="px-6 py-3">
                    Dashboard overview
                  </Button>
                  <Button href="/dashboard/admin/orders" className="px-6 py-3">
                    Orders list
                  </Button>
                </div>

                <div className="mt-6 rounded-2xl border border-border/10 bg-paper-2 p-4">
                  <div className="text-xs font-semibold text-ink/55 uppercase tracking-wide">
                    Org
                  </div>
                  <div className="mt-2 text-sm text-ink/70">{orgId}</div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}