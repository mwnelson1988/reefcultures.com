import clsx from "clsx";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  invert = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  invert?: boolean;
  className?: string;
}) {
  const isCenter = align === "center";
  const fg = invert ? "text-white" : "text-ink";
  const sub = invert ? "text-white/75" : "text-ink/70";
  const eye = invert ? "text-white/60" : "text-ink/55";

  return (
    <div
      className={clsx(
        isCenter ? "text-center mx-auto" : "text-left",
        "max-w-3xl",
        className
      )}
    >
      {eyebrow ? (
        <div className={clsx("caps text-[11px]", eye)}>{eyebrow}</div>
      ) : null}
      <h2
        className={clsx(
          "mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight",
          fg
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className={clsx("mt-4 text-sm sm:text-base", sub)}>{subtitle}</p>
      ) : null}
    </div>
  );
}
