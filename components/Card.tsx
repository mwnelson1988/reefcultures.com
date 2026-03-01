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
        // Default: light card + dark-mode card. You can still override via className.
        "relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-soft text-slate-900 " +
          "dark:border-white/10 dark:bg-[#0F1A2E] dark:text-white",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] noise" />
      {children}
    </div>
  );
}