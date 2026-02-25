// components/dashboard/OrdersTable.tsx
type OrderRow = {
  id: string; // internal (Stripe session id or DB id) used for React keys
  orderLabel: string; // ✅ what the UI displays in the "Order" column (ex: #RC-1042)
  dateLabel: string;
  itemsLabel: string;
  totalLabel: string;
  status: "Processing" | "Shipped" | "Delivered" | "Canceled";
  tracking?: string | null;
};

function StatusPill({ status }: { status: OrderRow["status"] }) {
  const base =
    "inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold";

  const map: Record<OrderRow["status"], string> = {
    Processing: "border-black/10 bg-black/[0.03] text-[rgb(var(--ink-950))]",
    Shipped: "border-black/10 bg-black/[0.03] text-[rgb(var(--ink-950))]",
    Delivered: "border-black/10 bg-black/[0.03] text-[rgb(var(--ink-950))]",
    Canceled: "border-black/10 bg-black/[0.03] text-[rgb(var(--ink-950))]",
  };

  return <span className={`${base} ${map[status]}`}>{status}</span>;
}

export default function OrdersTable({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-base font-bold tracking-tight">Recent Orders</h2>
          <p className="mt-1 text-sm text-[rgb(var(--ink-700))]">
            View status, totals, and tracking.
          </p>
        </div>
        <a
          href="/orders"
          className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:bg-black/[0.02]"
        >
          View all
        </a>
      </div>

      <div className="overflow-hidden">
        <table className="w-full border-t border-black/10 text-left text-sm">
          <thead className="bg-black/[0.02] text-xs font-semibold text-[rgb(var(--ink-700))]">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Items</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Tracking</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-black/10">
                <td className="px-5 py-4 font-semibold">{o.orderLabel}</td>
                <td className="px-5 py-4 text-[rgb(var(--ink-700))]">{o.dateLabel}</td>
                <td className="px-5 py-4">{o.itemsLabel}</td>
                <td className="px-5 py-4 font-semibold">{o.totalLabel}</td>
                <td className="px-5 py-4">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-5 py-4 text-[rgb(var(--ink-700))]">
                  {o.tracking ? (
                    <a
                      href={`/track/${encodeURIComponent(o.tracking)}`}
                      className="font-semibold underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                    >
                      {o.tracking}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}