// components/dashboard/DashboardTopbar.tsx
import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";

export default async function DashboardTopbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-white/10 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-extrabold tracking-tight">
              ReefCultures
            </Link>
            <span className="hidden text-xs font-semibold text-[rgb(var(--ink-700))] sm:inline">
              Dashboard
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/store"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-[rgb(var(--ink-950))] transition hover:bg-black/[0.04]"
            >
              Store
            </Link>

            <Link
              href="/dashboard"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-[rgb(var(--ink-950))] transition hover:bg-black/[0.04]"
            >
              Overview
            </Link>

            <div className="ml-2 flex items-center gap-2">
              {user ? (
                <>
                  <div className="hidden rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold sm:block">
                    {user.email ?? "Signed In"}
                  </div>

                  <form action="/api/auth/signout" method="post">
                    <button
                      type="submit"
                      className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold shadow-sm transition hover:bg-black/[0.02]"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href={`/auth/signin?next=${encodeURIComponent("/dashboard")}`}
                  className="rounded-xl bg-[rgb(var(--ocean-950))] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
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