"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Signup failed");
      setLoading(false);
      return;
    }

    setSuccess("Account created. Check your email if confirmation is enabled, then sign in.");
    setLoading(false);
  }

  return (
    <main className="pt-20">
      <section className="rc-section">
        <div className="rc-container max-w-xl">
          <div className="rc-kicker text-muted">Account</div>
          <h1 className="mt-4 text-display font-bold">Create account</h1>
          <p className="mt-6 text-muted leading-relaxed">
            Create a ReefCultures account to manage orders and updates.
          </p>

          <div className="mt-10 border border-hair bg-panel/20 p-8">
            <form onSubmit={onSubmit} className="grid gap-5">
              <div>
                <label className="block text-[12px] uppercase tracking-[0.18em] text-muted">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="mt-2 w-full rounded-none bg-bg border border-hair px-4 py-3 text-ink outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-[12px] uppercase tracking-[0.18em] text-muted">Password</label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  className="mt-2 w-full rounded-none bg-bg border border-hair px-4 py-3 text-ink outline-none focus:border-accent"
                />
                <div className="mt-2 text-xs text-muted">
                  Use 8+ characters. You can enable email confirmation in Supabase Auth settings.
                </div>
              </div>

              {error ? <div className="text-sm text-red-300">{error}</div> : null}
              {success ? <div className="text-sm text-green-300">{success}</div> : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center px-6 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.18em] hover:bg-accent transition disabled:opacity-60"
              >
                {loading ? "Creating…" : "Create account"}
              </button>
            </form>

            <div className="mt-6 text-sm text-muted">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:opacity-90">
                Sign in
              </Link>
              .
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
