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
    Processing: "border-white/10 bg-white/[0.06] text-white/90",
    Shipped: "border-white/10 bg-white/[0.06] text-white/90",
    Delivered: "border-white/10 bg-white/[0.06] text-white/90",
    Canceled: "border-white/10 bg-white/[0.06] text-white/90",
  };

  return <span className={`${base} ${map[status]}`}>{status}</span>;
}

export default function OrdersTable({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] shadow-sm backdrop-blur">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-base font-bold tracking-tight text-white">Recent Orders</h2>
          <p className="mt-1 text-sm text-white/70">
            View status, totals, and tracking.
          </p>
        </div>
        <a
          href="/orders"
          className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-white/90 shadow-sm transition hover:bg-white/10"
        >
          View all
        </a>
      </div>

      <div className="overflow-hidden">
        <table className="w-full border-t border-white/10 text-left text-sm">
          <thead className="bg-black/20 text-xs font-semibold text-white/60">
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
              <tr key={o.id} className="border-t border-white/10">
                <td className="px-5 py-4 font-semibold text-white">{o.orderLabel}</td>
                <td className="px-5 py-4 text-white/70">{o.dateLabel}</td>
                <td className="px-5 py-4">{o.itemsLabel}</td>
                <td className="px-5 py-4 font-semibold text-white">{o.totalLabel}</td>
                <td className="px-5 py-4">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-5 py-4 text-white/70">
                  {o.tracking ? (
                    <a
                      href={`/track/${encodeURIComponent(o.tracking)}`}
                      className="font-semibold underline decoration-white/20 underline-offset-4 hover:decoration-white/40"
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