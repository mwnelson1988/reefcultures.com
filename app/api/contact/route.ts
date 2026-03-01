import { NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * Simple in-memory rate limiting.
 * Note: On serverless, memory may reset between invocations—still useful as a first layer.
 */
type RateEntry = { count: number; resetAt: number };
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // 5 submissions per window per IP
const rateMap = new Map<string, RateEntry>();

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr.trim();
  return "unknown";
}

function rateLimit(ip: string) {
  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  rateMap.set(ip, entry);
  return { allowed: true, remaining: RATE_LIMIT_MAX - entry.count };
}

function isValidEmail(v: unknown) {
  if (typeof v !== "string") return false;
  const s = v.trim();
  if (!s) return false;
  // Simple email validation (good enough for contact form)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

/**
 * Helpful for checking if the route is alive.
 * Visiting /api/contact in a browser does a GET.
 */
export async function GET() {
  return NextResponse.json(
    { ok: true, message: "Contact API is up. Use POST to send messages." },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    // Rate limit by IP
    const ip = getClientIp(req);
    const rl = rateLimit(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse body safely
    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const {
      name,
      email,
      reason,
      orderNumber,
      message,
      // Spam protection fields
      website, // honeypot - should be empty
      startedAt, // ms timestamp from client
    } = body ?? {};

    // Honeypot: if filled, likely a bot
    if (typeof website === "string" && website.trim().length > 0) {
      // Return success to avoid tipping off bots
      return NextResponse.json({ success: true });
    }

    // Time-to-submit check
    const now = Date.now();
    const started = Number(startedAt);
    if (!Number.isFinite(started)) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }
    const seconds = (now - started) / 1000;
    if (seconds < 3) {
      return NextResponse.json({ success: true });
    }
    if (seconds > 60 * 60) {
      return NextResponse.json(
        { error: "Form expired. Please resubmit." },
        { status: 400 }
      );
    }

    // Normal validation
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Name is required." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email address. Use email@example.com format." },
        { status: 400 }
      );
    }
    if (typeof message !== "string" || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // ENV validation
    const apiKey = (process.env.RESEND_API_KEY || "").trim();
    if (!apiKey) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    // ✅ Production-safe sender (must be verified domain)
    // If you want to control this via env, set RESEND_FROM_EMAIL to:
    // ReefCultures <support@reefcultures.com>
    const from =
      (process.env.RESEND_FROM_EMAIL || "").trim() ||
      "ReefCultures <support@reefcultures.com>";

    // ✅ Where messages go
    const toEnv = (process.env.CONTACT_TO_EMAIL || "").trim();
    const to =
      (toEnv || "support@reefcultures.com")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const resend = new Resend(apiKey);

    const subject = `ReefCultures Contact – ${String(reason || "General Request")}${
      orderNumber ? ` (Order: ${String(orderNumber).trim()})` : ""
    }`;

    const text = [
      `Name: ${String(name).trim()}`,
      `Email: ${String(email).trim()}`,
      reason ? `Reason: ${String(reason).trim()}` : null,
      orderNumber ? `Order #: ${String(orderNumber).trim()}` : null,
      "",
      "Message:",
      String(message).trim(),
    ]
      .filter(Boolean)
      .join("\n");

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      // ✅ Reply-to is the customer so you can hit "Reply" in Gmail
      replyTo: String(email).trim(),
      text,
    });

    if (error) {
      console.error("Resend send error:", error);
      return NextResponse.json(
        { error: error.message || "Email send failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: err?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
