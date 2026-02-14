import { Container } from "@/components/Container";
import { Card } from "@/components/Card";

export default function TermsPage() {
  return (
    <Container className="py-14">
      <h1 className="text-3xl font-extrabold tracking-tight">Terms & Conditions</h1>
      <p className="mt-3 max-w-3xl opacity-85">
        Starter template only. Replace bracketed items and review with counsel. By using this website, you agree to the
        terms below.
      </p>

      <div className="mt-10 space-y-6">
        <Card>
          <h2 className="text-lg font-semibold">1. Overview</h2>
          <p className="mt-3 text-sm opacity-85">
            Reefcultures (“we”, “us”) provides this site for shopping and account access. We may update these terms from
            time to time.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">2. Purchases & checkout</h2>
          <p className="mt-3 text-sm opacity-85">
            Checkout is processed by Stripe. Prices and availability can change without notice. Taxes and shipping (if
            applicable) are shown during checkout.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">3. Returns & refunds</h2>
          <p className="mt-3 text-sm opacity-85">
            [Insert your return policy here — timeframe, condition requirements, exclusions, and how refunds are issued.]
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">4. Limitation of liability</h2>
          <p className="mt-3 text-sm opacity-85">
            To the fullest extent permitted by law, Reefcultures is not liable for indirect or consequential damages.
            Our total liability is limited to the amount paid for the product(s) in the order giving rise to the claim.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">5. Governing law</h2>
          <p className="mt-3 text-sm opacity-85">These terms are governed by the laws of [Your State], United States.</p>
        </Card>
      </div>
    </Container>
  );
}
