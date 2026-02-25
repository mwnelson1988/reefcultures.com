import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ReefCultures",
  description: "Privacy Policy for ReefCultures.",
};

export default function PrivacyPage() {
  return (
    <main className="pt-24">
      <section className="rc-section">
        <div className="rc-container max-w-3xl">
          <h1 className="text-display font-semibold">Privacy Policy</h1>

          <p className="mt-6 text-muted">
            Effective Date: {new Date().getFullYear()}
          </p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">

            <section>
              <h2 className="text-ink font-semibold text-lg">1. Information We Collect</h2>
              <p className="mt-3">
                We collect information necessary to process orders and operate our website,
                including name, email address, shipping address, and payment details.
              </p>
              <p className="mt-3">
                Payment information is processed securely via Stripe. We do not store
                full credit card details on our servers.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">2. Account Information</h2>
              <p className="mt-3">
                If you create an account, authentication is handled through Supabase.
                We store only the information necessary to maintain your account and order history.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">3. How We Use Information</h2>
              <p className="mt-3">
                We use collected information to:
              </p>
              <ul className="mt-3 list-disc list-inside space-y-2">
                <li>Process and fulfill orders</li>
                <li>Provide customer support</li>
                <li>Improve our website and services</li>
                <li>Send order confirmations and updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">4. Data Sharing</h2>
              <p className="mt-3">
                We share information only with trusted service providers necessary
                to operate our business, including payment processors, shipping providers,
                and email delivery services.
              </p>
              <p className="mt-3">
                We do not sell or rent personal data.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">5. Data Security</h2>
              <p className="mt-3">
                We implement reasonable technical and organizational measures
                to protect your information. However, no system can guarantee
                absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">6. Your Rights</h2>
              <p className="mt-3">
                You may request access to, correction of, or deletion of your
                personal information by contacting us.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">7. Changes to This Policy</h2>
              <p className="mt-3">
                We may update this Privacy Policy from time to time.
                Continued use of the website constitutes acceptance of any revisions.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">8. Contact</h2>
              <p className="mt-3">
                For privacy-related questions:
                <br />
                <strong className="text-ink">support@reefcultures.com</strong>
              </p>
            </section>

          </div>
        </div>
      </section>
    </main>
  );
}