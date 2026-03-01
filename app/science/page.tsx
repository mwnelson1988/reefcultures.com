import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import Link from "next/link";

const pillars = [
  {
    title: "Cultivation",
    desc: "Controlled growth conditions and handling designed to protect live cultures.",
  },
  {
    title: "Density targets",
    desc: "Consistency-first approach to reduce batch-to-batch surprises.",
  },
  {
    title: "Packaging",
    desc: "Cold-chain oriented packaging to preserve viability through transit.",
  },
];

const standards = [
  { k: "Batch tracked", v: "Every run logged + traceable" },
  { k: "Cold-chain", v: "Packed to protect viability" },
  { k: "Reef-safe", v: "Clear handling + dosing guidance" },
];

const timeline = [
  {
    t: "Culture start",
    d: "Clean inputs, controlled start conditions.",
  },
  {
    t: "Controlled growth",
    d: "Light cycle + nutrient discipline for repeatability.",
  },
  {
    t: "Density checks",
    d: "Targets verified to reduce variability.",
  },
  {
    t: "Batch label",
    d: "Run ID applied for traceability.",
  },
  {
    t: "Cold-pack ship",
    d: "Packed for stability in transit.",
  },
];

const faqs = [
  {
    q: "How should I store it?",
    a: "Keep refrigerated. Avoid heat and prolonged light exposure. Shake gently before dosing.",
  },
  {
    q: "What dosing range should I start with?",
    a: "Start small and build consistency. Increase gradually based on system response and nutrient export goals.",
  },
  {
    q: "How is it shipped?",
    a: "Cold-chain oriented packaging designed to protect viability and preserve density during transit.",
  },
  {
    q: "Will it work for pods and filter feeders?",
    a: "Yes—designed to support consistent feeding routines for corals, copepods, and filter feeders.",
  },
];

function Card({
  title,
  desc,
}: {
  title: string;
  desc: string;
}) {
  return (
    <div
      className={[
        "group relative overflow-hidden",
        "rounded-3xl border border-white/10 bg-white/[0.03]",
        "ring-1 ring-white/[0.06]",
        "p-6 sm:p-7",
        "transition-transform duration-300 will-change-transform",
        "hover:-translate-y-0.5 hover:border-white/20",
      ].join(" ")}
    >
      <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute -right-28 -bottom-28 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="relative">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/65">
          {title}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-white/78">{desc}</p>
      </div>
    </div>
  );
}

function DividerLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-px flex-1 bg-white/10" />
      <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
        {label}
      </div>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export default function SciencePage() {
  return (
    <main className="pt-20">
      <Section>
        {/* Hero */}
        <Reveal>
          <div className="text-center">
            <div className="rc-kicker text-muted">Science</div>

            <h1 className="mt-4 text-display font-bold text-ink">
              Marine cultures, built with process discipline.
            </h1>

            <p className="mt-5 mx-auto max-w-3xl text-muted leading-relaxed">
              ReefCultures focuses on repeatability—clean handling, consistent
              density targets, and packaging designed for cold-chain delivery.
            </p>

            {/* Standards strip */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {standards.map((s) => (
                <div
                  key={s.k}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2"
                >
                  <span className="text-[11px] uppercase tracking-[0.22em] text-white/70">
                    {s.k}
                  </span>
                  <span className="text-xs text-white/70">•</span>
                  <span className="text-xs text-white/75">{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Pillars */}
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={0.06 + i * 0.05}>
              <Card title={p.title} desc={p.desc} />
            </Reveal>
          ))}
        </div>

        {/* Process timeline */}
        <div className="mt-12">
          <Reveal>
            <DividerLabel label="Workflow" />
          </Reveal>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            {timeline.map((step, i) => (
              <Reveal key={step.t} delay={0.06 + i * 0.04}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] ring-1 ring-white/[0.06] p-5">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                      Step {i + 1}
                    </div>
                    <div className="h-7 w-7 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/70 flex items-center justify-center">
                      {i + 1}
                    </div>
                  </div>
                  <div className="mt-3 text-sm font-semibold text-white">
                    {step.t}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    {step.d}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <Reveal>
            <DividerLabel label="FAQ" />
          </Reveal>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={0.06 + i * 0.04}>
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] ring-1 ring-white/[0.06] p-6">
                  <div className="text-sm font-semibold text-white">{f.q}</div>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    {f.a}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12">
          <Reveal>
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] ring-1 ring-white/[0.06] p-8 sm:p-10">
              <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
                <div className="lg:col-span-7">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">
                    Next step
                  </div>
                  <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                    Choose a size. Start a routine. Track results.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/75">
                    Build a consistent feeding workflow with cold-chain shipped,
                    batch-tracked live cultures.
                  </p>
                </div>

                <div className="lg:col-span-5 lg:flex lg:justify-end">
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/store"
                      className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.20em] text-black hover:bg-white/90 transition"
                    >
                      Shop live phyto
                    </Link>
                    <Link
                      href="/quality"
                      className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.20em] text-white hover:bg-white/[0.08] transition"
                    >
                      Quality standards
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}