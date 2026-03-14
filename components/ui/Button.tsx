import Link from "next/link";
import * as React from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-none px-6 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] transition focus:outline-none focus:ring-2 focus:ring-[rgba(29,211,197,0.45)] disabled:opacity-50 disabled:cursor-not-allowed";

function cls(variant: Variant) {
  switch (variant) {
    case "primary":
      return `${base} bg-ink text-bg hover:bg-accent hover:text-bg`;
    case "secondary":
      return `${base} border border-hair text-ink hover:border-accent hover:text-accent`;
    default:
      return `${base} text-ink hover:text-accent`;
  }
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const { variant = "primary", className = "", ...rest } = props;
  return <button className={`${cls(variant)} ${className}`} {...rest} />;
}

export function ButtonLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; variant?: Variant }) {
  const { href, variant = "primary", className = "", ...rest } = props;
  return <Link href={href} className={`${cls(variant)} ${className}`} {...rest} />;
}
