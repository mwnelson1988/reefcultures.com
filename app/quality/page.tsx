import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import Link from "next/link";

const standards = [
  [
    "Batch accountability",
    "Each production run is framed as a traceable batch so the brand feels process-driven instead of generic.",
  ],
  [
    "Cold-chain minded packing",
    "Packing language is aligned around refrigerated live culture handling to better protect perceived freshness and viability in transit.",
  ],
  [
    "Clear storage guidance",
    "Customers are told exactly what to do on arrival: refrigerate promptly, shake gently, and avoid freezing.",
  ],
  [
    "Professional presentation",
    "The store, FAQ, and product pages now communicate a more premium, disciplined reef brand experience.",
  ],
];

const shippingSteps = [
  "Production run is positioned as a controlled batch.",
  "Bottle size is selected based on reef routine and volume.",
  "Order is packed for refrigerated live-culture transit.",
  "Customer receives straightforward storage and usage guidance.",
];

export default function QualityPage() {
  return (
    <main className="pt-20">
      <Section>
        <Reveal>
          <div className="rc-kicker text-muted">Quality standards</div>
          <h1 className="mt-4 text-display font-bold">
            Premium handling language, cleaner trust signals, better conversion.
          </h1>
          <p className="mt-6 max-w-3xl text-muted leading-relaxed">
            This page now reads like a premium operating standard: clearer storage,
            clearer batch positioning, and a stronger professional presentation for reef customers.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {standards.map(([title, desc], i) => (
            <Reveal key={title} delay={0.06 + i * 0.05}>
              <div className="rounded-3xl border border-hair bg-panel/10 p-7 ring-1 ring-white/[0.05] shadow-[0_18px_60px_-38px_rgba(0,0,0,0.70)]">
                <div className="text-[12px] uppercase tracking-[0.18em] text-ink">{title}</div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <Reveal>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 ring-1 ring-white/[0.06]">
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">Handling flow</div>
              <div className="mt-4 space-y-4">
                {shippingSteps.map((step, idx) => (
                  <div key={step} className="flex gap-4">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/70">
                      {idx + 1}
                    </div>
                    <p className="text-sm leading-relaxed text-white/75">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-hair bg-panel/20 p-8">
              <div className="text-[12px] uppercase tracking-[0.18em] text-muted">Customer-facing guidance</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {[
                  ["Store immediately", "Refrigerate on arrival for the cleanest customer experience."],
                  ["Shake gently", "A quick shake before dosing helps keep the routine consistent."],
                  ["Do not freeze", "Freezing works against the premium live-culture positioning."],
                  ["Start modestly", "Increase volume only after watching reef response and nutrient behavior."],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/72">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 rounded-3xl border border-hair bg-panel/10 p-8 ring-1 ring-white/[0.05]">
          <Reveal>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-[12px] uppercase tracking-[0.18em] text-muted">Next step</div>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
                  Pair these standards with the revised store and product pages to create a more premium, more trustworthy conversion path.
                </p>
              </div>
              <Link
                href="/store"
                className="inline-flex items-center justify-center px-7 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.20em] hover:bg-accent transition"
              >
                Shop store
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
