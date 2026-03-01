import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth/isAdmin";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST() {
  const supabase = await supabaseServer();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return jsonError("Unauthorized", 401);
  if (!(await isAdmin())) return jsonError("Forbidden", 403);

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  const refreshToken = process.env.EBAY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(
      {
        imported: 0,
        skipped: 0,
        message:
          "eBay env not configured yet. Add EBAY_CLIENT_ID / EBAY_CLIENT_SECRET / EBAY_REFRESH_TOKEN after your developer account is approved.",
      },
      { status: 200 }
    );
  }

  // NOTE: Full eBay import wiring depends on scopes + account approval.
  // We intentionally keep this non-destructive until your credentials are live.
  return NextResponse.json(
    {
      imported: 0,
      skipped: 0,
      message:
        "eBay credentials detected. Next step: enable Fulfillment API scopes and we’ll turn on live import.",
    },
    { status: 200 }
  );
}
