"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // ✅ Dashboards have their own chrome; hide the marketing footer.
  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <footer className="border-t border-hair bg-bg">
      <div className="rc-container py-14 flex flex-col gap-10 md:flex-row md:items-center md:justify-between">

        {/* Left */}
        <div className="flex flex-col gap-3">
          <div className="text-[12px] uppercase tracking-[0.22em] text-muted">
            ReefCultures
          </div>

          <div className="text-xs text-muted leading-relaxed max-w-xs">
            Premium live marine phytoplankton engineered for reef performance.
            Cold-chain shipped from Missouri.
          </div>

          {/* ✅ Trust Signal for Stripe + Customers */}
          <div className="text-xs text-muted">
            <a
              href="mailto:support@reefcultures.com"
              className="hover:text-ink transition"
            >
              support@reefcultures.com
            </a>
          </div>

          <div className="text-xs text-muted">
            © {new Date().getFullYear()} ReefCultures. All rights reserved.
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-wrap gap-x-8 gap-y-4 text-[12px] uppercase tracking-[0.20em] text-muted">
          <Link href="/store" className="hover:text-ink transition">Store</Link>
          <Link href="/science" className="hover:text-ink transition">Science</Link>
          <Link href="/quality" className="hover:text-ink transition">Quality</Link>
          <Link href="/faq" className="hover:text-ink transition">FAQ</Link>
          <Link href="/contact" className="hover:text-ink transition">Contact</Link>
          <Link href="/terms" className="hover:text-ink transition">Terms</Link>
          <Link href="/privacy" className="hover:text-ink transition">Privacy</Link>
        </div>

      </div>
    </footer>
  );
}