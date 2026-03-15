"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/products";
import { Reveal } from "@/components/ui/Reveal";
import DoseEstimator from "@/components/DoseEstimator";

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

function galleryForSlug(slug: string) {
  if (slug.includes("64"))
    return [
      "/images/bottles/IMG_0094.jpeg",
      "/images/bottles/IMG_0093.jpeg",
      "/images/bottles/IMG_0092.jpeg",
    ];
  if (slug.includes("32"))
    return [
      "/images/bottles/IMG_0093.jpeg",
      "/images/bottles/IMG_0092.jpeg",
      "/images/bottles/IMG_0094.jpeg",
    ];
  return [
    "/images/bottles/IMG_0092.jpeg",
    "/images/bottles/IMG_0093.jpeg",
    "/images/bottles/IMG_0094.jpeg",
  ];
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

  const gallery = galleryForSlug(product.slug);

  return (
    <main className="pt-20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-ocean-radial" />
        <div className="rc-container relative py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <Reveal>
                <div className="rc-kicker text-muted">Product</div>
                <h1 className="mt-4 text-hero font-extrabold">
                  {product.name} <span className="text-muted">/ {product.size}</span>
                </h1>
                <p className="mt-6 max-w-2xl text-muted leading-relaxed">{product.subtitle}</p>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    ["Best for", product.bestFor],
                    ["Positioning", product.approxCoverage],
                    ["Shipping", "Cold-chain shipping included"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75"
                    >
                      <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">{label}</div>
                      <div className="mt-1 font-semibold text-white">{value}</div>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <button
                    onClick={() => startCheckout(product.slug)}
                    className="inline-flex items-center justify-center px-6 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.18em] hover:bg-accent transition"
                  >
                    Buy for {product.priceLabel}
                  </button>

                  <Link
                    href="/store"
                    className="inline-flex items-center justify-center px-6 py-3 border border-hair text-[12px] font-semibold uppercase tracking-[0.18em] hover:border-accent hover:text-accent transition"
                  >
                    Back to Store
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="mt-8 flex flex-wrap gap-2">
                  {product.useCases.map((tag) => (
                    <div
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/65"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.14}>
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 sm:col-span-3 lg:col-span-1">
                  <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-black/20">
                    <Image
                      src={gallery[0]}
                      alt={`${product.name} ${product.size}`}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 sm:col-span-3 lg:grid-cols-3">
                  {gallery.map((src) => (
                    <div
                      key={src}
                      className="relative h-[130px] overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                    >
                      <Image
                        src={src}
                        alt={`${product.name} bottle`}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="rc-section pt-0">
        <div className="rc-container">
          <Reveal>
            <DoseEstimator compact />
          </Reveal>
        </div>
      </section>

      <section className="rc-section">
        <div className="rc-container">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Reveal>
                <div className="rc-kicker text-muted">Why this size works</div>
                <h2 className="mt-4 text-display font-bold">Built for a cleaner purchase decision.</h2>
                <p className="mt-6 text-muted leading-relaxed">
                  This page now leads with fit, shipped pricing, and usage context so the customer understands not just what the bottle is, but who it is best for.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4">
                {product.bullets.map((b, i) => (
                  <Reveal key={b} delay={0.06 + i * 0.05}>
                    <div className="rounded-3xl border border-hair bg-panel/20 p-6 ring-1 ring-white/[0.05]">
                      <div className="text-[12px] uppercase tracking-[0.18em] text-ink">{b}</div>
                      <p className="mt-3 text-sm text-muted leading-relaxed">
                        Positioned to support a premium reef-feeding workflow with less
                        guesswork, stronger presentation, and a more trustworthy buying path.
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ["Storage", "Keep refrigerated. Shake gently before use. Do not freeze."],
              ["Routine", "Start modestly, watch system response, then increase only if your reef shows demand."],
              ["Transit", "Cold-chain shipping is included so checkout stays clean and predictable."],
            ].map(([t, d], idx) => (
              <Reveal key={t} delay={0.08 + idx * 0.05}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
                  <div className="text-[12px] uppercase tracking-[0.18em] text-muted">{t}</div>
                  <div className="mt-3 text-sm text-muted leading-relaxed">{d}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
