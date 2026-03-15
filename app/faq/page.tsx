import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

const faqs = [
  [
    "How should I store it?",
    "Refrigerate immediately on arrival. Shake gently before use. Do not freeze.",
  ],
  [
    "How do I choose the right size?",
    "Base it on tank volume, how often you dose, and how often you want to reorder. The 32oz bottle is the most versatile fit for many mixed reefs.",
  ],
  [
    "How should I start dosing?",
    "Start modestly, build consistency, and increase only after watching tank response, nutrient behavior, and livestock demand.",
  ],
  [
    "How is it shipped?",
    "Orders ship cold-chain with shipped pricing built into each bottle, so there is no extra shipping fee added at checkout.",
  ],
  [
    "Is it safe for reef systems?",
    "It is positioned for reef, pod, and filter-feeding routines. Introduce gradually and let your system guide the pace.",
  ],
  [
    "Why does ReefCultures feel more premium now?",
    "Because the store, product pages, process page, and quality page now explain fit, handling, and routine more clearly instead of leaving the customer to guess.",
  ],
];

export default function FAQPage() {
  return (
    <main className="pt-20">
      <Section>
        <Reveal>
          <div className="rc-kicker text-muted">FAQ</div>
          <h1 className="mt-4 text-display font-bold">Answers that feel polished and complete.</h1>
          <p className="mt-5 max-w-3xl text-muted leading-relaxed">
            This page now covers the most important pre-purchase questions so the site feels more finished, more trustworthy, and easier to buy from.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-4">
          {faqs.map(([q, a], i) => (
            <Reveal key={q} delay={0.05 + i * 0.04}>
              <div className="rounded-3xl border border-hair bg-panel/10 p-7 ring-1 ring-white/[0.05]">
                <div className="text-[12px] uppercase tracking-[0.18em] text-ink">{q}</div>
                <p className="mt-3 text-sm leading-relaxed text-muted">{a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </main>
  );
}
