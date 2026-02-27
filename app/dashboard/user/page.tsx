// app/dashboard/user/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/signin");

  const admin = await isAdmin();
  if (admin) redirect("/dashboard");

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id) // ✅ your table uses customer_id
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 text-white">
      <h1 className="text-3xl font-bold tracking-tight">Your Dashboard</h1>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-md">
        <p className="text-sm text-white/60">Signed in as</p>
        <p className="mt-1 text-lg font-medium">{user.email}</p>

        <form action="/api/auth/signout" method="post" className="mt-4">
          <button
            type="submit"
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:opacity-90 transition"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold">Your Orders</h2>

        {ordersError ? (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
            <div className="font-semibold">Couldn’t load orders.</div>
            <div className="mt-2 text-xs opacity-90">
              <div>code: {ordersError.code ?? "—"}</div>
              <div>message: {ordersError.message}</div>
              <div>details: {ordersError.details ?? "—"}</div>
              <div>hint: {ordersError.hint ?? "—"}</div>
            </div>
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="mt-6 space-y-4">
            {orders.map((order: any) => (
              <div
                key={order.id}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">
                      Order #{order.order_number || String(order.id).slice(0, 8)}
                    </p>
                    <p className="text-sm text-white/60">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="font-medium">
                      {typeof order.total_amount === "number"
                        ? `$${(order.total_amount / 100).toFixed(2)}`
                        : ""}
                    </p>
                    <p className="text-sm text-white/60 capitalize">{order.status || ""}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-white/60">
            No orders yet. When you purchase, your orders will appear here.
          </p>
        )}
      </div>
    </main>
  );
}