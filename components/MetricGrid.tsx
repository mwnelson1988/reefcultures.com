import clsx from "clsx";

export type Metric = {
  label: string;
  value: string;
  note?: string;
};

export function MetricGrid({
  metrics,
  invert = false,
  className,
}: {
  metrics: Metric[];
  invert?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "grid grid-cols-2 sm:grid-cols-4 gap-6",
        className
      )}
    >
      {metrics.map((m) => (
        <div key={m.label}>
          <div
            className={clsx(
              "text-2xl sm:text-3xl font-extrabold tracking-tight",
              invert ? "text-white" : "text-ink"
            )}
          >
            {m.value}
          </div>
          <div
            className={clsx(
              "mt-1 text-xs",
              invert ? "text-white/65" : "text-ink/60"
            )}
          >
            {m.label}
          </div>
          {m.note ? (
            <div
              className={clsx(
                "mt-1 text-[11px]",
                invert ? "text-white/45" : "text-ink/45"
              )}
            >
              {m.note}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
