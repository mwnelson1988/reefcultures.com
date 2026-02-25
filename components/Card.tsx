import { ReactNode } from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border/10 bg-white p-6 shadow-soft relative overflow-hidden",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] noise" />
      {children}
    </div>
  );
}
