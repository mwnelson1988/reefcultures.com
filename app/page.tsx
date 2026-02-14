import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function HomePage() {
  return (
    <Container className="py-14">
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-border bg-brand-muted/40 px-3 py-1 text-xs opacity-90">
            Early Access • Launch-ready foundation
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight">
            Reefcultures — clean reef essentials, built to scale.
          </h1>
          <p className="mt-4 text-base sm:text-lg opacity-85">
            A fast, modern site with a working customer dashboard (sign in / sign up) and a clean Store flow that can
            hand off to Stripe Checkout.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/store">Shop the Store</Button>
            <Button href="/dashboard" className="bg-transparent text-brand-fg border border-brand-border hover:bg-brand-muted/60">
              Go to Dashboard
            </Button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Card>
              <div className="font-semibold">Customer accounts</div>
              <div className="mt-1 text-sm opacity-80">
                Supabase Auth (email/password) with protected dashboard routes.
              </div>
            </Card>
            <Card>
              <div className="font-semibold">Easy checkout</div>
              <div className="mt-1 text-sm opacity-80">
                Stripe Checkout Session via a Next.js API route (server-side).
              </div>
            </Card>
          </div>
        </div>

        <Card className="p-8">
          <div className="h-44 rounded-2xl border border-brand-border bg-gradient-to-br from-brand-primary/25 via-brand-secondary/20 to-brand-accent/25" />
          <div className="mt-6">
            <div className="text-sm opacity-80">Design note</div>
            <div className="mt-1 text-lg font-semibold">Colors match your logo</div>
            <p className="mt-2 text-sm opacity-80">
              Edit the palette once in <code className="rounded bg-black/30 px-1">app/globals.css</code> and it updates
              the whole site.
            </p>
          </div>
        </Card>
      </div>
    </Container>
  );
}
