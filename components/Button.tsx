import * as React from "react";
import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost";

export type ButtonProps =
  | (React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: Variant;
      href?: undefined;
    })
  | (React.AnchorHTMLAttributes<HTMLAnchorElement> & {
      variant?: Variant;
      href: string; // REQUIRED for link mode
    });

const base =
  "shine inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition select-none border will-change-transform";

function variantClasses(variant: Variant) {
  switch (variant) {
    case "secondary":
      return "bg-white text-ink border-border/15 hover:bg-paper-2 hover:-translate-y-[1px] active:translate-y-0";
    case "ghost":
      return "bg-transparent text-ink border-transparent hover:bg-black/5 hover:-translate-y-[1px] active:translate-y-0";
    default:
      // Primary: "mission control" teal with subtle depth
      return "bg-brand-teal text-white border-white/10 shadow-soft hover:opacity-95 hover:-translate-y-[1px] active:translate-y-0";
  }
}

export function Button(props: ButtonProps) {
  const variant: Variant = (props as any).variant ?? "primary";
  const classNameProp = (props as any).className ?? "";
  const className = `${base} ${variantClasses(variant)} ${classNameProp}`;

  // LINK MODE
  if ("href" in props && typeof props.href === "string") {
    const { href, children, variant: _v, className: _c, ...rest } = props as any;
    return (
      <Link href={href} className={className} {...rest}>
        {children}
      </Link>
    );
  }

  // BUTTON MODE
  const { children, variant: _v, className: _c, ...rest } = props as any;
  const disabledStyles = rest.disabled ? " opacity-60 cursor-not-allowed" : "";

  return (
    <button {...rest} className={className + disabledStyles}>
      {children}
    </button>
  );
}

export default Button;
