import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function POST() {
  // ✅ Next.js 15: cookies() is async (in your setup)
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: CookieToSet) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // noop
          }
        },
      },
    }
  );

  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}