import { Suspense } from "react";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import SignUpClient from "./SignUpClient";

export default function SignUpPage() {
  return (
    <div>
      <section className="ocean-shell">
        <Container className="py-14">
          <div className="mx-auto max-w-md text-center">
            <div className="caps text-[11px] text-white/65">Account</div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
              Create account
            </h1>
            <p className="mt-4 text-sm text-white/75">
              Create an account to access your dashboard and order history.
            </p>
          </div>
        </Container>
      </section>

      <section className="paper-shell">
        <Container className="py-14">
          <div className="mx-auto w-full max-w-md">
            <Card>
              <Suspense fallback={<div className="text-ink/60 text-sm">Loading…</div>}>
                <SignUpClient />
              </Suspense>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}
