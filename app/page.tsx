// app/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";

const features = [
  {
    title: "Batch tracked",
    desc: "Traceable production runs with consistent inputs and process control.",
  },
  {
    title: "Cold chain",
    desc: "Shipped cold to protect viability and preserve density in transit.",
  },
  {
    title: "High density",
    desc: "Built for daily dosing and measurable nutrient export workflows.",
  },
  {
    title: "Reef-safe",
    desc: "Clear handling guidance and straightforward dosing ranges.",
  },
];

const proof = [
  { k: "Cold-pack", v: "Ship-ready packaging" },
  { k: "Batch ID", v: "Traceable runs" },
  { k: "Guidance", v: "Dosing + storage" },
  { k: "Support", v: "Fast customer response" },
];

function Tile({
  kicker,
  title,
  body,
  href,
  hrefLabel,
  imageSrc,
  imageAlt,
  mode = "cover",
}: {
  kicker: string;
  title: string;
  body: string;
  href: string;
  hrefLabel: string;
  imageSrc: string;
  imageAlt: string;
  mode?: "cover" | "product";
}) {
  const isProduct = mode === "product";

  return (
    <div
      className={[
        // Cleaner, premium surface system (reduces “wireframe” look)
        "group overflow-hidden rounded-3xl border border-hair bg-panel/10 ring-1 ring-white/[0.06]",
        "shadow-[0_18px_60px_-30px_rgba(0,0,0,0.75)]",
        "transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-white/25 hover:bg-panel/15",
      ].join(" ")}
    >
      {/* media */}
      <div className="relative h-[360px] w-full bg-bg/20 overflow-hidden">
        {isProduct ? (
          <>
            {/* premium stage */}
            <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_35%,rgba(255,255,255,0.12),rgba(0,0,0,0))]" />
            <div className="absolute inset-0 bg-gradient-to-b from-bg/0 via-bg/10 to-bg/70" />

            {/* IMPORTANT: remove the "inner rectangle" by lightly zoom-cropping bottle.png */}
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover object-center scale-[1.12] drop-shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
              />
            </div>

            {/* subtle floor shadow */}
            <div className="absolute left-1/2 bottom-6 h-10 w-[62%] -translate-x-1/2 rounded-full bg-black/25 blur-xl" />

            {/* clean top fade */}
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-bg/35 to-transparent" />
          </>
        ) : (
          <>
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-cover object-center scale-[1.02] transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />

            {/* cleaner overlay: less “boxed” but still readable */}
            <div className="absolute inset-0 bg-black/25" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-bg/80" />
            <div className="absolute inset-0 shadow-[inset_0_-120px_180px_rgba(0,0,0,0.45)]" />
          </>
        )}
      </div>

      {/* text */}
      <div className="p-7">
        <div className="text-[11px] uppercase tracking-[0.22em] text-muted">
          {kicker}
        </div>
        <div className="mt-3 text-xl font-semibold text-ink">{title}</div>
        <p className="mt-4 text-sm text-muted leading-relaxed">{body}</p>

        <div className="mt-6">
          <Link
            href={href}
            className="text-[12px] uppercase tracking-[0.22em] text-muted hover:text-accent transition"
          >
            {hrefLabel} →
          </Link>
        </div>

        <div className="mt-8 h-px w-full bg-hair" />
        <div className="mt-5 text-[12px] uppercase tracking-[0.22em] text-muted">
          Built for daily dosing
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-ocean-radial" />
        <div className="rc-container relative pt-16 pb-10 md:pt-20 md:pb-12">
          <div className="max-w-4xl">
            <Reveal>
              <div className="rc-kicker text-muted">ReefCultures</div>
              <h1 className="mt-5 text-hero font-extrabold">
                Live phytoplankton,
                <br />
                engineered for reef performance.
              </h1>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="mt-7 max-w-2xl text-muted leading-relaxed">
                High-density live cultures. Batch-tracked production. Cold-chain
                shipping. Built to support consistent dosing and measurable
                results.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/store"
                  className="inline-flex items-center justify-center px-7 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.20em] hover:bg-accent transition"
                >
                  Shop
                </Link>
                <Link
                  href="/quality"
                  className="inline-flex items-center justify-center px-7 py-3 border border-hair text-[12px] font-semibold uppercase tracking-[0.20em] text-muted hover:text-ink hover:border-accent transition"
                >
                  Quality standards
                </Link>
              </div>
            </Reveal>

            {/* tiles */}
            <Reveal delay={0.14}>
              <div className="mt-12 grid gap-4 md:grid-cols-3">
                <Tile
                  kicker="Product"
                  title="Live Marine Phytoplankton"
                  body="Small-batch cultured for controlled density and repeatable daily dosing workflows."
                  href="/store"
                  hrefLabel="Shop"
                  imageSrc="/images/bottle.png"
                  imageAlt="ReefCultures LIVE Marine Phytoplankton bottle"
                  mode="product"
                />
                <Tile
                  kicker="Process"
                  title="Batch-tracked production"
                  body="Traceable runs with consistent inputs and process control — shipped cold to preserve viability in transit."
                  href="/quality"
                  hrefLabel="Quality standards"
                  imageSrc="/images/process.jpg"
                  imageAlt="ReefCultures production process"
                  mode="cover"
                />
                <Tile
                  kicker="Result"
                  title="Engineered for reef performance"
                  body="Supports consistent feeding routines and measurable nutrient export — designed for clean, repeatable outcomes."
                  href="/science"
                  hrefLabel="Explore science"
                  imageSrc="/images/reef-performance.jpg"
                  imageAlt="Reef performance coral reef"
                  mode="cover"
                />
              </div>
            </Reveal>
          </div>

          {/* Proof strip (cleaner: no huge dead zone + softer separator) */}
          <Reveal delay={0.16}>
            <div className="mt-10 border-t border-hair/80 pt-7">
              <div className="grid gap-5 md:grid-cols-4">
                {proof.map((p) => (
                  <div key={p.k} className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted">
                      {p.k}
                    </div>
                    <div className="mt-2 text-sm text-ink/85">{p.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* VALUE GRID */}
      <section className="rc-section">
        <div className="rc-container">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <div className="rc-kicker text-muted">
                  Designed for consistency
                </div>
                <h2 className="mt-4 text-display font-bold">
                  A clean, repeatable feeding workflow.
                </h2>
                <p className="mt-6 text-muted leading-relaxed">
                  Premium reefkeeping is about reducing variability.
                  ReefCultures prioritizes process discipline and clear guidance
                  so you can build stable routines.
                </p>

                <div className="mt-8">
                  <Link
                    href="/science"
                    className="text-[12px] uppercase tracking-[0.22em] text-muted hover:text-accent transition"
                  >
                    Explore science →
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((f, idx) => (
                  <Reveal key={f.title} delay={0.06 + idx * 0.05}>
                    <div
                      className={[
                        // Match the tile surface language (reduces harsh outlines)
                        "rounded-3xl border border-hair bg-panel/10 ring-1 ring-white/[0.05]",
                        "p-7",
                        "shadow-[0_18px_60px_-38px_rgba(0,0,0,0.70)]",
                        // Equalize card height & footer alignment
                        "min-h-[220px] flex flex-col",
                      ].join(" ")}
                    >
                      <div className="text-[12px] uppercase tracking-[0.22em] text-ink/90">
                        {f.title}
                      </div>
                      <p className="mt-3 text-sm text-muted leading-relaxed">
                        {f.desc}
                      </p>

                      <div className="mt-auto">
                        <div className="mt-6 h-px w-full bg-hair" />
                        <div className="mt-5 text-[12px] uppercase tracking-[0.22em] text-muted">
                          Built for daily dosing
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rc-section">
        <div className="rc-container">
          <div className="rounded-3xl border border-hair bg-panel/10 ring-1 ring-white/[0.06] p-10 md:p-12 shadow-[0_18px_70px_-45px_rgba(0,0,0,0.75)]">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <Reveal>
                  <div className="rc-kicker text-muted">Get started</div>
                  <h3 className="mt-4 text-display font-bold">
                    Choose a size. Start a routine. Track results.
                  </h3>
                  <p className="mt-6 text-muted leading-relaxed max-w-2xl">
                    Start with your system volume and dosing frequency. We’ll
                    keep the process simple and the product consistent.
                  </p>
                </Reveal>
              </div>

              <div className="lg:col-span-5 lg:flex lg:justify-end">
                <Reveal delay={0.08}>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/store"
                      className="inline-flex items-center justify-center px-7 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.20em] hover:bg-accent transition"
                    >
                      Shop now
                    </Link>
                    <Link
                      href="/faq"
                      className="inline-flex items-center justify-center px-7 py-3 border border-hair text-[12px] font-semibold uppercase tracking-[0.20em] text-muted hover:text-ink hover:border-accent transition"
                    >
                      FAQ
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}