"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/products";
import { Reveal } from "@/components/ui/Reveal";
import { addToCart } from "@/lib/cart";
import CartBadgeLink from "@/components/cart/CartBadgeLink";

function imageForProduct(p: { slug: string; size?: string }) {
  const s = `${p.slug} ${p.size ?? ""}`.toLowerCase();
  if (s.includes("64")) return "/images/bottles/IMG_0094.jpeg";
  if (s.includes("32")) return "/images/bottles/IMG_0093.jpeg";
  if (s.includes("16")) return "/images/bottles/IMG_0092.jpeg";
  return "/images/bottles/IMG_0092.jpeg";
}

type StoreClientProps = { isSignedIn?: boolean };

export default function StoreClient({}: StoreClientProps) {
  const [notice, setNotice] = useState<string | null>(null);

  function onAddToCart(slug: string, size: string) {
    addToCart(slug, 1);
    setNotice(`${size} added to cart.`);
    window.setTimeout(() => setNotice(null), 2200);
  }

  function productHref(slug: string) {
    return `/store/${slug}`;
  }

  return (
    <main className="pt-20">
      <section className="rc-section bg-band">
        <div className="rc-container">
          <Reveal>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="rc-kicker text-muted">Store</div>
                <h1 className="mt-4 text-display font-bold">Choose the bottle size that fits your reef.</h1>
                <p className="mt-5 max-w-3xl text-muted leading-relaxed">
                  High-density live marine phytoplankton, batch tracked and refrigerated. Add bottles to your cart first,
                  then choose $6.99 flat-rate cold shipping or free local pickup during checkout.
                </p>
              </div>
              <CartBadgeLink />
            </div>
          </Reveal>

          {notice ? (
            <div className="mt-6 rounded-2xl border border-[rgba(29,211,197,0.28)] bg-[rgba(29,211,197,0.08)] px-4 py-3 text-sm text-white/85">
              {notice} <Link href="/cart" className="font-semibold text-white underline underline-offset-4">View cart</Link>
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["Shipping", "$6.99 flat-rate cold shipping per order"],
              ["Pickup", "Free local pickup with emailed instructions"],
              ["Checkout", "Build your cart first, then complete checkout through Stripe"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-white/80 ring-1 ring-white/[0.05]"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                  {label}
                </div>
                <div className="mt-2 text-base font-semibold text-white">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] ring-1 ring-white/[0.06]">
            <div className="grid grid-cols-4 gap-0 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-[11px] uppercase tracking-[0.22em] text-white/55">
              <div>Size</div>
              <div>Best for</div>
              <div>Use case</div>
              <div>Bottle price</div>
            </div>
            {products.map((product) => (
              <div
                key={product.slug}
                className="grid grid-cols-4 gap-0 border-b border-white/10 px-5 py-5 text-sm text-white/78 last:border-b-0"
              >
                <div className="font-semibold text-white">{product.size}</div>
                <div>{product.bestFor}</div>
                <div>{product.approxCoverage}</div>
                <div>{product.priceLabel}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {products.map((p, idx) => (
              <Reveal key={p.slug} delay={0.05 + idx * 0.04}>
                <div className="rc-box rounded-3xl p-6 ring-1 ring-white/[0.06] shadow-[0_18px_60px_-32px_rgba(0,0,0,0.7)] h-full">
                  <div className="flex h-full flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted">{p.size}</div>
                        <div className="mt-3 text-[24px] font-semibold tracking-tightish">{p.name}</div>
                        <div className="mt-3 text-sm text-white/72">{p.bestFor}</div>
                      </div>
                      <div className="relative h-[140px] w-[92px] shrink-0">
                        <div className="pointer-events-none absolute left-1/2 bottom-2 h-7 w-[70%] -translate-x-1/2 rounded-full bg-black/40 blur-2xl" />
                        <Image
                          src={imageForProduct(p)}
                          alt={`${p.name} ${p.size ?? ""}`}
                          fill
                          className="object-contain object-center drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                          priority={idx === 0}
                          sizes="(max-width: 1024px) 100vw, 33vw"
                        />
                      </div>
                    </div>

                    <p className="mt-5 text-sm leading-relaxed text-muted">{p.subtitle}</p>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/15 p-4">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.18em] text-muted">Bottle price</div>
                          <div className="mt-2 text-[30px] font-semibold text-white">{p.priceLabel}</div>
                        </div>
                        <div className="text-right text-[11px] uppercase tracking-[0.18em] text-[rgba(29,211,197,0.85)]">
                          <div>$6.99 ship</div>
                          <div className="mt-1">Free pickup</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-2">
                      {p.bullets.map((b) => (
                        <div key={b} className="text-sm text-muted">• {b}</div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {p.useCases.map((tag) => (
                        <div
                          key={tag}
                          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/65"
                        >
                          {tag}
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center gap-3 pt-6">
                      <button
                        type="button"
                        onClick={() => onAddToCart(p.slug, p.size)}
                        className="inline-flex flex-1 items-center justify-center rounded-2xl bg-white px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.20em] text-black transition hover:bg-white/90"
                      >
                        Add to cart
                      </button>

                      <Link
                        href={productHref(p.slug)}
                        className="inline-flex items-center justify-center rounded-2xl border border-hair px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.20em] text-muted transition hover:border-accent hover:text-ink"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
