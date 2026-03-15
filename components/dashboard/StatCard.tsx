// components/dashboard/StatCard.tsx

export default function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 shadow-sm backdrop-blur">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">
        {value}
      </div>
      {hint ? <div className="mt-1 text-xs text-white/60">{hint}</div> : null}
    </div>
  );
}
