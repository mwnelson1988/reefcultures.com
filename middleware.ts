import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const res = await updateSession(request);

  const pathname = request.nextUrl.pathname;
  const isDashboard = pathname.startsWith("/dashboard");

  if (!isDashboard) return res;

  // If no Supabase session cookie exists, redirect to sign-in
  const hasAuthCookie =
    request.cookies.get("sb-access-token") ||
    request.cookies.get("sb:token") ||
    Array.from(request.cookies.getAll()).some((c) => c.name.startsWith("sb-"));

  if (!hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
