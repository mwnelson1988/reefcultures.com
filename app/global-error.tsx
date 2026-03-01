"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink min-h-screen">
        <div className="min-h-screen bg-ocean-radial pt-24">
          <section className="rc-section">
            <div className="rc-container max-w-3xl">
              <div className="rc-kicker">System</div>
              <h1 className="mt-4 text-display font-semibold">Critical error.</h1>
              <p className="mt-4 text-muted">
                A site-level error occurred. You can retry or return home.
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
        </div>
      </body>
    </html>
  );
}