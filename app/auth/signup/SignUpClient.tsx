"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill out name, email, and password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim() ? company.trim() : null,
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          data?.error || data?.message || `Signup failed (status ${res.status}).`
        );
        return;
      }

      setSuccess("Account created! Redirecting...");

      setName("");
      setCompany("");
      setEmail("");
      setPassword("");

      router.push("/auth/signin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">Create account</h1>
        <p className="mt-1 text-sm text-white/70">
          Sign up to access Reefcultures.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-white/80 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">
              Company <span className="text-white/50">(optional)</span>
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoComplete="organization"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="Your company (optional)"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white outline-none focus:border-white/30"
              placeholder="Minimum 6 characters"
            />
            <p className="mt-1 text-xs text-white/50">Minimum 6 characters.</p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-white text-black font-medium py-2 hover:bg-white/90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create account"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/auth/signin")}
            className="w-full rounded-xl border border-white/15 text-white/90 py-2 hover:bg-white/5"
          >
            Already have an account? Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
