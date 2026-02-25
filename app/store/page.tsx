"use client";

import Link from "next/link";
import Image from "next/image";
import { products } from "@/lib/products";
import { Reveal } from "@/components/ui/Reveal";

async function startCheckout(slug: string) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug }),
  });

  // SAFELY parse response (handles empty body / HTML error pages)
  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.error || raw || `Checkout failed (${res.status})`;
    alert(msg);
    return;
  }

  if (data?.url) {
    window.location.href = data.url;
    return;
  }

  alert("Checkout error: missing session URL.");
}

function imageForProduct(p: { slug: string; size?: string }) {
  const s = `${p.slug} ${p.size ?? ""}`.toLowerCase();

  if (s.includes("64")) return "/phyto-64oz.png";
  if (s.includes("32")) return "/phyto-32oz.png";
  if (s.includes("16")) return "/phyto-16oz.png";

  // Fallback (never return undefined)
  return "/phyto-16oz.png";
}

export default function StorePage() {
  return (
    <main className="pt-20">
      <section className="rc-section bg-band">
        <div className="rc-container">
          <Reveal>
            <div className="rc-kicker text-muted">Store</div>
            <h1 className="mt-4 text-display font-bold">Live cultures, shipped cold.</h1>
            <p className="mt-5 max-w-2xl text-muted leading-relaxed">
              Choose a size based on system volume and dosing frequency. Same standards. Same cold-chain discipline.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {products.map((p, idx) => (
              <Reveal key={p.slug} delay={0.06 + idx * 0.05}>
                <div className="rc-box p-8">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="grid gap-6">
                      {/* Row 1 */}
                      <div className="grid grid-cols-[1fr_110px] items-start gap-8">
                        <div className="min-w-0">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-muted">
                            {p.size}
                          </div>
                          <div className="mt-3 text-[28px] leading-[1.05] font-semibold tracking-tightish">
                            {p.name}
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <div className="relative h-[118px] w-[92px] overflow-hidden rounded-2xl border border-hair bg-panel/10">
                            <Image
                              src={imageForProduct(p)}
                              alt={`${p.name} ${p.size ?? ""}`}
                              fill
                              className="object-contain p-2"
                              priority={idx === 0}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 2 */}
                      <div className="grid grid-cols-[1fr_180px] items-start gap-8">
                        <p className="text-sm text-muted leading-relaxed max-w-[60ch]">
                          {p.subtitle}
                        </p>

                        <div className="text-right">
                          <div className="text-[11px] uppercase tracking-[0.22em] text-muted">
                            {p.size === "32oz" ? "Best value" : "Price"}
                          </div>
                          <div className="mt-2 text-2xl font-semibold">{p.priceLabel}</div>

                          {p.size === "32oz" ? (
                            <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-accent">
                              Save 30%
                            </div>
                          ) : (
                            <div className="mt-2 text-[11px] uppercase tracking-[0.22em] text-muted">
                              Cold-chain shipped
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 rc-divider" />

                    {/* Bullets */}
                    <div className="mt-7 grid gap-2">
                      {p.bullets.slice(0, 3).map((b) => (
                        <div key={b} className="text-sm text-muted leading-relaxed">
                          • {b}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-8 flex flex-wrap gap-4">
                      <Link
                        href={`/store/${p.slug}`}
                        className="inline-flex items-center justify-center min-w-[120px] px-6 py-3 border border-hair text-[12px] font-semibold uppercase tracking-[0.20em] hover:border-accent hover:text-accent transition"
                      >
                        Details
                      </Link>

                      <button
                        onClick={() => startCheckout(p.slug)}
                        className="inline-flex items-center justify-center min-w-[120px] px-6 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.20em] hover:bg-[rgba(29,211,197,0.95)] transition"
                      >
                        Buy
                      </button>
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