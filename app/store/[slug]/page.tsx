"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { products } from "@/lib/products";
import { Reveal } from "@/components/ui/Reveal";

async function startCheckout(slug: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug }),
  });
  const data = await res.json();
  if (data?.url) window.location.href = data.url;
  else alert(data?.error || "Checkout error");
}

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const product = useMemo(() => products.find((p) => p.slug === slug), [slug]);

  if (!product) {
    return (
      <main className="pt-20">
        <section className="rc-section">
          <div className="rc-container">
            <div className="text-2xl font-semibold">Product not found</div>
            <p className="mt-4 text-muted">Return to the store to choose a product.</p>
            <Link
              href="/store"
              className="mt-8 inline-block text-[12px] uppercase tracking-[0.20em] text-muted hover:text-accent transition"
            >
              Back to Store →
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-ocean-radial" />
        <div className="rc-container relative py-16 md:py-24">
          <Reveal>
            <div className="rc-kicker text-muted">Product</div>
            <h1 className="mt-4 text-hero font-extrabold">
              {product.name} <span className="text-muted">/ {product.size}</span>
            </h1>
            <p className="mt-6 text-muted max-w-2xl leading-relaxed">{product.subtitle}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                onClick={() => startCheckout(product.slug)}
                className="inline-flex items-center justify-center px-6 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.18em] hover:bg-accent transition"
              >
                Buy {product.priceLabel}
              </button>

              <Link
                href="/store"
                className="inline-flex items-center justify-center px-6 py-3 border border-hair text-[12px] font-semibold uppercase tracking-[0.18em] hover:border-accent hover:text-accent transition"
              >
                Back to Store
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {[
                ["Dosing", "5–10 mL per gallon (adjust to system demand)."],
                ["Storage", "Refrigerate. Shake gently. Do not freeze."],
                ["Use", "For aquarium use only. Follow label guidance."],
              ].map(([t, d]) => (
                <div key={t} className="border border-hair bg-panel/20 p-6">
                  <div className="text-[12px] uppercase tracking-[0.18em] text-muted">{t}</div>
                  <div className="mt-3 text-sm text-muted leading-relaxed">{d}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="rc-section">
        <div className="rc-container">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="rc-kicker text-muted">Why it matters</div>
                <h2 className="mt-4 text-display font-bold">Consistency drives outcomes.</h2>
                <p className="mt-6 text-muted leading-relaxed">
                  Reef systems respond best to repeatable routines. ReefCultures focuses on predictable density, packaging discipline,
                  and clear guidance so you can build a stable feeding protocol.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4">
                {product.bullets.map((b, i) => (
                  <Reveal key={b} delay={0.06 + i * 0.05}>
                    <div className="border border-hair p-6">
                      <div className="text-[12px] uppercase tracking-[0.18em] text-ink">{b}</div>
                      <p className="mt-3 text-sm text-muted leading-relaxed">
                        Designed to support a premium reef feeding workflow with minimal guesswork.
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}