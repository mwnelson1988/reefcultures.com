// app/dashboard/admin/signups/page.tsx
import { mustGetOrgId } from "@/lib/org";
import PeriodBar from "@/components/dashboard/PeriodBar";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  getPeriodParams,
  getPeriodWindow,
  bucketKindForPeriod,
  toISODate,
  monthKey,
} from "@/lib/dashboard/period";
import { LineChart, LinePoint } from "@/components/dashboard/charts/LineChart";

export const dynamic = "force-dynamic";

type AdminUser = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: any;
};

function shortDateLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function shortMonthLabel(yyyyMm: string) {
  const [y, m] = yyyyMm.split("-").map((x) => Number(x));
  const d = new Date(y, (m || 1) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function makeBucketKeys(start: Date, end: Date, kind: "day" | "month") {
  const keys: string[] = [];
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);

  if (kind === "month") {
    d.setDate(1);
    while (d < end) {
      keys.push(monthKey(d));
      d.setMonth(d.getMonth() + 1);
    }
    return keys;
  }

  while (d < end) {
    keys.push(toISODate(d));
    d.setDate(d.getDate() + 1);
  }
  return keys;
}

function locationLabel(u: AdminUser) {
  const geo = u.user_metadata?.signup?.geo || u.user_metadata?.geo || null;
  if (!geo) return "—";
  const parts = [geo.city, geo.region, geo.country].filter(Boolean);
  return parts.length ? parts.join(", ") : "—";
}

async function listUsersUpTo(limit = 5000): Promise<AdminUser[]> {
  const perPage = 200;
  const maxPages = Math.ceil(limit / perPage);
  const out: AdminUser[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const res = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    const users = (res.data?.users || []) as any[];

    for (const u of users) {
      out.push({
        id: u.id,
        email: u.email ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        user_metadata: u.user_metadata ?? {},
      });
    }

    if (users.length < perPage) break;
  }

  return out;
}

export default async function SignupsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const orgId = mustGetOrgId();

  const sp = (await searchParams) ?? {};
  const params = getPeriodParams(sp);
  const win = getPeriodWindow(params);
  const kind = bucketKindForPeriod(params.period);

  const all = await listUsersUpTo(5000);

  const start = win.currentStart.getTime();
  const end = win.currentEnd.getTime();

  const rows = all
    .filter((u) => {
      const t = new Date(u.created_at).getTime();
      if (!Number.isFinite(t)) return false;
      if (t < start || t >= end) return false;

      const metaOrg = u.user_metadata?.org_id || u.user_metadata?.orgId || null;
      if (metaOrg && orgId && metaOrg !== orgId) return false;
      return true;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const keys = makeBucketKeys(win.currentStart, win.currentEnd, kind);
  const map = new Map<string, number>();

  for (const u of rows) {
    const dt = new Date(u.created_at);
    if (Number.isNaN(dt.getTime())) continue;
    const k = kind === "month" ? monthKey(dt) : toISODate(dt);
    map.set(k, (map.get(k) ?? 0) + 1);
  }

  const series: LinePoint[] = keys.map((k) => ({
    xLabel: kind === "month" ? shortMonthLabel(k) : shortDateLabel(k),
    y: map.get(k) ?? 0,
  }));

  const total = rows.length;
  const avgPer = keys.length ? total / keys.length : 0;

  return (
    <div className="space-y-6">
      <PeriodBar />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="text-xs font-semibold uppercase tracking-wide text-white/60">Growth</div>
        <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">Signups</div>
        <div className="mt-2 text-sm text-white/70">
          These are real Supabase Auth users created in the selected window (with coarse location from signup metadata).
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Kpi label="Total signups" value={String(total)} hint="in window" />
          <Kpi
            label="Avg / bucket"
            value={avgPer.toFixed(1)}
            hint={kind === "month" ? "per month" : "per day"}
          />
          <Kpi label="Bucket" value={kind === "month" ? "Month" : "Day"} hint={params.period} />
        </div>
      </div>

      <LineChart title="Signup trend" subtitle="New accounts created" seriesA={series} />

      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-white">Signup list</div>
            <div className="mt-1 text-sm text-white/70">Email + created date + last sign-in + location.</div>
          </div>
          <div className="text-xs text-white/60">
            Showing <span className="font-semibold text-white">{rows.length}</span>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-white/60">
                <th className="py-2 pr-4 font-semibold">Email</th>
                <th className="py-2 pr-4 font-semibold">Created</th>
                <th className="py-2 pr-4 font-semibold">Last sign-in</th>
                <th className="py-2 pr-4 font-semibold">Location</th>
                <th className="py-2 pr-0 font-semibold">User ID</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {rows.length === 0 ? (
                <tr>
                  <td className="py-4 text-white/60" colSpan={5}>
                    No signups in this window.
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="border-t border-white/10">
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-white">{u.email ?? "—"}</span>
                    </td>
                    <td className="py-3 pr-4 text-white/70">{new Date(u.created_at).toLocaleString()}</td>
                    <td className="py-3 pr-4 text-white/70">
                      {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "—"}
                    </td>
                    <td className="py-3 pr-4 text-white/70">{locationLabel(u)}</td>
                    <td className="py-3 pr-0 font-mono text-xs text-white/60">{u.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-white/60">
          Location is read from <code className="rounded bg-black/20 px-1 py-0.5">user_metadata.signup.geo</code> (Vercel geo
          headers). Locally, location may show as “—”.
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-white/60">{label}</div>
      <div className="mt-2 text-2xl font-extrabold tracking-tight text-white">{value}</div>
      <div className="mt-1 text-xs text-white/70">{hint}</div>
    </div>
  );
}
