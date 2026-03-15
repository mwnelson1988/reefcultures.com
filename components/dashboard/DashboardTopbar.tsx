// components/dashboard/DashboardTopbar.tsx
import Link from "next/link";
import { getSessionUser } from "@/lib/supabase/server";

export default async function DashboardTopbar() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40">
      <div className="border-b border-white/8 bg-[rgba(4,10,24,0.78)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="shrink-0 text-base font-semibold tracking-tight text-white transition hover:text-white/90"
            >
              ReefCultures
            </Link>

            <div className="hidden h-4 w-px bg-white/10 sm:block" />

            <span className="hidden text-xs font-medium uppercase tracking-[0.18em] text-white/45 sm:inline">
              Dashboard
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/store"
              className="inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-medium text-white/68 transition hover:bg-white/[0.06] hover:text-white"
            >
              Store
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center rounded-xl px-3.5 text-sm font-medium text-white/68 transition hover:bg-white/[0.06] hover:text-white"
            >
              Overview
            </Link>

            {user ? (
              <div className="ml-1 flex items-center gap-2">
                <div className="hidden max-w-[240px] truncate rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/65 lg:block">
                  {user.email ?? "Signed In"}
                </div>

                <form action="/api/auth/signout" method="post">
                  <button
                    type="submit"
                    className="inline-flex h-10 items-center rounded-xl border border-white/10 bg-white/[0.05] px-3.5 text-sm font-medium text-white/82 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href={`/auth/signin?next=${encodeURIComponent("/dashboard")}`}
                className="inline-flex h-10 items-center rounded-xl bg-white px-3.5 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}