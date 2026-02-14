import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function SignUpPage() {
  return (
    <Container className="py-14">
      <div className="max-w-md">
        <h1 className="text-3xl font-extrabold tracking-tight">Create account</h1>
        <p className="mt-3 opacity-85">Sign up to access your dashboard.</p>

        <Card className="mt-8">
          <form action="/auth/signup" method="post" className="space-y-4">
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
                minLength={8}
                className="mt-1 w-full rounded-xl border border-brand-border bg-brand-muted/30 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-accent"
              />
              <div className="mt-1 text-xs opacity-70">Minimum 8 characters.</div>
            </div>

            <Button type="submit" className="w-full">Create account</Button>
          </form>

          <div className="mt-4 text-sm opacity-80">
            Already have an account? <a className="underline" href="/auth/signin">Sign in</a>
          </div>
        </Card>
      </div>
    </Container>
  );
}
