// components/dashboard/StatCard.tsx
export default function StatCard({
  title,
  value,
  subtext,
}: {
  title: string;
  value: string;
  subtext?: string;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <div className="text-xs font-semibold text-[rgb(var(--ink-700))]">{title}</div>
      <div className="mt-2 text-xl font-extrabold tracking-tight">{value}</div>
      {subtext ? (
        <div className="mt-1 text-sm text-[rgb(var(--ink-700))]">{subtext}</div>
      ) : null}
    </div>
  );
}