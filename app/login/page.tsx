"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function LoginPage({ searchParams }: { searchParams?: { redirectTo?: string } }) {
  const redirectTo = useMemo(() => searchParams?.redirectTo || "/account", [searchParams]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data?.error || "Login failed");
      setLoading(false);
      return;
    }

    window.location.href = redirectTo;
  }

  return (
    <main className="pt-20">
      <section className="rc-section">
        <div className="rc-container max-w-xl">
          <div className="rc-kicker text-muted">Account</div>
          <h1 className="mt-4 text-display font-bold">Sign in</h1>
          <p className="mt-6 text-muted leading-relaxed">
            Access your account for order history and updates.
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
              </div>

              {error ? (
                <div className="text-sm text-red-300">{error}</div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex items-center justify-center px-6 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.18em] hover:bg-accent transition disabled:opacity-60"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="mt-6 text-sm text-muted">
              Don’t have an account?{" "}
              <Link href="/signup" className="text-accent hover:opacity-90">
                Create one
              </Link>
              .
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
