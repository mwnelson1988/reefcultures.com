"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/Button";

export default function SignUpClient() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in name, email, and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Unable to create account.");

      setSuccess("Account created. Redirecting…");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-xs font-semibold text-ink/70">Name</label>
          <input
            className="field mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Matthew"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink/70">
            Company <span className="text-ink/40">(optional)</span>
          </label>
          <input
            className="field mt-2"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Reefcultures"
            autoComplete="organization"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink/70">Email</label>
          <input
            className="field mt-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink/70">Password</label>
          <input
            className="field mt-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <p className="mt-2 text-xs text-ink/55">
            Use a strong password. (Minimum requirements are enforced by Supabase.)
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}

        <Button type="submit" disabled={isSubmitting} className="w-full py-3">
          {isSubmitting ? "Creating…" : "Create account"}
        </Button>

        <p className="text-sm text-ink/70 text-center">
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-semibold hover:opacity-80">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
