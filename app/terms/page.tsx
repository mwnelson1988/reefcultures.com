import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | ReefCultures",
  description: "Terms and Conditions for ReefCultures.",
};

export default function TermsPage() {
  return (
    <main className="pt-24">
      <section className="rc-section">
        <div className="rc-container max-w-3xl">
          <h1 className="text-display font-semibold">Terms & Conditions</h1>

          <p className="mt-6 text-muted">
            Effective Date: {new Date().getFullYear()}
          </p>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">

            <section>
              <h2 className="text-ink font-semibold text-lg">1. Overview</h2>
              <p className="mt-3">
                These Terms & Conditions govern your use of ReefCultures (“Company,” “we,” “us,” or “our”)
                website and the purchase of products offered through our platform. By accessing
                this website or placing an order, you agree to be bound by these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">2. Products</h2>
              <p className="mt-3">
                ReefCultures provides live phytoplankton and related marine products intended
                for aquarium use only. All products are shipped cold-chain where applicable.
                We do not guarantee performance results in individual reef systems.
              </p>
              <p className="mt-3">
                Products are not intended for human consumption.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">3. Orders & Payment</h2>
              <p className="mt-3">
                Payments are processed securely via Stripe. By submitting payment,
                you represent that you are authorized to use the selected payment method.
              </p>
              <p className="mt-3">
                We reserve the right to refuse or cancel orders at our discretion,
                including in cases of suspected fraud or pricing errors.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">4. Shipping</h2>
              <p className="mt-3">
                Orders are shipped from O’Fallon, Missouri. Live cultures are perishable.
                We are not responsible for delays caused by carriers or weather events.
              </p>
              <p className="mt-3">
                Customers are responsible for providing accurate shipping information.
                ReefCultures is not liable for failed deliveries due to incorrect addresses.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">5. Returns & Refunds</h2>
              <p className="mt-3">
                Due to the perishable nature of live cultures, all sales are final unless
                the product arrives damaged or compromised. Claims must be submitted within
                24 hours of delivery with photographic evidence.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">6. Limitation of Liability</h2>
              <p className="mt-3">
                ReefCultures shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages resulting from the use of our products
                or website.
              </p>
              <p className="mt-3">
                Our maximum liability shall not exceed the purchase price of the product.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">7. Intellectual Property</h2>
              <p className="mt-3">
                All content on this website, including text, graphics, branding,
                and product descriptions, is the property of ReefCultures and may
                not be reproduced without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">8. Changes to Terms</h2>
              <p className="mt-3">
                We reserve the right to update these Terms at any time.
                Continued use of the website constitutes acceptance of any modifications.
              </p>
            </section>

            <section>
              <h2 className="text-ink font-semibold text-lg">9. Contact</h2>
              <p className="mt-3">
                Questions regarding these Terms may be directed to:
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