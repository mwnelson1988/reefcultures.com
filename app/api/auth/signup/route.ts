import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "");
  const password = String(form.get("password") ?? "");

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return NextResponse.redirect(new URL(`/auth/signup?error=1`, request.url));
  }

  // If email confirmations are enabled in Supabase, user will need to confirm before access.
  return NextResponse.redirect(new URL(`/dashboard`, request.url));
}
