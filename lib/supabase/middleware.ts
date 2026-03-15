import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export type CookieOptions = Record<string, any>;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          const opts = options ?? {};
          request.cookies.set({ name, value, ...opts });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value, ...opts });
        },
        remove(name: string, options?: CookieOptions) {
          const opts = options ?? {};
          request.cookies.set({ name, value: "", ...opts });
          response = NextResponse.next({ request });
          response.cookies.set({ name, value: "", ...opts });
        },
      },
    }
  );

  await supabase.auth.getUser();
  return response;
}
