import { Suspense } from "react";
import ShippingClient from "./ShippingClient";

export default function ShippingPage() {
  return (
    <Suspense
      fallback={
        <div className="section-paper">
          <div className="mx-auto max-w-3xl px-6 pt-24 pb-24 text-slate-600">
            Loading shipping…
          </div>
        </div>
      }
    >
      <ShippingClient />
    </Suspense>
  );
}