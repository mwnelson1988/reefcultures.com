// app/account/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/signin"); // change to your actual sign-in route if different
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold">Account</h1>

      <div className="mt-6 rounded-xl border p-5">
        <p className="text-sm text-gray-500">Signed in as</p>
        <p className="mt-1 font-medium">{user.email}</p>

        <form action="/api/auth/signout" method="post" className="mt-4">
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:opacity-90"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}