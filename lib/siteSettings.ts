import prisma from "./prisma";

const DEFAULT_STORE_OPEN_AT = "2026-05-01T00:00:00.000Z";
const DEFAULT_DASHBOARD_OPEN_AT = "2026-05-01T00:00:00.000Z";

async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  return row?.value ?? null;
}

function parseDateOrNull(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function getStoreOpenAt(): Promise<Date> {
  const v = await getSetting("store_open_at");
  return parseDateOrNull(v) || new Date(DEFAULT_STORE_OPEN_AT);
}

export async function getDashboardOpenAt(): Promise<Date> {
  const v = await getSetting("dashboard_open_at");
  return parseDateOrNull(v) || new Date(DEFAULT_DASHBOARD_OPEN_AT);
}
