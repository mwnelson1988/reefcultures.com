// app/store/page.tsx
import StoreClient from "./StoreClient";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Decide auth on the server to avoid any client-side modal flicker.
  return <StoreClient isSignedIn={!!user} />;
}
