import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { mustGetEnv } from "@/lib/env";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    mustGetEnv("NEXT_PUBLIC_SUPABASE_URL"),
    mustGetEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // In Server Components during render, setting cookies can throw.
            // Middleware/Route Handlers handle refresh flows safely.
          }
        },
      },
    }
  );
}

/**
 * Backwards-compatible alias for route handlers importing `supabaseServer`.
 * Usage: const supabase = await supabaseServer();
 */
export async function supabaseServer() {
  return createSupabaseServerClient();
}

/**
 * Server-safe session helper for layouts/nav.
 */
export async function getSessionUser() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ?? null;
}