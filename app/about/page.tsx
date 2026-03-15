import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { SectionHeading } from "@/components/SectionHeading";
import { FeatureGrid } from "@/components/FeatureGrid";
import { MetricGrid } from "@/components/MetricGrid";
import { FlaskConical, ShieldCheck, Snowflake } from "lucide-react";

export default function AboutPage() {
  return (
    <div>
      <section className="ocean-shell hero-bg angle-divider noise">
        <Container className="py-16">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7">
              <SectionHeading
                invert
                eyebrow="About"
                title="Institutional aquaculture for home reefs"
                subtitle="Reefcultures is built around repeatable culture standards, clean handling, and a premium customer experience."
              />
              <div className="mt-10">
                <MetricGrid
                  invert
                  metrics={[
                    { value: "Clean", label: "Handling discipline" },
                    { value: "Cold", label: "Transit protection" },
                    { value: "Clear", label: "Dosing guidance" },
                    { value: "Secure", label: "Checkout & webhooks" },
                  ]}
                />
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="glass-card rounded-3xl border border-white/10 p-7">
                <div className="caps text-[11px] text-white/60">Mission</div>
                <p className="mt-3 text-sm text-white/75 leading-relaxed">
                  Deliver dense live cultures with the consistency you&apos;d expect
                  from a lab — packaged like a premium brand and supported like a
                  serious business.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="paper-shell">
        <Container className="py-14">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="What we optimize"
                title="Consistency over hype"
                subtitle="Reef keepers don’t need marketing — they need repeatable results."
              />
            </div>
            <div className="lg:col-span-7">
              <FeatureGrid
                features={[
                  {
                    title: "Repeatable culture practices",
                    description:
                      "Clean vessels, stable conditions, and disciplined handling from harvest to packing.",
                    icon: FlaskConical,
                  },
                  {
                    title: "Cold-chain mindset",
                    description:
                      "Packed with transit in mind to protect viability and reduce variability.",
                    icon: Snowflake,
                  },
                  {
                    title: "Trust-first checkout",
                    description:
                      "Live shipping rates, secure payment, and webhook-verified order completion.",
                    icon: ShieldCheck,
                  },
                ]}
              />
            </div>
          </div>

          <div className="mt-12 mx-auto max-w-3xl">
            <Card>
              <div className="space-y-6 text-sm sm:text-base text-ink/80 leading-relaxed">
                <p>
                  Reefcultures was founded with a clear mission: deliver premium
                  live cultures and reef essentials with the reliability of a
                  controlled process — not a one-off batch.
                </p>
                <p>
                  We keep the experience professional end-to-end: transparent
                  shipping, secure checkout, and a customer dashboard for managing
                  your account.
                </p>
                <div className="pt-4 border-t border-border/10">
                  <div className="text-sm font-semibold">What you can expect</div>
                  <ul className="mt-3 space-y-2 text-sm text-ink/75">
                    <li>• Dense live phytoplankton cultures shipped cold</li>
                    <li>• Clear dosing guidance designed for reef keepers</li>
                    <li>• Live shipping rates calculated at checkout</li>
                    <li>• Secure Stripe checkout and webhook-verified completion</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}
