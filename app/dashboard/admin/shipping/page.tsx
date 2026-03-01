import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";
import RateLookupClient from "./rate-lookup-client";

export const dynamic = "force-dynamic";

export default async function AdminShippingRateLookupPage() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/dashboard/admin/shipping");

  const admin = await isAdmin();
  if (!admin) redirect("/dashboard/overview");

  return (
    <div className="paper-shell">
      <Container className="py-14">
        <div className="rounded-3xl border border-white/10 bg-[#0B1220] text-white shadow-[0_30px_120px_-60px_rgba(0,0,0,0.8)]">
          <div className="p-7 sm:p-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="caps text-[11px] text-white/60">Admin · Shipping</div>
                <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white">
                  Rate Lookup
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-white/70">
                  Quote live shipping rates to any destination (store / wholesale / manual shipment)
                  without creating an order.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <RateLookupClient />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}