"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AuthNav from "@/components/AuthNav";

const navLinks = [
  { href: "/store", label: "Store" },
  { href: "/science", label: "Process" }, // keep route, rename label
  { href: "/quality", label: "Quality" },
  { href: "/faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // ✅ Dashboards have their own chrome; hide the marketing navbar.
  if (pathname?.startsWith("/dashboard")) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition ${
        scrolled ? "bg-bg/95 backdrop-blur border-b border-hair" : "bg-transparent"
      }`}
    >
      <div className="rc-container h-20 flex items-center gap-8">
        {/* Left: Brand (never collapses) */}
        <Link href="/" className="flex items-center gap-4 shrink-0">
          <div className="h-10 w-10 rounded-full overflow-hidden border border-hair bg-panel/20 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="ReefCultures"
              width={120}
              height={120}
              priority
              className="h-full w-full object-cover"
            />
          </div>

          <span className="text-[13px] font-semibold uppercase tracking-[0.28em] text-ink whitespace-nowrap">
            ReefCultures
          </span>
        </Link>

        {/* Center: Nav (flexes and centers) */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-10 text-[12px] uppercase tracking-[0.20em] text-muted">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink transition">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: Auth + Buy (never collapses) */}
        <div className="flex items-center gap-6 shrink-0 ml-auto">
          <AuthNav />
          <Link
            href="/store"
            className="hidden sm:inline-flex items-center justify-center px-6 py-2 border border-hair text-[12px] uppercase tracking-[0.20em] hover:border-accent hover:text-accent transition"
          >
            Buy
          </Link>
        </div>
      </div>
    </header>
  );
}