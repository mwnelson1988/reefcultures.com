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

const resend = new Resend(process.env.RESEND_API_KEY);

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

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: "Missing RESEND_API_KEY" }, { status: 500 });
    }

    // Rate limit by IP
    const ip = getClientIp(req);
    const rl = rateLimit(ip);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();

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

    // Time-to-submit check: bots often submit instantly
    // Require at least 3 seconds from page load to submit
    const now = Date.now();
    const started = Number(startedAt);
    if (!Number.isFinite(started)) {
      return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
    }
    const seconds = (now - started) / 1000;
    if (seconds < 3) {
      // Too fast = likely bot
      return NextResponse.json({ success: true });
    }
    // Optional: reject super-old forms (copy/paste bot)
    if (seconds > 60 * 60) {
      return NextResponse.json({ error: "Form expired. Please resubmit." }, { status: 400 });
    }

    // Normal validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Missing required fields (name, email, message)." },
        { status: 400 }
      );
    }

    const from =
      process.env.RESEND_FROM_EMAIL?.trim() || "Reef Cultures <onboarding@resend.dev>";

    const toEnv = process.env.CONTACT_TO_EMAIL?.trim() || "support@reefcultures.com";
    const to = toEnv.split(",").map((s) => s.trim()).filter(Boolean);

    const subject = `Reef Cultures Contact – ${reason || "General Request"}`;

    const result = await resend.emails.send({
      from,
      to,
      subject,
      replyTo: String(email),
      text: [
        `Name: ${String(name)}`,
        `Email: ${String(email)}`,
        `Reason: ${String(reason || "N/A")}`,
        `Order Number: ${String(orderNumber || "N/A")}`,
        "",
        "Message:",
        String(message),
        "",
        `IP: ${ip}`,
        `Time to submit: ${seconds.toFixed(1)}s`,
      ].join("\n"),
    });

    // If Resend returns an error, do not pretend success
    // @ts-ignore
    if (result?.error) {
      // @ts-ignore
      return NextResponse.json(
        { error: result.error.message || "Email send failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
