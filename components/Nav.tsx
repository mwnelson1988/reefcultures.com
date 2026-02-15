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
  const isAdminBypass =
    cookieStore.get("rc_admin_bypass")?.value === "1";

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/70 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Reefcultures Logo"
            width={200}
            height={80}
            priority
            className="h-16 w-auto"
          />
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/store" className="opacity-90 hover:opacity-100">
            Store
          </Link>
          <Link href="/about" className="opacity-90 hover:opacity-100">
            About
          </Link>
          <Link href="/contact" className="opacity-90 hover:opacity-100">
            Contact
          </Link>
          {user && (
            <Link href="/dashboard" className="opacity-90 hover:opacity-100">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* 🟢 Admin Mode Badge */}
          {isAdminBypass && (
            <span className="hidden sm:inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              Admin Mode
            </span>
          )}

          {user ? (
            <>
              <Button href="/dashboard" className="bg-brand-accent text-black">
                Dashboard
              </Button>
              <form action="/auth/signout" method="post">
                <button className="rounded-full border border-brand-border px-4 py-2 text-sm hover:bg-brand-muted/60 transition">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Button
              href="/auth/signin"
              className="rounded-full bg-brand-accent text-black px-5 py-2 hover:opacity-90 transition"
            >
              Account
            </Button>
          )}
        </div>
      </Container>
    </header>
  );
}
