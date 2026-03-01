export type Period = "day" | "week" | "month" | "quarter" | "half" | "year";
export type Compare = "none" | "yoy" | "prev";

export type PeriodParams = {
  period: Period;
  compare: Compare;
  dateISO: string; // YYYY-MM-DD anchor
};

export type PeriodWindow = {
  currentStart: Date;
  currentEnd: Date; // exclusive
  compareStart: Date | null;
  compareEnd: Date | null; // exclusive
};

function parseDateISO(dateISO: string) {
  const d = new Date(dateISO + "T00:00:00");
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

function startOfWeekMonday(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // Monday=0
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfMonth(d: Date) {
  const x = new Date(d.getFullYear(), d.getMonth(), 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfQuarter(d: Date) {
  const q = Math.floor(d.getMonth() / 3);
  const x = new Date(d.getFullYear(), q * 3, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfHalf(d: Date) {
  const h = d.getMonth() < 6 ? 0 : 6;
  const x = new Date(d.getFullYear(), h, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfYear(d: Date) {
  const x = new Date(d.getFullYear(), 0, 1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function addMonths(d: Date, n: number) {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function addYears(d: Date, n: number) {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + n);
  return x;
}

export function getPeriodParams(searchParams?: Record<string, string | string[] | undefined>): PeriodParams {
  const rawPeriod = (searchParams?.period as string) || "month";
  const rawCompare = (searchParams?.compare as string) || "none";
  const rawDate = (searchParams?.date as string) || new Date().toISOString().slice(0, 10);

  const period: Period =
    rawPeriod === "day" ||
    rawPeriod === "week" ||
    rawPeriod === "month" ||
    rawPeriod === "quarter" ||
    rawPeriod === "half" ||
    rawPeriod === "year"
      ? rawPeriod
      : "month";

  const compare: Compare = rawCompare === "yoy" || rawCompare === "prev" ? rawCompare : "none";

  const dateISO = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : new Date().toISOString().slice(0, 10);

  return { period, compare, dateISO };
}

export function getPeriodWindow(p: PeriodParams): PeriodWindow {
  const anchor = parseDateISO(p.dateISO);

  let currentStart: Date;
  let currentEnd: Date;

  switch (p.period) {
    case "day":
      currentStart = new Date(anchor);
      currentStart.setHours(0, 0, 0, 0);
      currentEnd = addDays(currentStart, 1);
      break;
    case "week":
      currentStart = startOfWeekMonday(anchor);
      currentEnd = addDays(currentStart, 7);
      break;
    case "month":
      currentStart = startOfMonth(anchor);
      currentEnd = addMonths(currentStart, 1);
      break;
    case "quarter":
      currentStart = startOfQuarter(anchor);
      currentEnd = addMonths(currentStart, 3);
      break;
    case "half":
      currentStart = startOfHalf(anchor);
      currentEnd = addMonths(currentStart, 6);
      break;
    case "year":
      currentStart = startOfYear(anchor);
      currentEnd = addYears(currentStart, 1);
      break;
  }

  let compareStart: Date | null = null;
  let compareEnd: Date | null = null;

  if (p.compare === "yoy") {
    compareStart = addYears(currentStart, -1);
    compareEnd = addYears(currentEnd, -1);
  } else if (p.compare === "prev") {
    const spanMs = currentEnd.getTime() - currentStart.getTime();
    compareEnd = new Date(currentStart);
    compareStart = new Date(currentStart.getTime() - spanMs);
  }

  return { currentStart, currentEnd, compareStart, compareEnd };
}

export function bucketKindForPeriod(period: Period): "day" | "month" {
  // Determines chart bucketing granularity inside the chosen period window.
  if (period === "year") return "month";
  if (period === "half") return "month";
  if (period === "quarter") return "month";
  return "day";
}

export function toISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function monthKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}
