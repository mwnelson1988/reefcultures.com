import { Container } from "@/components/Container";
import { Card } from "@/components/Card";

export default function PrivacyPage() {
  return (
    <Container className="py-14">
      <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
      <p className="mt-3 max-w-3xl opacity-85">
        This is a starter template. Replace bracketed items and review with counsel for your business.
      </p>

      <div className="mt-10 space-y-6">
        <Card>
          <h2 className="text-lg font-semibold">1. Information we collect</h2>
          <ul className="mt-3 list-disc pl-5 text-sm opacity-85 space-y-2">
            <li>Account info (email, password) via Supabase Auth.</li>
            <li>Checkout info handled by Stripe (we don’t store full card details).</li>
            <li>Basic analytics (optional) if you add them later.</li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">2. How we use information</h2>
          <p className="mt-3 text-sm opacity-85">
            To provide the site, manage accounts, process orders, send transactional messages, and prevent fraud.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">3. Data retention</h2>
          <p className="mt-3 text-sm opacity-85">
            We keep account and order-related records as needed for operations, taxes, and support, then delete or
            anonymize when no longer required.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">4. Contact</h2>
          <p className="mt-3 text-sm opacity-85">
            Questions? Email <span className="underline">support@reefcultures.com</span>.
          </p>
        </Card>
      </div>
    </Container>
  );
}
