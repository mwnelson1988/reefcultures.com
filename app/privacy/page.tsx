import { Container } from "@/components/Container";

export default function PrivacyPolicyPage() {
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
                Privacy Policy
              </h1>
              <p className="mt-2 text-sm text-white/70">
                Effective Date: February 15, 2026
              </p>
            </div>

            <div className="space-y-8 text-sm leading-relaxed text-white/80">
              <p>
                This Privacy Policy governs the collection, use, and disclosure of
                information by Reef Cultures (“Company,” “we,” “us,” or “our”). By
                accessing or using our website or purchasing products, you agree
                to this Policy.
              </p>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  1. Information We Collect
                </h2>
                <p>
                  We may collect personal information including name,
                  billing/shipping address, email, phone number, order history, and
                  payment details (processed through secure third-party providers).
                </p>
                <p className="mt-3">
                  We also automatically collect technical data including IP
                  address, device information, browser type, and usage activity
                  through cookies and similar technologies.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  2. Use of Information
                </h2>
                <p>We use collected information to:</p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Process and fulfill orders</li>
                  <li>Communicate order updates</li>
                  <li>Provide customer support</li>
                  <li>Prevent fraud</li>
                  <li>Improve services</li>
                  <li>Comply with legal obligations</li>
                  <li>Send marketing communications (with opt-out ability)</li>
                </ul>
                <p className="mt-3">
                  We do not sell personal information for monetary compensation.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  3. Third-Party Service Providers
                </h2>
                <p>
                  We may share information with payment processors, shipping
                  carriers, hosting providers, email marketing services, analytics
                  providers, and legal authorities if required by law. We are not
                  responsible for the privacy practices of third parties.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  4. Data Security
                </h2>
                <p>
                  We implement commercially reasonable security measures. However,
                  no system is completely secure. You acknowledge that transmission
                  of data over the internet is at your own risk.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  5. Data Retention
                </h2>
                <p>
                  We retain information as necessary for legal, accounting, tax,
                  dispute resolution, and enforcement purposes.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  6. Your Rights
                </h2>
                <p>
                  Depending on your state of residence, you may request access,
                  correction, or deletion of personal information, subject to
                  verification and legal exceptions.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  7. California Privacy Rights (CCPA/CPRA Style Disclosure)
                </h2>
                <p>
                  California residents may request disclosure of categories of
                  personal data collected and request deletion subject to legal
                  exemptions. We do not discriminate against individuals
                  exercising privacy rights.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  8. Limitation of Liability
                </h2>
                <p>
                  To the fullest extent permitted by law, Reef Cultures shall not
                  be liable for indirect, incidental, consequential, or punitive
                  damages arising from data access, breaches, or misuse beyond our
                  reasonable control.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  9. Arbitration & Class Action Waiver
                </h2>
                <p>
                  Any dispute relating to privacy or data practices shall be
                  resolved through binding arbitration in the state where Reef
                  Cultures operates. Customers waive participation in class
                  actions and jury trials.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  10. Indemnification
                </h2>
                <p>
                  You agree to indemnify and hold harmless Reef Cultures from
                  claims arising from misuse of the website or violation of this
                  Policy.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  11. Children’s Privacy
                </h2>
                <p>
                  Our services are not directed to individuals under 18. We do not
                  knowingly collect personal information from minors.
                </p>
              </div>

              <div>
                <h2 className="font-semibold text-white mb-2">
                  12. Policy Updates
                </h2>
                <p>
                  We reserve the right to modify this Policy at any time.
                  Continued use of the website constitutes acceptance of changes.
                </p>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="font-semibold text-white">Contact Information</p>
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
