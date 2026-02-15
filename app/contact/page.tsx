"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { Mail, Clock, Send, CheckCircle2, AlertTriangle } from "lucide-react";

type Reason =
  | "Sales"
  | "Current Order"
  | "Shipping Question"
  | "Advertising"
  | "Wholesale"
  | "General Request";

type FormState = {
  name: string;
  email: string;
  reason: Reason;
  orderNumber: string;
  message: string;

  // Spam protection
  website: string; // honeypot (should stay empty)
};

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    reason: "General Request",
    orderNumber: "",
    message: "",
    website: "",
  });

  // Used for time-to-submit anti-bot check
  const [startedAt] = useState<number>(() => Date.now());

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  const showOrderNumber = useMemo(() => {
    return form.reason === "Current Order" || form.reason === "Shipping Question";
  }, [form.reason]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setSuccess(false);
    setError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          reason: form.reason,
          orderNumber: showOrderNumber ? form.orderNumber.trim() : "",
          message: form.message.trim(),

          // spam protection payload
          website: form.website, // honeypot
          startedAt, // timestamp
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to send message.");

      setSuccess(true);
      setForm({
        name: "",
        email: "",
        reason: "General Request",
        orderNumber: "",
        message: "",
        website: "",
      });
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[rgb(var(--brand-primary))]/14 blur-[180px]" />

      <section className="relative mx-auto max-w-4xl px-4 pt-12 pb-14 md:pt-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] backdrop-blur-xl shadow-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="pointer-events-none absolute -top-28 left-1/2 h-56 w-[560px] -translate-x-1/2 rounded-full bg-[rgb(var(--brand-primary))]/10 blur-[120px]" />

          <div className="relative px-6 py-8 md:px-8 md:py-10">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
                Contact Reef Cultures
              </h1>
              <p className="mt-3 text-sm md:text-base text-white/70 leading-relaxed">
                Send us a message and we’ll respond within one business day.
              </p>
            </div>

            <div className="mt-7 h-px w-full bg-white/10" />

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                      <Send className="h-5 w-5 text-[rgb(var(--brand-primary))]" />
                    </span>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Send a Message</h2>
                      <p className="mt-1 text-xs text-white/60">
                        Messages send directly to our support inbox.
                      </p>
                    </div>
                  </div>

                  <form className="mt-6 grid gap-5" onSubmit={handleSubmit}>
                    {/* Honeypot (hidden) */}
                    <div className="hidden" aria-hidden="true">
                      <label className="block text-xs font-medium text-white/70">
                        Website
                      </label>
                      <input
                        type="text"
                        name="website"
                        value={form.website}
                        onChange={(e) => updateField("website", e.target.value)}
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-white/70">Name</label>
                        <input
                          name="name"
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => updateField("name", e.target.value)}
                          placeholder="Your name"
                          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/70">Email</label>
                        <input
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={(e) => updateField("email", e.target.value)}
                          placeholder="you@example.com"
                          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                        />
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-white/70">Reason</label>
                        <select
                          name="reason"
                          value={form.reason}
                          onChange={(e) => updateField("reason", e.target.value as Reason)}
                          className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-white/25"
                        >
                          <option className="bg-[#081a22]" value="General Request">
                            General Request
                          </option>
                          <option className="bg-[#081a22]" value="Sales">
                            Sales
                          </option>
                          <option className="bg-[#081a22]" value="Current Order">
                            Current Order
                          </option>
                          <option className="bg-[#081a22]" value="Shipping Question">
                            Shipping Question
                          </option>
                          <option className="bg-[#081a22]" value="Wholesale">
                            Wholesale
                          </option>
                          <option className="bg-[#081a22]" value="Advertising">
                            Advertising
                          </option>
                        </select>
                      </div>

                      {showOrderNumber ? (
                        <div>
                          <label className="block text-xs font-medium text-white/70">
                            Order Number
                          </label>
                          <input
                            name="orderNumber"
                            type="text"
                            value={form.orderNumber}
                            onChange={(e) => updateField("orderNumber", e.target.value)}
                            placeholder="#12345"
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                          />
                        </div>
                      ) : (
                        <div className="hidden md:block" />
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70">Message</label>
                      <textarea
                        name="message"
                        rows={5}
                        required
                        value={form.message}
                        onChange={(e) => updateField("message", e.target.value)}
                        placeholder="Tell us how we can help…"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
                      />
                      <p className="mt-2 text-xs text-white/55">
                        For live products, include delivery date/time and relevant tank parameters.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[rgb(var(--brand-primary))]/20 px-5 py-3 text-sm font-semibold text-white hover:bg-[rgb(var(--brand-primary))]/25 transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                        {loading ? "Sending..." : "Send Message"}
                      </button>

                      <div className="text-xs text-white/60">
                        Prefer email?{" "}
                        <a
                          href="mailto:support@reefcultures.com"
                          className="underline underline-offset-4 hover:text-white"
                        >
                          support@reefcultures.com
                        </a>
                      </div>
                    </div>

                    {success && (
                      <div className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4" />
                        <p>Message sent successfully. We’ll get back to you within 1 business day.</p>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                        <AlertTriangle className="mt-0.5 h-4 w-4" />
                        <p>{error}</p>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              <div className="lg:sticky lg:top-24 self-start">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg">
                  <h2 className="text-lg font-semibold text-white">Support Details</h2>

                  <div className="mt-5 space-y-5">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        <Mail className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">Email</p>
                        <a
                          href="mailto:support@reefcultures.com"
                          className="text-sm text-[rgb(var(--brand-primary))] hover:underline"
                        >
                          support@reefcultures.com
                        </a>
                        <p className="mt-1 text-xs text-white/60">
                          Include your order number when applicable.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                        <Clock className="h-4 w-4 text-[rgb(var(--brand-primary))]" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-white">Response Time</p>
                        <p className="text-sm text-white/75">
                          Typically within <span className="font-semibold text-white">1 business day</span>.
                        </p>
                        <p className="mt-1 text-xs text-white/60">Launch periods may take slightly longer.</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
                    <p className="text-xs text-white/60 leading-relaxed">
                      Customers are responsible for proper acclimation and care of live aquatic products.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6" />
          </div>
        </div>
      </section>
    </Container>
  );
}
