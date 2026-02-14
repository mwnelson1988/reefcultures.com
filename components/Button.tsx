import Link from "next/link";
import clsx from "clsx";
import { ReactNode } from "react";

type Props =
  | { href: string; children: ReactNode; className?: string }
  | { onClick?: () => void; children: ReactNode; className?: string; type?: "button" | "submit" };

export function Button(props: Props) {
  const common = clsx(
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold",
    "bg-brand-primary text-black hover:opacity-90 transition",
    "focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2 focus:ring-offset-brand-bg",
    (props as any).className
  );

  if ("href" in props) {
    return (
      <Link href={props.href} className={common}>
        {props.children}
      </Link>
    );
  }

  return (
    <button type={props.type ?? "button"} onClick={props.onClick} className={common}>
      {props.children}
    </button>
  );
}
