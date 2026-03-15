import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // IMPORTANT: Direct references are required for Next to inline NEXT_PUBLIC_* into client bundles.
  if (!url) throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  if (!anon) throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createBrowserClient(url, anon);
}