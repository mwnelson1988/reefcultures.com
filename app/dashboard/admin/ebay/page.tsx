// app/dashboard/admin/ebay/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import { mustGetOrgId } from "@/lib/org";
import EbaySyncClient from "./sync-client";

export const dynamic = "force-dynamic";

function centsToUsd(cents: number) {
  const n = Number.isFinite(cents) ? cents : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n / 100);
}

function isoToDateLabel(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default async function AdminEbayPage() {
  const orgId = mustGetOrgId();
  const supabase = await supabaseServer();

  const now = new Date();
  const start = new Date(
    now.getTime() - 90 * 24 * 60 * 60 * 1000
  ).toISOString();

  const hasEbayEnv =
    Boolean(process.env.EBAY_CLIENT_ID) &&
    Boolean(process.env.EBAY_CLIENT_SECRET) &&
    Boolean(process.env.EBAY_REFRESH_TOKEN) &&
    Boolean(process.env.EBAY_MARKETPLACE_ID);

  const res = await supabase
    .from("orders")
    .select(
      "id,placed_at,created_at,status,total_cents,profit_cents,channel,stripe_checkout_session_id"
    )
    .eq("org_id", orgId)
    .gte("created_at", start)
    .order("created_at", { ascending: false })
    .limit(250);

  const all = Array.isArray(res.data) ? (res.data as any[]) : [];

  // eBay-only filter. Keep a small fallback for older imported rows.
  const ebay = all.filter((o) => {
    const ch = String(o.channel ?? "").toLowerCase();
    if (ch === "ebay") return true;

    const legacyKey = String(o.stripe_checkout_session_id ?? "").toLowerCase();
    if (legacyKey.startsWith("ebay:")) return true;

    return false;
  });

  const ebayOrders = ebay.filter(
    (o) => String(o.channel ?? "").toLowerCase() === "ebay"
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-white/60">
          Admin
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
          eBay Orders
        </h1>
        <p className="mt-2 text-sm text-white/70">
          This page shows orders imported from the eBay API. Imported eBay
          orders are stored in the same orders table as website orders and can
          be fulfilled with ShipEngine.
        </p>
      </div>

      <EbaySyncClient daysDefault={7} />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold">Last 90 days</div>
            <div className="mt-1 text-xs text-white/60">
              eBay channel orders:{" "}
              <span className="font-semibold text-white">
                {ebayOrders.length}
              </span>{" "}
              / Total imported eBay rows:{" "}
              <span className="font-semibold text-white">{ebay.length}</span>
            </div>
          </div>

          <Link
            href="/dashboard/admin/orders"
            className="text-xs font-semibold text-white/80 underline underline-offset-4 hover:text-white"
          >
            View all orders →
          </Link>
        </div>

        {!hasEbayEnv ? (
          <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-4 text-sm text-amber-100">
            Missing eBay environment variables. Add{" "}
            <span className="font-semibold">EBAY_CLIENT_ID</span>,{" "}
            <span className="font-semibold">EBAY_CLIENT_SECRET</span>,{" "}
            <span className="font-semibold">EBAY_REFRESH_TOKEN</span>, and{" "}
            <span className="font-semibold">EBAY_MARKETPLACE_ID</span>.
          </div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <div className="grid grid-cols-12 gap-2 bg-black/20 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-white/60">
            <div className="col-span-4">Order</div>
            <div className="col-span-3">Placed</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {ebay.length === 0 ? (
            <div className="px-4 py-10 text-sm text-white/70">
              No imported eBay orders yet. Click <span className="font-semibold">Sync eBay Orders</span>.
              If nothing imports, confirm:
              <ul className="mt-2 list-disc space-y-1 pl-5 text-white/70">
                <li>Your eBay production app is approved for the seller account</li>
                <li>
                  <span className="font-mono text-[12px]">EBAY_CLIENT_ID</span>,{" "}
                  <span className="font-mono text-[12px]">EBAY_CLIENT_SECRET</span>,{" "}
                  <span className="font-mono text-[12px]">EBAY_REFRESH_TOKEN</span>, and{" "}
                  <span className="font-mono text-[12px]">EBAY_MARKETPLACE_ID</span>{" "}
                  are set
                </li>
                <li>The refresh token was generated for the same production app</li>
              </ul>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {ebay.map((o) => (
                <Link
                  key={o.id}
                  href={`/dashboard/admin/orders/${o.id}`}
                  className="grid grid-cols-12 gap-2 px-4 py-3 text-sm text-white/85 transition hover:bg-white/[0.06]"
                >
                  <div className="col-span-4">
                    <div className="font-semibold text-white">
                      {String(o.id).slice(0, 8).toUpperCase()}
                    </div>
                    <div className="mt-1 inline-flex rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] font-semibold text-white/70">
                      {String(o.channel ?? "ebay").toUpperCase()}
                    </div>
                  </div>

                  <div className="col-span-3 text-white/70">
                    {isoToDateLabel(o.placed_at ?? o.created_at)}
                  </div>

                  <div className="col-span-3 text-white/70">
                    {String(o.status ?? "processing")}
                  </div>

                  <div className="col-span-2 text-right font-semibold text-white">
                    {centsToUsd(Number(o.total_cents ?? 0) || 0)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}