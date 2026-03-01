// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

const REDIRECT_COOKIE = "rc_redirect_to";

function safeInternalPath(path: string) {
  // Only allow internal paths
  if (!path.startsWith("/")) return "/dashboard";
  // Prevent weird protocol injections
  if (path.startsWith("//")) return "/dashboard";
  return path;
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;

  // ✅ Never run auth logic on API routes
  if (path.startsWith("/api")) return res;

  const requiresAuth = path.startsWith("/account") || path.startsWith("/dashboard");
  const requiresAdmin =
    path.startsWith("/dashboard/team") || path.startsWith("/dashboard/admin");

  // If not a protected area, don't create supabase client
  if (!requiresAuth && !requiresAdmin && path !== "/login") {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data } = await supabase.auth.getSession();
  const session = data.session;

  // ✅ If logged in and visiting /login, send them to cookie redirect target if present
  if (path === "/login" && session) {
    const cookieVal = req.cookies.get(REDIRECT_COOKIE)?.value;

    if (cookieVal) {
      const target = safeInternalPath(cookieVal);
      const url = req.nextUrl.clone();
      url.pathname = target.split("?")[0];
      url.search = target.includes("?") ? "?" + target.split("?").slice(1).join("?") : "";

      const resp = NextResponse.redirect(url);
      // clear cookie
      resp.cookies.set(REDIRECT_COOKIE, "", { path: "/", maxAge: 0 });
      return resp;
    }

    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 🔒 Routes that require a signed-in user
  if (requiresAuth && !session) {
    const full = safeInternalPath(req.nextUrl.pathname + req.nextUrl.search);

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";

    const resp = NextResponse.redirect(url);
    // store intended destination
    resp.cookies.set(REDIRECT_COOKIE, full, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 10, // 10 minutes
    });
    return resp;
  }

  // 🔒 Admin-only areas inside dashboard
  if (requiresAdmin && session) {
    const { data: memberships, error } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("is_active", true);

    if (!error) {
      const isAdmin = (memberships ?? []).some(
        (m) => m.role === "owner" || m.role === "admin"
      );

      if (!isAdmin) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/dashboard/:path*", "/account/:path*", "/login"],
};