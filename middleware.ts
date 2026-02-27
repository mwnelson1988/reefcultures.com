import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value, options }: CookieToSet) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if it exists
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  const path = req.nextUrl.pathname;

  // Routes that require a signed-in user
  const requiresAuth =
    path.startsWith("/account") || path.startsWith("/dashboard");

  if (requiresAuth && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", path);
    return NextResponse.redirect(url);
  }

  // Optional: admin-only areas inside dashboard
  // (Helpers/viewers can still see normal dashboard pages)
  const requiresAdmin =
    path.startsWith("/dashboard/team") || path.startsWith("/dashboard/admin");

  if (requiresAdmin && session) {
    // NOTE: This checks if the user is an owner/admin of ANY org they belong to.
    // Later, when we add "active org" selection, we’ll scope this to that org_id.
    const { data: memberships, error } = await supabase
      .from("organization_members")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("is_active", true);

    // If table doesn’t exist yet or RLS blocks (pre-migration), don’t hard-fail.
    // Just let them through for now, and once schema is live this starts enforcing.
    if (!error) {
      const isAdmin =
        (memberships ?? []).some((m) => m.role === "owner" || m.role === "admin");

      if (!isAdmin) {
        const url = req.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return res;
}

export const config = {
  matcher: [
    // Exclude Next internals + static assets + webhook endpoints
    "/((?!_next/static|_next/image|favicon.ico|api/stripe-webhook|api/shipstation-webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};