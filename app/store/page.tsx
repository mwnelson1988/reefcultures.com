// app/store/page.tsx
import { Suspense } from "react";
import StoreClient from "./StoreClient";

function StoreFallback() {
  return (
    <main className="pt-20">
      <section className="rc-section bg-band">
        <div className="rc-container">
          <div className="rc-kicker text-muted">Store</div>
          <h1 className="mt-4 text-display font-bold">Loading…</h1>
          <p className="mt-5 max-w-2xl text-muted leading-relaxed">
            Preparing the store.
          </p>

          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            <div className="rc-box p-7">
              <div className="h-[240px] animate-pulse bg-white/5" />
            </div>
            <div className="rc-box p-7">
              <div className="h-[240px] animate-pulse bg-white/5" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={<StoreFallback />}>
      <StoreClient />
    </Suspense>
  );
}