import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export default function SciencePage() {
  return (
    <main className="pt-20">
      <Section>
        <Reveal>
          <div className="rc-kicker text-muted">Science</div>
          <h1 className="mt-4 text-display font-bold">Marine cultures, built with process discipline.</h1>
          <p className="mt-6 text-muted max-w-3xl leading-relaxed">
            ReefCultures focuses on repeatability—clean handling, consistent density targets, and packaging designed for cold-chain delivery.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            ["Cultivation", "Controlled growth conditions and handling designed to protect live cultures."],
            ["Density targets", "Consistency-first approach to reduce batch-to-batch surprises."],
            ["Packaging", "Cold-chain oriented packaging to preserve viability through transit."],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={0.06 + i * 0.05}>
              <div className="border border-hair bg-panel/20 p-7">
                <div className="text-[12px] uppercase tracking-[0.18em] text-ink">{t}</div>
                <p className="mt-3 text-sm text-muted leading-relaxed">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </main>
  );
}
