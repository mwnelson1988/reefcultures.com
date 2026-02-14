import { Container } from "@/components/Container";
import { Card } from "@/components/Card";

export default function AboutPage() {
  return (
    <Container className="py-14">
      <h1 className="text-3xl font-extrabold tracking-tight">About Reefcultures</h1>
      <p className="mt-3 max-w-2xl opacity-85">
        Replace this copy with your story — your mission, your reef experience, and what makes Reefcultures different.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <Card>
          <div className="font-semibold">Quality</div>
          <div className="mt-2 text-sm opacity-80">Curated products with reef-safe standards.</div>
        </Card>
        <Card>
          <div className="font-semibold">Simplicity</div>
          <div className="mt-2 text-sm opacity-80">A clean store and a checkout that doesn’t fight customers.</div>
        </Card>
        <Card>
          <div className="font-semibold">Support</div>
          <div className="mt-2 text-sm opacity-80">Built for scale: accounts, dashboard, and future order history.</div>
        </Card>
      </div>
    </Container>
  );
}
