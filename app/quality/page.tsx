import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export default function QualityPage() {
  return (
    <main className="pt-20">
      <Section>
        <Reveal>
          <div className="rc-kicker text-muted">Quality Standards</div>
          <h1 className="mt-4 text-display font-bold">Premium handling. Clear guidance. Batch accountability.</h1>
          <p className="mt-6 text-muted max-w-3xl leading-relaxed">
            We treat ReefCultures like a lab process and ship it like a premium product—because viability matters.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {[
            ["Batch tracking", "Maintain batch identification so you can track performance and repeat what works."],
            ["Cold-chain shipping", "Packaging designed to arrive cold and protect live culture integrity."],
            ["Storage guidance", "Refrigerate. Shake gently. Do not freeze. Follow label instructions for best results."],
            ["Use guidance", "Start with 5–10 mL per gallon and adjust based on system demand and livestock."],
          ].map(([t, d], i) => (
            <Reveal key={t} delay={0.06 + i * 0.05}>
              <div className="border border-hair p-7">
                <div className="text-[12px] uppercase tracking-[0.18em] text-ink">{t}</div>
                <p className="mt-3 text-sm text-muted leading-relaxed">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 border border-hair bg-panel/20 p-8">
          <Reveal>
            <div className="text-[12px] uppercase tracking-[0.18em] text-muted">Compliance</div>
            <p className="mt-3 text-sm text-muted leading-relaxed">
              For aquarium use only. Keep refrigerated. Follow storage and handling directions on the label.
            </p>
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
