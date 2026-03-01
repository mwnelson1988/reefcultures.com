import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-3 text-sm leading-relaxed text-white/70">{children}</div>
    </div>
  );
}

export default function PoliciesPage() {
  return (
    <main className="pt-20">
      <Section>
        <Reveal>
          <div className="rc-kicker text-muted">Policies</div>
          <h1 className="mt-4 text-display font-bold">Cold-chain shipping & live product handling.</h1>
          <p className="mt-6 max-w-3xl leading-relaxed text-muted">
            ReefCultures ships live phytoplankton. To protect viability, we package with insulation
            and temperature protection as needed. Please read these guidelines before ordering.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Card title="Shipping windows">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                We ship Monday–Wednesday to avoid weekend delays (peak weather may further limit shipments).
              </li>
              <li>
                You’ll see carrier options at checkout (USPS Priority / Express and UPS air services).
              </li>
              <li>
                Tracking is emailed when your label is created. Transit time depends on the service you select.
              </li>
            </ul>
          </Card>

          <Card title="Cold-chain expectations">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Product arrives chilled or cool—this is normal. Temperature packs are included when conditions warrant.
              </li>
              <li>
                Bring the bottle to room temperature before dosing. Refrigerate after opening.
              </li>
              <li>
                Avoid leaving shipments in direct sun or a hot vehicle.
              </li>
            </ul>
          </Card>

          <Card title="DOA / damage">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                If a shipment arrives damaged or non-viable, contact us within <b>3 hours</b> of delivery.
              </li>
              <li>
                Include photos of the bottle(s), packaging, and shipping label.
              </li>
              <li>
                We’ll review and either reship or refund, depending on the situation.
              </li>
            </ul>
          </Card>

          <Card title="Returns & cancellations">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Live products generally cannot be returned.
              </li>
              <li>
                If you need to cancel, do so before your order enters fulfillment.
              </li>
              <li>
                For order issues, reach out any time and we’ll make it right.
              </li>
            </ul>
          </Card>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm font-semibold text-white">Need help?</div>
          <p className="mt-2 text-sm text-white/70">
            Contact support and include your order ID when possible.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-black"
            >
              Contact
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-transparent px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-white/10"
            >
              FAQ
            </Link>
          </div>
        </div>
      </Section>
    </main>
  );
}
