"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
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

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // lightweight timing signal for bots
  const [startedAt] = useState(() => Date.now());

  const showOrderNumber = useMemo(
    () => form.reason === "Current Order",
    [form.reason]
  );

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
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // Dark-mode field styling (local overrides so we don’t depend on global .field styles)
  const labelClass = "text-xs font-semibold text-white/80";
  const fieldClass =
    "mt-2 w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-white " +
    "placeholder:text-white/40 outline-none focus:border-white/30 focus:bg-black/45 " +
    "disabled:opacity-60 disabled:cursor-not-allowed";
  const selectClass =
    "mt-2 w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-white " +
    "outline-none focus:border-white/30 focus:bg-black/45";

  return (
    <div className="bg-[rgb(var(--bg-950))] text-white">
      <section className="ocean-shell hero-bg angle-divider noise">
        <Container className="py-16">
          <div className="mx-auto max-w-3xl text-center">
            <div className="caps text-[11px] text-white/65">Contact</div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-white">
              Talk to Reefcultures
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/75">
              Questions about dosing, shipping, or your order? Send a message and
              we’ll get back to you.
            </p>
          </div>
        </Container>
      </section>

      {/* Use dark section instead of paper-shell (paper-shell is light theme) */}
      <section className="bg-[rgb(var(--bg-950))]">
        <Container className="py-14">
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            <div className="lg:col-span-7">
              {/* Dark glass card */}
              <Card className="border-white/10 bg-white/[0.06] backdrop-blur-md">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Honeypot */}
                  <input
                    value={form.website}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, website: e.target.value }))
                    }
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        className={fieldClass}
                        value={form.name}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, name: e.target.value }))
                        }
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        className={fieldClass}
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, email: e.target.value }))
                        }
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Reason</label>
                      <select
                        className={selectClass}
                        value={form.reason}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            reason: e.target.value as Reason,
                          }))
                        }
                      >
                        <option>Sales</option>
                        <option>Current Order</option>
                        <option>Shipping Question</option>
                        <option>Advertising</option>
                        <option>Wholesale</option>
                        <option>General Request</option>
                      </select>
                    </div>

                    {showOrderNumber ? (
                      <div>
                        <label className={labelClass}>Order Number</label>
                        <input
                          className={fieldClass}
                          value={form.orderNumber}
                          onChange={(e) =>
                            setForm((s) => ({
                              ...s,
                              orderNumber: e.target.value,
                            }))
                          }
                          placeholder="Example: RC-1024"
                        />
                      </div>
                    ) : (
                      <div className="hidden sm:block" />
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Message</label>
                    <textarea
                      className={`${fieldClass} min-h-[160px] resize-y`}
                      value={form.message}
                      onChange={(e) =>
                        setForm((s) => ({ ...s, message: e.target.value }))
                      }
                      placeholder="What can we help with?"
                      required
                    />
                  </div>

                  {error ? (
                    <div className="flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                      <AlertTriangle className="mt-0.5 h-4 w-4" />
                      <div>{error}</div>
                    </div>
                  ) : null}

                  {success ? (
                    <div className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                      <CheckCircle2 className="mt-0.5 h-4 w-4" />
                      <div>Message sent. We’ll reply as soon as possible.</div>
                    </div>
                  ) : null}

                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <Button type="submit" disabled={loading} className="px-7 py-3">
                      <span className="inline-flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        {loading ? "Sending…" : "Send message"}
                      </span>
                    </Button>

                    <p className="text-xs text-white/55">
                      For aquarium use only. Proper acclimation and care are the
                      customer’s responsibility.
                    </p>
                  </div>
                </form>
              </Card>
            </div>

            <div className="lg:col-span-5">
              <div className="space-y-6">
                {/* Dark info cards */}
                <Card className="border-white/10 bg-white/[0.06] backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                      <Mail className="h-4 w-4 text-white/80" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white">Email</div>
                      <p className="mt-1 text-sm text-white/70">
                        Use the form and we’ll respond from the Reefcultures team
                        inbox.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="border-white/10 bg-white/[0.06] backdrop-blur-md">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/30">
                      <Clock className="h-4 w-4 text-white/80" />
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Response time
                      </div>
                      <p className="mt-1 text-sm text-white/70">
                        Typically within{" "}
                        <span className="font-semibold text-white">
                          1 business day
                        </span>
                        .
                      </p>
                      <p className="mt-1 text-xs text-white/55">
                        Launch periods may take slightly longer.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}