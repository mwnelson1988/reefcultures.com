// app/api/stripe/portal/route.ts
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/server";
import { getSessionUser } from "@/lib/supabase/server";

function getSiteUrl(req: Request) {
  // Prefer explicit canonical URL
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/+$/, "");

  // Fallback to request origin
  const origin = req.headers.get("origin");
  if (origin) return origin.replace(/\/+$/, "");

  // Last resort
  return "http://localhost:3000";
}

async function getOrCreateCustomerId(email: string) {
  // Try to find existing customer by email
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) return existing.data[0].id;

  // Create a new customer
  const created = await stripe.customers.create({ email });
  return created.id;
}

export async function POST(req: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email =
    typeof (user as any).email === "string"
      ? (user as any).email
      : typeof (user as any)?.user?.email === "string"
        ? (user as any).user.email
        : "";

  if (!email) {
    return NextResponse.json(
      { error: "No email found for the signed-in user." },
      { status: 400 }
    );
  }

  const url = new URL(req.url);
  const body = await req.json().catch(() => ({} as any));
  const returnTo = typeof body?.returnTo === "string" ? body.returnTo : "/dashboard";

  const siteUrl = getSiteUrl(req);
  const return_url = `${siteUrl}${returnTo.startsWith("/") ? returnTo : `/${returnTo}`}`;

  try {
    const customerId = await getOrCreateCustomerId(email);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    console.error("Stripe portal error:", err);
    return NextResponse.json(
      { error: "Failed to create Stripe portal session." },
      { status: 500 }
    );
  }
}