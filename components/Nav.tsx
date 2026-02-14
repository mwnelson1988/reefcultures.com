import Link from "next/link";
import Image from "next/image";
import { Container } from "./Container";
import { getSessionUser } from "@/lib/supabase/server";
import { Button } from "./Button";

export async function Nav() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-50 border-b border-brand-border bg-brand-bg/70 backdrop-blur">
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Reefcultures Logo"
            width={180}
            height={70}
            priority
            className="h-14 w-auto"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/store" className="opacity-90 hover:opacity-100">Store</Link>
          <Link href="/about" className="opacity-90 hover:opacity-100">About</Link>
          <Link href="/contact" className="opacity-90 hover:opacity-100">Contact</Link>
          <Link href="/dashboard" className="opacity-90 hover:opacity-100">Dashboard</Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <form action="/auth/signout" method="post">
              <button className="rounded-xl border border-brand-border px-3 py-2 text-sm hover:bg-brand-muted/60 transition">
                Sign out
              </button>
            </form>
          ) : (
            <>
              <Button href="/auth/signin" className="bg-transparent text-brand-fg border border-brand-border hover:bg-brand-muted/60">
                Sign in
              </Button>
              <Button href="/auth/signup">Sign up</Button>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
