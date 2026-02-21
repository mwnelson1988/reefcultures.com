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

export function Button(props: ButtonProps) {
  const variant: Variant = (props as any).variant ?? "primary";
  const classNameProp = (props as any).className ?? "";

  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition border";

  const styles =
    variant === "secondary"
      ? "bg-white text-black border-black/10 hover:bg-black/5"
      : variant === "ghost"
        ? "bg-transparent text-black border-transparent hover:bg-black/5"
        : "bg-black text-white border-black hover:bg-black/90";

  const className = `${base} ${styles} ${classNameProp}`;

  // LINK MODE (href is required here)
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