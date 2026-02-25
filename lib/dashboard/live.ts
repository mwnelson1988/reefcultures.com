// lib/dashboard/live.ts
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type DashboardSubscription = {
  statusLabel: string;
  statusHint: string;
  planLabel: string;
  nextShipLabel: string;
  nextShipHint: string;
};

export type DashboardOrder = {
  id: string; // internal id (Stripe session id)
  orderLabel: string; // ✅ what UI displays (ex: #RC-1042)
  dateLabel: string;
  itemsLabel: string;
  totalLabel: string;
  status: "Processing" | "Shipped" | "Delivered" | "Canceled";
  tracking?: string | null;
};

export type DashboardStats = {
  totalOrders: number;
  lastOrderLabel: string;
  savingsLabel: string;
  savingsHint: string;
};

export type DashboardData = {
  subscription: DashboardSubscription;
  orders: DashboardOrder[];
  stats: DashboardStats;
};

function formatMoney(amountCents: number | null | undefined, currency: string | null | undefined) {
  if (typeof amountCents !== "number" || !Number.isFinite(amountCents)) return "$0.00";
  const cur = (currency || "usd").toUpperCase();
  if (cur === "USD") return `$${(amountCents / 100).toFixed(2)}`;
  return `${(amountCents / 100).toFixed(2)} ${cur}`;
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function statusToLabel(status: string | null | undefined) {
  const s = (status || "").toLowerCase();
  if (s === "active") return "Active";
  if (s === "trialing") return "Trial";
  if (s === "past_due") return "Past due";
  if (s === "unpaid") return "Unpaid";
  if (s === "canceled") return "Canceled";
  if (!s) return "None";
  return status as string;
}

function statusHint(status: string | null | undefined, cancelAtPeriodEnd?: boolean | null) {
  const s = (status || "").toLowerCase();
  if (s === "active" && cancelAtPeriodEnd) return "Scheduled to cancel at period end.";
  if (s === "active") return "Your plan is running normally.";
  if (s === "trialing") return "Trial is active.";
  if (s === "past_due") return "Payment issue—update billing to continue.";
  if (s === "canceled") return "Canceled. You can restart anytime.";
  if (!s) return "No Auto-Ship plan yet.";
  return "Manage billing for details.";
}

function planLabelFromValue(lookupKeyOrPriceId: string | null | undefined) {
  const v = (lookupKeyOrPriceId || "").toLowerCase();
  if (v.includes("16oz")) return "ReefCultures 16oz Phyto — Auto-Ship (Monthly)";
  if (v.includes("32oz")) return "ReefCultures 32oz Phyto — Auto-Ship (Monthly)";
  return "ReefCultures Auto-Ship Plan";
}

function toOrderStatusFromStripeSession(s: any): DashboardOrder["status"] {
  const paymentStatus = typeof s?.payment_status === "string" ? s.payment_status : "";
  const sessionStatus = typeof s?.status === "string" ? s.status : "";

  if (sessionStatus === "expired") return "Canceled";
  if (paymentStatus === "unpaid") return "Canceled";
  if (paymentStatus === "paid") return "Processing";
  return "Processing";
}

function makeRcLabel(sessionId: string) {
  // Use last 4 chars to resemble your screenshot (#RC-1042 style)
  // Stripe ids are alphanumeric, so it will look like #RC-A1B2 (still clean).
  const tail = sessionId.slice(-4).toUpperCase();
  return `#RC-${tail}`;
}

export async function getLiveDashboardData(userId: string): Promise<DashboardData> {
  // 1) Profile (stripe_customer_id)
  const { data: profile } = await (supabaseAdmin as any)
    .from("profiles")
    .select("stripe_customer_id,email")
    .eq("id", userId)
    .maybeSingle();

  const stripeCustomerId: string | null =
    typeof profile?.stripe_customer_id === "string" ? profile.stripe_customer_id : null;

  // 2) Subscription
  const { data: subRow } = await (supabaseAdmin as any)
    .from("subscriptions")
    .select("stripe_price_id,status,current_period_end,cancel_at_period_end,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const subStatus: string | null = typeof subRow?.status === "string" ? subRow.status : null;
  const cancelAtPeriodEnd: boolean | null =
    typeof subRow?.cancel_at_period_end === "boolean" ? subRow.cancel_at_period_end : null;

  const nextDate = subRow?.current_period_end ? new Date(subRow.current_period_end) : null;

  const subscription: DashboardSubscription = {
    statusLabel: statusToLabel(subStatus),
    statusHint: statusHint(subStatus, cancelAtPeriodEnd),
    planLabel: planLabelFromValue(subRow?.stripe_price_id ?? null),
    nextShipLabel: nextDate ? formatDateShort(nextDate) : "—",
    nextShipHint: nextDate
      ? "Renews automatically on your billing date."
      : "Start Auto-Ship to schedule recurring deliveries.",
  };

  // 3) Orders (Stripe sessions)
  let orders: DashboardOrder[] = [];

  if (stripeCustomerId) {
    const sessions = await stripe.checkout.sessions.list({
      customer: stripeCustomerId,
      limit: 10,
    });

    orders = (sessions.data || []).map((s: any) => {
      const created = typeof s.created === "number" ? new Date(s.created * 1000) : new Date();
      const totalCents = typeof s.amount_total === "number" ? s.amount_total : null;
      const currency = typeof s.currency === "string" ? s.currency : "usd";

      const mode = typeof s.mode === "string" ? s.mode : "payment";
      const itemsLabel = mode === "subscription" ? "Auto-Ship" : "Phyto";

      const id = s.id ? String(s.id) : `order_${created.getTime()}`;

      return {
        id,
        orderLabel: makeRcLabel(id),
        dateLabel: formatDateShort(created),
        itemsLabel,
        totalLabel: formatMoney(totalCents, currency),
        status: toOrderStatusFromStripeSession(s),
        tracking: null,
      };
    });
  }

  const totalOrders = orders.length;
  const lastOrderLabel = totalOrders > 0 ? orders[0].dateLabel : "—";

  const stats: DashboardStats = {
    totalOrders,
    lastOrderLabel,
    savingsLabel: "$0.00",
    savingsHint: "Auto-Ship savings will appear here.",
  };

  return { subscription, orders, stats };
}