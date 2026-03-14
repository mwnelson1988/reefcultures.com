import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const faqs = [
  ["How do I store it?", "Refrigerate immediately on arrival. Do not freeze. Shake gently before use."],
  ["How do I dose?", "Start at 5–10 mL per gallon and adjust based on nutrient demand and livestock."],
  ["How is it shipped?", "Cold-chain packaging is used to protect live culture viability during transit."],
  ["Is it safe for my reef?", "For aquarium use only. Follow label guidance and introduce gradually."],
];

export default function FAQPage() {
  return (
    <main className="pt-20">
      <Section>
        <Reveal>
          <div className="rc-kicker text-muted">FAQ</div>
          <h1 className="mt-4 text-display font-bold">Answers, without the fluff.</h1>
        </Reveal>

        <div className="mt-12 grid gap-4">
          {faqs.map(([q, a], i) => (
            <Reveal key={q} delay={0.05 + i * 0.04}>
              <div className="border border-hair p-7">
                <div className="text-[12px] uppercase tracking-[0.18em] text-ink">{q}</div>
                <p className="mt-3 text-sm text-muted leading-relaxed">{a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </main>
  );
}
