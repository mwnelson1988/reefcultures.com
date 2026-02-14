import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { getSessionUser } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const user = await getSessionUser();

  return (
    <Container className="py-14">
      <h1 className="text-3xl font-extrabold tracking-tight">Customer Dashboard</h1>
      <p className="mt-3 max-w-2xl opacity-85">
        This page is protected. If you’re not signed in, you’ll be redirected to Sign In.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Card>
          <div className="font-semibold">Account</div>
          <div className="mt-2 text-sm opacity-85">
            Signed in as <span className="font-semibold">{user?.email}</span>
          </div>
          <div className="mt-2 text-sm opacity-70">Add order history and profile info next.</div>
        </Card>

        <Card>
          <div className="font-semibold">Next steps</div>
          <ul className="mt-3 list-disc pl-5 text-sm opacity-85 space-y-2">
            <li>Add an “Orders” table in Supabase.</li>
            <li>On Stripe webhook success, save orders to Supabase.</li>
            <li>Show recent orders here.</li>
          </ul>
        </Card>
      </div>
    </Container>
  );
}
