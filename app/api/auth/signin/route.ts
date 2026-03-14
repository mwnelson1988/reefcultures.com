import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function safeNext(input: unknown) {
  const raw = String(input ?? "").trim();
  if (!raw) return null;

  // only allow internal paths
  if (!raw.startsWith("/")) return null;
  if (raw.startsWith("//")) return null;
  if (raw.includes("://")) return null;

  return raw;
}

export async function POST(req: Request) {
  const form = await req.formData();

  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const requestedNext = safeNext(form.get("next"));

  if (!email || !password) {
    return NextResponse.redirect(new URL("/auth/signin?e=missing", req.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.redirect(new URL("/auth/signin?e=server", req.url));
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session || !data.user) {
    return NextResponse.redirect(new URL("/auth/signin?e=invalid", req.url));
  }

  // Determine role from profiles.role
  let role: "admin" | "user" = "user";
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile?.role === "admin") role = "admin";
  } catch {
    role = "user";
  }

  // ✅ With your folder structure:
  // users -> /dashboard
  // admins -> /dashboard/admin
  let destination = role === "admin" ? "/dashboard/admin" : "/dashboard";

  // Honor next if safe, but block non-admins from /dashboard/admin
  if (requestedNext) {
    if (requestedNext.startsWith("/dashboard/admin") && role !== "admin") {
      destination = "/dashboard";
    } else {
      destination = requestedNext;
    }
  }

  const res = NextResponse.redirect(new URL(destination, req.url));

  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set("sb-access-token", data.session.access_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });
  res.cookies.set("sb-refresh-token", data.session.refresh_token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}
