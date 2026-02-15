import { Container } from "@/components/Container";

export default function TermsPage() {
  return (
    <Container className="relative overflow-hidden">

      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[rgb(var(--brand-primary))]/15 blur-[180px]" />

      <section className="relative mx-auto max-w-4xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-xl">

          {/* Top subtle gradient line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative px-6 py-10 md:px-10">

            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">
                Terms & Conditions
              </h1>
              <p className="mt-2 text-sm text-white/70">
                Effective Date: February 15, 2026
              </p>
            </div>

            <div className="space-y-8 text-sm leading-relaxed text-white/80">

              <p>
                These Terms & Conditions (“Terms”) govern all use of the website,
                products, services, and transactions with Reef Cultures (“Company,”
                “we,” “us,” or “our”). By accessing this website or placing an order,
                you agree to be legally bound by these Terms.
              </p>

              <div>
                <h2 className="font-semibold text-white mb-2">1. Legal Agreement</h2>
                <p>
                  These Terms constitute a binding legal agreement. Electronic
                  acceptance constitutes agreement under applicable electronic
                  signature laws.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  2. Assumption of Risk – Live Aquatic Livestock
                </h2>
                <p>
                  Marine livestock are delicate living organisms. By purchasing live
                  goods, you expressly assume all risks associated with aquarium
                  livestock ownership, acclimation, and care.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  3. Shipping & Transfer of Risk
                </h2>
                <p>
                  Title and risk of loss transfer to the customer once the shipment
                  is delivered to the carrier. Reef Cultures is not responsible for
                  shipping delays, weather events, or carrier mishandling.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  4. Dead on Arrival (DOA) Policy
                </h2>
                <p>
                  All DOA claims must be reported within <span className="font-semibold text-white">3 HOURS</span> of the carrier’s confirmed delivery time. No exceptions.
                </p>

                <p className="mt-3 font-medium text-white">
                  Required documentation:
                </p>

                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Clear time-stamped photos of livestock in unopened bag</li>
                  <li>Photo after removal from bag</li>
                  <li>Photo of shipping label</li>
                </ul>

                <p className="mt-3">
                  Failure to comply voids the guarantee. If approved, Reef Cultures
                  may issue store credit, replacement (customer pays shipping), or
                  partial refund of livestock value at our sole discretion. Shipping
                  costs are non-refundable.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  5. No Guarantee Beyond Arrival
                </h2>
                <p>
                  We do not guarantee livestock survival beyond confirmed live
                  delivery.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  6. Water Parameter Disclaimer
                </h2>
                <p>
                  Reef Cultures is not responsible for losses due to improper
                  acclimation, unstable parameters, equipment failure, power
                  outages, aggressive tank mates, or customer negligence.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  7. Returns – Dry Goods Only
                </h2>
                <p>
                  Returns accepted within 30 days if unused and in original
                  packaging. A minimum 20% restocking fee applies. Live goods and
                  opened consumables are non-returnable.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  8. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by law, Reef Cultures shall not
                  be liable for indirect, incidental, or consequential damages.
                  Total liability shall not exceed the amount paid for the specific
                  product purchased.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  9. Force Majeure
                </h2>
                <p>
                  We are not liable for failure to perform due to events beyond our
                  reasonable control including weather, natural disasters, or supply
                  disruptions.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  10. Chargeback Policy
                </h2>
                <p>
                  Customers agree to contact Reef Cultures before initiating a
                  chargeback. Fraudulent chargebacks may result in legal action and
                  recovery of associated costs.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  11. Dispute Resolution
                </h2>
                <p>
                  All disputes shall be resolved through binding arbitration in the
                  state where Reef Cultures operates. Customers waive class action
                  participation and jury trials.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  12. Governing Law
                </h2>
                <p>
                  These Terms are governed by the laws of the state in which Reef
                  Cultures operates.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="font-semibold text-white">Contact</p>
                <p className="mt-2">
                  Reef Cultures<br />
                  support@reefcultures.com<br />
                  www.reefcultures.com
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
