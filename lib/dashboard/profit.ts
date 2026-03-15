// lib/dashboard/profit.ts
import type { SupabaseClient } from "@supabase/supabase-js";

export type ProfitRow = {
  placed_at: string | null;
  total_cents: number;
  profit_cents: number;
};

export type FetchProfitRowsResult = {
  rows: ProfitRow[];
  usedView: boolean; // true if v_order_profit exists & was used
};

export async function fetchProfitRows({
  supabase,
  orgId,
  startIso,
  endIso,
  limit = 5000,
}: {
  supabase: SupabaseClient;
  orgId: string;
  startIso: string;
  endIso: string;
  limit?: number;
}): Promise<FetchProfitRowsResult> {
  // 1) Try DB view first (best if you have it)
  // Expected columns: org_id, placed_at, total_cents, profit_cents
  try {
    const { data, error } = await supabase
      .from("v_order_profit")
      .select("placed_at,total_cents,profit_cents")
      .eq("org_id", orgId)
      .gte("placed_at", startIso)
      .lt("placed_at", endIso)
      .limit(limit);

    if (!error && Array.isArray(data)) {
      const rows: ProfitRow[] = data.map((r: any) => ({
        placed_at: r?.placed_at ?? null,
        total_cents: Number(r?.total_cents ?? 0) || 0,
        profit_cents: Number(r?.profit_cents ?? 0) || 0,
      }));
      return { rows, usedView: true };
    }
    // if the view doesn't exist, Supabase often returns an error like "relation does not exist"
    // fallthrough to fallback.
  } catch {
    // fallthrough
  }

  // 2) Fallback: compute from orders table (and optional columns if present)
  // We keep this permissive because schemas vary by environment.
  // If profit_cents exists on orders, we use it. Otherwise profit is 0 until you add costs logic.
  const { data: orders, error: oErr } = await supabase
    .from("orders")
    .select("placed_at,created_at,total_cents,profit_cents")
    .eq("org_id", orgId)
    .gte("created_at", startIso)
    .lt("created_at", endIso)
    .limit(limit);

  if (oErr || !Array.isArray(orders)) {
    return { rows: [], usedView: false };
  }

  const rows: ProfitRow[] = orders.map((o: any) => {
    const placed = o?.placed_at ?? o?.created_at ?? null;
    return {
      placed_at: placed,
      total_cents: Number(o?.total_cents ?? 0) || 0,
      profit_cents: Number(o?.profit_cents ?? 0) || 0,
    };
  });

  return { rows, usedView: false };
}