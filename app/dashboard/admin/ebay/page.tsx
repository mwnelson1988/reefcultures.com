import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import EbayClient from "./sync-client";

export const dynamic = "force-dynamic";

export default async function AdminEbayOrdersPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/dashboard/admin/ebay");

  const admin = await isAdmin();
  if (!admin) redirect("/dashboard/overview");

  return (
    <div className="paper-shell">
      <Container className="py-14">
        <Card>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="caps text-[11px] text-ink/60">Admin · Channel</div>
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight">eBay Orders</h1>
              <p className="mt-2 max-w-2xl text-sm text-ink/70">
                Import orders from eBay (Fulfillment API). Orders appear here only and can be
                fulfilled with ShipEngine labels.
              </p>
            </div>
          </div>

          <div className="mt-8">
            <EbayClient />
          </div>
        </Card>
      </Container>
    </div>
  );
}
