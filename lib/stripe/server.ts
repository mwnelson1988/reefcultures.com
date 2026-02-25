// lib/stripe/server.ts
import Stripe from "stripe";

/**
 * IMPORTANT:
 * Do NOT hardcode apiVersion here.
 * Vercel/local can end up with different Stripe SDK/type versions.
 * Omitting apiVersion prevents TS build failures.
 */
const key = process.env.STRIPE_SECRET_KEY;

if (!key) {
  throw new Error("Missing STRIPE_SECRET_KEY in environment");
}

export const stripe = new Stripe(key);