"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <main className="pt-24">
      <section className="rc-section">
        <div className="rc-container max-w-3xl">
          <div className="rc-kicker">System</div>
          <h1 className="mt-4 text-display font-semibold">Something went wrong.</h1>
          <p className="mt-4 text-muted">
            We hit an unexpected error while loading this page. Try again, or head back home.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-5 py-2 border border-hair text-[12px] uppercase tracking-[0.20em] hover:border-accent hover:text-accent transition"
            >
              Retry
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-5 py-2 border border-hair text-[12px] uppercase tracking-[0.20em] hover:border-accent hover:text-accent transition"
            >
              Home
            </Link>
          </div>

          {process.env.NODE_ENV === "development" ? (
            <pre className="mt-10 whitespace-pre-wrap text-xs text-muted rc-box p-4 rounded-md">
              {String(error?.message || error)}
            </pre>
          ) : null}
        </div>
      </section>
    </main>
  );
}