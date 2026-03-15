import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import Link from "next/link";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = (await searchParams) ?? {};

  // ✅ Do not default to /account anymore.
  // Leave blank unless a next param is explicitly provided; API will choose.
  const next = sp.next ?? "";

  return (
    <div>
      <section className="ocean-shell">
        <Container className="py-14">
          <div className="mx-auto max-w-md text-center">
            <div className="caps text-[11px] text-white/65">Account</div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
              Sign in
            </h1>
            <p className="mt-4 text-sm text-white/75">
              Access your dashboard and order history.
            </p>
          </div>
        </Container>
      </section>

      <section className="paper-shell">
        <Container className="py-14">
          <div className="mx-auto w-full max-w-md">
            <Card>
              <form action="/api/auth/signin" method="post" className="space-y-5">
                <input type="hidden" name="next" value={next} />

                <div>
                  <label className="text-xs font-semibold text-ink/70">Email</label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="field mt-2"
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink/70">Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="field mt-2"
                    autoComplete="current-password"
                  />
                </div>

                <Button type="submit" className="w-full py-3">
                  Sign in
                </Button>

                <p className="text-sm text-ink/70 text-center">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/signup" className="font-semibold hover:opacity-80">
                    Create one
                  </Link>
                </p>
              </form>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
}
