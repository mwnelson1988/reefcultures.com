import { ReactNode } from "react";
import clsx from "clsx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-2xl border border-brand-border bg-brand-card/70 backdrop-blur p-6 shadow", className)}>
      {children}
    </div>
  );
}
