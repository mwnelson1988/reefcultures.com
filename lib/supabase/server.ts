import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export type CookieOptions = Record<string, any>;

export async function supabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          const opts = options ?? {};
          cookieStore.set({ name, value, ...opts });
        },
        remove(name: string, options?: CookieOptions) {
          const opts = options ?? {};
          cookieStore.set({ name, value: "", ...opts });
        },
      },
    }
  );
}

export async function getSessionUser() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}
