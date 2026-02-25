import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pt-24">
      <section className="rc-section">
        <div className="rc-container max-w-3xl">
          <div className="rc-kicker">404</div>
          <h1 className="mt-4 text-display font-semibold">Page not found.</h1>
          <p className="mt-4 text-muted">
            The page you’re looking for doesn’t exist or has moved.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2 border border-hair text-[12px] uppercase tracking-[0.20em] hover:border-accent hover:text-accent transition"
            >
              Home
            </Link>
            <Link
              href="/store"
              className="inline-flex items-center justify-center px-5 py-2 border border-hair text-[12px] uppercase tracking-[0.20em] hover:border-accent hover:text-accent transition"
            >
              Store
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}