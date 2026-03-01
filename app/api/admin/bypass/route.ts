import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Safety: do not allow bypass in production.
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token") || "";
  const expected = process.env.ADMIN_BYPASS_TOKEN || "";

  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set("rc_admin_bypass", "1", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
