import Stripe from "stripe";

export type StripeRevenueSummary = {
  gross_cents: number;
  fee_cents: number;
  refunds_cents: number;
  net_cents: number;
  net_after_refunds_cents: number;
};

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  return new Stripe(key);
}

function isRefundType(tx: Stripe.BalanceTransaction) {
  const type = String(tx.type || "").toLowerCase();
  return type === "refund" || type === "payment_refund";
}

function isChargeType(tx: Stripe.BalanceTransaction) {
  const type = String(tx.type || "").toLowerCase();
  return type === "charge" || type === "payment";
}

export async function getStripeRevenueSummary({
  start,
  end,
}: {
  start: Date;
  end: Date;
}): Promise<StripeRevenueSummary> {
  const stripe = getStripe();

  const gte = Math.floor(start.getTime() / 1000);
  const lt = Math.floor(end.getTime() / 1000);

  let gross = 0;
  let fees = 0;
  let refunds = 0;
  let net = 0;

  let startingAfter: string | undefined = undefined;

  for (let page = 0; page < 25; page++) {
    const res: Stripe.ApiList<Stripe.BalanceTransaction> =
      await stripe.balanceTransactions.list({
        limit: 100,
        created: { gte, lt },
        starting_after: startingAfter,
      });

    for (const tx of res.data) {
      if (isChargeType(tx) && (tx.amount ?? 0) > 0) {
        gross += tx.amount ?? 0;
        fees += tx.fee ?? 0;
        net += tx.net ?? 0;
        continue;
      }

      if (isRefundType(tx)) {
        refunds += Math.abs(tx.amount ?? 0);
      }
    }

    if (!res.has_more || res.data.length === 0) break;
    startingAfter = res.data[res.data.length - 1]?.id;
  }

  return {
    gross_cents: gross,
    fee_cents: fees,
    refunds_cents: refunds,
    net_cents: net,
    net_after_refunds_cents: gross - fees - refunds,
  };
}
