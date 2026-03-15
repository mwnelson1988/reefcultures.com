import Link from "next/link";

export default function CancelPage() {
  return (
    <main className="pt-20">
      <section className="rc-section">
        <div className="rc-container">
          <div className="rc-kicker text-muted">Checkout</div>
          <h1 className="mt-4 text-display font-bold">Checkout canceled.</h1>
          <p className="mt-6 text-muted max-w-2xl leading-relaxed">
            No charge was made. You can return to the store whenever you’re ready.
          </p>
          <Link
            href="/store"
            className="mt-10 inline-flex items-center justify-center px-6 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.18em] hover:bg-accent transition"
          >
            Return to Store
          </Link>
        </div>
      </section>
    </main>
  );
}
