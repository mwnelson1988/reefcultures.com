import Stripe from "stripe";
import { mustGetEnv } from "@/lib/env";

export const stripe = new Stripe(mustGetEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-06-20",
});
