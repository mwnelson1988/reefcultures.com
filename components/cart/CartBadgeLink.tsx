"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cartCount, readCart } from "@/lib/cart";

export default function CartBadgeLink({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const refresh = () => setCount(cartCount(readCart()));
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("reefcart:updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("reefcart:updated", refresh);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className={`inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.20em] text-white/85 transition hover:border-white/30 hover:bg-white/[0.07] ${className}`}
    >
      <span>Cart</span>
      <span className="inline-flex min-w-[24px] items-center justify-center rounded-full bg-white px-2 py-1 text-[10px] font-bold text-black">
        {count}
      </span>
    </Link>
  );
}
