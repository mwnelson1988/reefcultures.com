"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/products";
import { Reveal } from "@/components/ui/Reveal";
import DoseEstimator from "@/components/DoseEstimator";
import { addToCart } from "@/lib/cart";
import CartBadgeLink from "@/components/cart/CartBadgeLink";

function galleryForSlug(slug: string) {
  if (slug.includes("64")) {
    return [
      "/images/bottles/IMG_0094.jpeg",
      "/images/bottles/IMG_0093.jpeg",
      "/images/bottles/IMG_0092.jpeg",
    ];
  }
  if (slug.includes("32")) {
    return [
      "/images/bottles/IMG_0093.jpeg",
      "/images/bottles/IMG_0092.jpeg",
      "/images/bottles/IMG_0094.jpeg",
    ];
  }
  return [
    "/images/bottles/IMG_0092.jpeg",
    "/images/bottles/IMG_0093.jpeg",
    "/images/bottles/IMG_0094.jpeg",
  ];
}

export default function ProductPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const product = useMemo(() => products.find((p) => p.slug === slug), [slug]);

  if (!product) {
    return (
      <main className="pt-20">
        <section className="rc-section">
          <div className="rc-container">
            <div className="text-2xl font-semibold">Product not found</div>
            <p className="mt-4 text-muted">Return to the store to choose a bottle size.</p>
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
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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
                    ["Bottle price", product.priceLabel],
                    ["Checkout", "$6.99 shipping or free local pickup"],
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
                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product.slug, 1);
                      setNotice(`${product.size} added to cart.`);
                      window.setTimeout(() => setNotice(null), 2200);
                    }}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-white/90"
                  >
                    Add to cart
                  </button>

                  <CartBadgeLink />

                  <Link
                    href="/store"
                    className="inline-flex items-center justify-center rounded-2xl border border-hair px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] hover:border-accent hover:text-accent transition"
                  >
                    Back to Store
                  </Link>
                </div>
                {notice ? (
                  <div className="mt-4 rounded-2xl border border-[rgba(29,211,197,0.28)] bg-[rgba(29,211,197,0.08)] px-4 py-3 text-sm text-white/85">
                    {notice} <Link href="/cart" className="font-semibold text-white underline underline-offset-4">View cart</Link>
                  </div>
                ) : null}
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
                      <Image src={src} alt={`${product.name} bottle`} fill className="object-cover object-center" />
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
                <div className="rc-kicker text-muted">Overview</div>
                <h2 className="mt-4 text-display font-bold">Straightforward sizing for real feeding routines.</h2>
                <p className="mt-6 text-muted leading-relaxed">
                  The {product.size} bottle is designed to make sizing simple: match the bottle to your system volume,
                  feeding frequency, and how often you want to reorder.
                </p>
              </Reveal>
            </div>

            <div className="lg:col-span-7">
              <div className="grid gap-4">
                {product.bullets.map((b, i) => (
                  <Reveal key={b} delay={0.06 + i * 0.05}>
                    <div className="rounded-3xl border border-hair bg-panel/20 p-6 ring-1 ring-white/[0.05]">
                      <div className="text-[12px] uppercase tracking-[0.18em] text-ink">{b}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              ["Storage", "Keep refrigerated. Shake gently before use. Do not freeze."],
              ["Routine", "Start with a modest dose, watch system response, and increase only when your reef shows demand."],
              ["Fulfillment", "Choose $6.99 cold shipping or free local pickup before you enter Stripe checkout."],
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
