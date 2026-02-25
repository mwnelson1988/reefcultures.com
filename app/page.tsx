import Link from "next/link";
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

export default function HomePage() {
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-ocean-radial" />
        <div className="rc-container relative pt-16 pb-12 md:pt-20 md:pb-16">
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
                High-density live cultures. Batch-tracked production. Cold-chain shipping. Built to support consistent dosing and
                measurable results.
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
          </div>

          {/* Proof strip */}
          <Reveal delay={0.16}>
            <div className="mt-14 border-t border-hair pt-8">
              <div className="grid gap-5 md:grid-cols-4">
                {proof.map((p) => (
                  <div key={p.k} className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-muted">{p.k}</div>
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
                <div className="rc-kicker text-muted">Designed for consistency</div>
                <h2 className="mt-4 text-display font-bold">A clean, repeatable feeding workflow.</h2>
                <p className="mt-6 text-muted leading-relaxed">
                  Premium reefkeeping is about reducing variability. ReefCultures prioritizes process discipline and clear guidance so
                  you can build stable routines.
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
                    <div className="border border-hair bg-panel/10 p-7">
                      <div className="text-[12px] uppercase tracking-[0.22em] text-ink/90">{f.title}</div>
                      <p className="mt-3 text-sm text-muted leading-relaxed">{f.desc}</p>

                      <div className="mt-6 h-px w-full bg-hair" />

                      <div className="mt-5 text-[12px] uppercase tracking-[0.22em] text-muted">
                        Built for daily dosing
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
          <div className="border border-hair bg-panel/10 p-10 md:p-12">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <Reveal>
                  <div className="rc-kicker text-muted">Get started</div>
                  <h3 className="mt-4 text-display font-bold">Choose a size. Start a routine. Track results.</h3>
                  <p className="mt-6 text-muted leading-relaxed max-w-2xl">
                    Start with your system volume and dosing frequency. We’ll keep the process simple and the product consistent.
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