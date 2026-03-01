// components/dashboard/DashboardTopbar.tsx
import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";

export default async function DashboardTopbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-white/10 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-extrabold tracking-tight text-white">
              ReefCultures
            </Link>
            <span className="hidden text-xs font-semibold text-white/60 sm:inline">Dashboard</span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/store"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Store
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Overview
            </Link>

            <div className="ml-2 flex items-center gap-2">
              {user ? (
                <>
                  <div className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80 sm:block">
                    {user.email ?? "Signed In"}
                  </div>

                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/10"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href={`/auth/signin?next=${encodeURIComponent("/dashboard")}`}
                  className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-white/90"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}