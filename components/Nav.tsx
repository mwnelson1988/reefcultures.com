import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { Container } from "./Container";
import { getSessionUser } from "@/lib/supabase/server";
import { Button } from "./Button";

export async function Nav() {
  const user = await getSessionUser();

  // 🔐 Admin bypass detection (server-side)
  const cookieStore = await cookies();
  const isAdminBypass = cookieStore.get("rc_admin_bypass")?.value === "1";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 glass shadow-hairline">
      <Container className="flex items-center justify-between py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Reefcultures Logo"
            width={200}
            height={80}
            priority
            unoptimized
            className="h-14 w-auto"
          />
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
          <Link href="/store" className="hover:text-white transition relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-px after:bg-white/0 hover:after:bg-white/30">
            Store
          </Link>
          <Link href="/about" className="hover:text-white transition relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-px after:bg-white/0 hover:after:bg-white/30">
            About
          </Link>
          <Link href="/contact" className="hover:text-white transition relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-px after:bg-white/0 hover:after:bg-white/30">
            Contact
          </Link>
          {user && (
            <Link href="/dashboard" className="hover:text-white transition relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-px after:bg-white/0 hover:after:bg-white/30">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Mobile menu (server-safe) */}
          <details className="md:hidden relative">
            <summary className="list-none rounded-full border border-white/15 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition cursor-pointer select-none">
              Menu
            </summary>
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 glass-card p-2">
              <Link href="/store" className="block rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition">
                Store
              </Link>
              <Link href="/about" className="block rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition">
                About
              </Link>
              <Link href="/contact" className="block rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition">
                Contact
              </Link>
              {user ? (
                <Link href="/dashboard" className="block rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition">
                  Dashboard
                </Link>
              ) : null}
              <div className="my-2 h-px bg-white/10" />
              {user ? (
                <form action="/auth/signout" method="post">
                  <button className="w-full text-left rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition">
                    Sign out
                  </button>
                </form>
              ) : (
                <Link href="/auth/signin" className="block rounded-xl px-3 py-2 text-sm text-white/85 hover:bg-white/10 transition">
                  Account
                </Link>
              )}
            </div>
          </details>

          {/* 🟢 Admin Mode Badge */}
          {isAdminBypass && (
            <span className="hidden sm:inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
              Admin Mode
            </span>
          )}

          {user ? (
            <>
              <Button href="/dashboard" variant="primary">
                Dashboard
              </Button>
              <form action="/auth/signout" method="post">
                <button className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Button href="/auth/signin" variant="primary">
              Account
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
}
