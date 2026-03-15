// lib/supabase/admin.ts
import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Lazily creates a server-only Supabase admin client.
 * IMPORTANT: this must NOT throw at module import-time, otherwise `next build`
 * can fail when env vars aren't present in the build environment.
 */
export function supabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)");
  }
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { fetch },
  });
}

/**
 * Convenience export for existing code that expects `supabaseAdmin.auth.admin...`
 *
 * This is a Proxy so it stays lazy (won't read env vars at import-time).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAdmin: any = new Proxy(
  {},
  {
    get(_target, prop) {
      // Create the client only when a property is accessed.
      // This keeps `next build` safe if env vars are missing.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const client: any = supabaseAdminClient();
      return client[prop as keyof typeof client];
    },
  }
);
