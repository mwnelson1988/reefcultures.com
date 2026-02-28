"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type SearchParams = { redirectTo?: string };

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const [resolved, setResolved] = useState<SearchParams | undefined>(undefined);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const sp = (await searchParams) ?? undefined;
        if (alive) setResolved(sp);
      } catch {
        if (alive) setResolved(undefined);
      }
    })();

    return () => {
      alive = false;
    };
  }, [searchParams]);

  const redirectTo = useMemo(
    () => resolved?.redirectTo || "/account",
    [resolved]
  );

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
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError((data as any)?.error || "Login failed");
      setLoading(false);
      return;
    }

    window.location.href = redirectTo;
  }

  return (
    <main className="pt-20">
      <section className="rc-section">
        <div className="rc-container flex justify-center">
          <div className="w-full max-w-[520px]">
            {/* Header */}
            <div className="text-center">
              <div className="rc-kicker text-muted">Account</div>
              <h1 className="mt-3 text-[34px] leading-[1.05] font-semibold tracking-tightish">
                Sign in
              </h1>
              <p className="mt-3 text-muted leading-relaxed max-w-[52ch] mx-auto">
                Access your account for order history and updates.
              </p>
            </div>

            {/* Panel */}
            <div className="mt-7 mx-auto w-full max-w-[460px] border border-hair bg-panel/20 p-6">
              <form onSubmit={onSubmit} className="grid gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.22em] text-muted">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    required
                    className="mt-2 w-full h-[42px] bg-bg border border-hair px-4 text-ink outline-none transition focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.22em] text-muted">
                    Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    autoComplete="current-password"
                    required
                    className="mt-2 w-full h-[42px] bg-bg border border-hair px-4 text-ink outline-none transition focus:border-accent"
                  />
                </div>

                {error ? <div className="pt-1 text-xs text-red-400">{error}</div> : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-3 h-[42px] inline-flex items-center justify-center bg-ink text-bg text-[11px] font-semibold uppercase tracking-[0.20em] hover:bg-accent transition disabled:opacity-50"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </form>

              {/* Divider + secondary CTA (tight) */}
              <div className="mt-5 border-t border-hair pt-4 flex items-center justify-center gap-3">
                <div className="text-xs text-muted">New here?</div>

                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center h-[36px] px-4 border border-white/20 text-[11px] font-semibold uppercase tracking-[0.20em] text-white hover:border-white/40 hover:text-white transition"
                >
                  Create account
                </Link>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-[12px] uppercase tracking-[0.22em] text-muted hover:text-accent transition"
              >
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}