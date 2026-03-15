import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import Link from "next/link";
import DoseEstimator from "@/components/DoseEstimator";

const pillars = [
  {
    title: "Process discipline",
    desc: "The site now emphasizes repeatability, handling quality, and professional presentation instead of vague hype.",
  },
  {
    title: "Routine-first dosing",
    desc: "The messaging encourages customers to build a modest, consistent routine and adjust to actual tank response.",
  },
  {
    title: "Cold-chain positioning",
    desc: "Refrigerated live culture is framed as part of the premium value proposition from product page through checkout.",
  },
];

const workflow = [
  ["Select the right bottle", "Start with the size that matches system volume and reorder preference."],
  ["Store correctly", "Refrigerate on arrival and keep the handling instructions simple and obvious."],
  ["Dose consistently", "Introduce a routine before chasing large numbers or overly aggressive feeding."],
  ["Watch the system", "Adjust based on nutrient load, livestock response, and overall tank behavior."],
];

const faqs = [
  {
    q: "Why does this page matter?",
    a: "Because a premium reef customer wants to understand the logic behind the routine, not just see a bottle and a price.",
  },
  {
    q: "Do I need a huge dose on day one?",
    a: "No. The stronger positioning is to start modestly, build consistency, and then scale only as the system shows demand.",
  },
  {
    q: "How is this different from a generic product page?",
    a: "The site now frames ReefCultures around process, trust, storage, shipping clarity, and more intentional size selection.",
  },
  {
    q: "Who is this best for?",
    a: "Mixed reefs, pod feeders, filter-feeding routines, and hobbyists who prefer a more premium, disciplined brand presentation.",
  },
];

export default function SciencePage() {
  return (
    <main className="pt-20">
      <Section>
        <Reveal>
          <div className="text-center">
            <div className="rc-kicker text-muted">Process</div>
            <h1 className="mt-4 text-display font-bold text-ink">
              The professional logic behind the routine.
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-muted leading-relaxed">
              This page now helps the brand feel more serious by translating product
              language into a cleaner operating story: pick the right bottle, store it correctly,
              start modestly, and build consistency.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {pillars.map((p, i) => (
            <Reveal key={p.title} delay={0.06 + i * 0.05}>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 ring-1 ring-white/[0.06]">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">{p.title}</div>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{p.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12">
          <Reveal>
            <DoseEstimator />
          </Reveal>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {workflow.map(([title, desc], i) => (
            <Reveal key={title} delay={0.06 + i * 0.04}>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-white/[0.06] h-full">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">Step {i + 1}</div>
                <div className="mt-3 text-base font-semibold text-white">{title}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/72">{desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={0.06 + i * 0.04}>
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
                <div className="text-sm font-semibold text-white">{f.q}</div>
                <p className="mt-2 text-sm leading-relaxed text-white/75">{f.a}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10 ring-1 ring-white/[0.06]">
          <Reveal>
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-7">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/60">Next step</div>
                <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                  Choose a bottle and build the routine.
                </h2>
                <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-white/75">
                  The revised product pages and store layout now make it easier to move from interest to purchase.
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
          </Reveal>
        </div>
      </Section>
    </main>
  );
}
