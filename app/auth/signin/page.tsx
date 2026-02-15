import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const next = sp.next ?? "/dashboard";

  return (
    <Container className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Sign in
        </h1>
        <p className="mt-3 opacity-80">
          Access your dashboard and order history.
        </p>

        <Card className="mt-8 text-left">
          <form action="/api/auth/signin" method="post" className="space-y-4">
            <input type="hidden" name="next" value={next} />

            <div>
              <label className="text-sm opacity-80">Email</label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-brand-border bg-brand-muted/30 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>

            <div>
              <label className="text-sm opacity-80">Password</label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-brand-border bg-brand-muted/30 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <div className="mt-6 text-sm opacity-75 text-center">
            No account?{" "}
            <a className="underline hover:opacity-100" href="/auth/signup">
              Create one
            </a>
          </div>
        </Card>
      </div>
    </Container>
  );
}
