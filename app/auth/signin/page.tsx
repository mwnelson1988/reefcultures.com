import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { next?: string };
}) {
  const next = searchParams?.next ?? "/dashboard";

  return (
    <Container className="py-14">
      <div className="max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
        <p className="mt-3 opacity-85">Access your dashboard and future order history.</p>

        <Card className="mt-8">
          <form action="/api/auth/signin" method="post" className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <div>
              <label className="text-sm opacity-85">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-brand-border bg-brand-muted/30 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="text-sm opacity-85">Password</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 w-full rounded-xl border border-brand-border bg-brand-muted/30 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <div className="mt-4 text-sm opacity-80">
            No account?{" "}
            <a className="underline" href="/auth/signup">
              Create one
            </a>
          </div>
        </Card>
      </div>
    </Container>
  );
}