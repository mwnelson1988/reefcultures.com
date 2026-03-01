import clsx from "clsx";
import { LucideIcon } from "lucide-react";

export type Feature = {
  title: string;
  description: string;
  icon?: LucideIcon;
};

export function FeatureGrid({
  features,
  variant = "light",
  className,
}: {
  features: Feature[];
  variant?: "light" | "dark";
  className?: string;
}) {
  const isDark = variant === "dark";

  return (
    <div className={clsx("grid gap-6 md:grid-cols-3", className)}>
      {features.map((f) => {
        const Icon = f.icon;
        return (
          <div
            key={f.title}
            className={clsx(
              "rounded-2xl border p-6",
              isDark
                ? "glass-card border-white/10"
                : "bg-white border-border/10 shadow-soft"
            )}
          >
            <div className="flex items-start gap-3">
              {Icon ? (
                <span
                  className={clsx(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl border",
                    isDark
                      ? "border-white/15 bg-white/5 text-white/80"
                      : "border-border/10 bg-paper-2 text-ink/70"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
              ) : null}

              <div>
                <div
                  className={clsx(
                    "text-sm font-semibold",
                    isDark ? "text-white" : "text-ink"
                  )}
                >
                  {f.title}
                </div>
                <p
                  className={clsx(
                    "mt-2 text-sm leading-relaxed",
                    isDark ? "text-white/75" : "text-ink/70"
                  )}
                >
                  {f.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
