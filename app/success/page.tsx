import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="pt-20">
      <section className="rc-section">
        <div className="rc-container">
          <div className="rc-kicker text-muted">Checkout</div>
          <h1 className="mt-4 text-display font-bold">Order received.</h1>
          <p className="mt-6 text-muted max-w-2xl leading-relaxed">
            Thank you. You’ll receive a confirmation email from Stripe. Next step: wire the webhook to store orders in your account.
          </p>
          <Link
            href="/store"
            className="mt-10 inline-flex items-center justify-center px-6 py-3 border border-hair text-[12px] font-semibold uppercase tracking-[0.18em] hover:border-accent hover:text-accent transition"
          >
            Back to Store
          </Link>
        </div>
      </section>
    </main>
  );
}
