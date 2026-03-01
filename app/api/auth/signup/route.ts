import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

type CookieToSet = {
  name: string;
  value: string;
  options?: CookieOptions;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    firstName?: string;
    lastName?: string;
    company?: string | null;
    email?: string;
    password?: string;
  };

  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const companyRaw = body.company ?? "";
  const company = (typeof companyRaw === "string" ? companyRaw : "").trim();

  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing email or password" },
      { status: 400 }
    );
  }

  // Optional: enforce names if you want them required (matches your UI)
  if (!firstName || !lastName) {
    return NextResponse.json(
      { error: "Missing first name or last name" },
      { status: 400 }
    );
  }

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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        // store only if provided
        ...(company ? { company } : {}),
      },
    },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}