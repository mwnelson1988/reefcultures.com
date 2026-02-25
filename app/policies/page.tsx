import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

export default function PoliciesPage() {
  return (
    <main className="pt-20">
      <Section>
        <Reveal>
          <div className="rc-kicker text-muted">Policies</div>
          <h1 className="mt-4 text-display font-bold">Shipping, returns, and product handling.</h1>
          <p className="mt-6 text-muted max-w-3xl leading-relaxed">
            Add your official policy language here (shipping timelines, cold-chain expectations, returns, and handling).
          </p>
        </Reveal>
      </Section>
    </main>
  );
}
