"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const inputClass =
  "mt-2 w-full h-[44px] bg-[#070B12] text-white border border-white/15 px-4 outline-none transition " +
  "placeholder:text-white/35 focus:border-white/35 focus:ring-2 focus:ring-white/10 caret-white";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const passwordsMatch = useMemo(() => {
    if (!verifyPassword) return true;
    return password === verifyPassword;
  }, [password, verifyPassword]);

  const canSubmit = useMemo(() => {
    if (!firstName.trim()) return false;
    if (!lastName.trim()) return false;
    if (!email.trim()) return false;
    if (!password) return false;
    if (!verifyPassword) return false;
    if (!passwordsMatch) return false;
    return true;
  }, [firstName, lastName, email, password, verifyPassword, passwordsMatch]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        company: company.trim() || null,
        email: email.trim(),
        password,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError((data as any)?.error || "Signup failed");
      setLoading(false);
      return;
    }

    setSuccess("Account created. Please sign in.");
    setLoading(false);
  }

  return (
    <main className="pt-20">
      <section className="rc-section relative">
        <div className="rc-container flex justify-center relative z-10 pointer-events-auto">
          <div className="w-full max-w-[560px] pointer-events-auto">
            {/* Header */}
            <div className="text-center">
              <div className="rc-kicker text-muted">Account</div>

              <h1 className="mt-3 text-[34px] leading-[1.05] font-semibold tracking-tightish text-white">
                Create account
              </h1>

              <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-[60ch] mx-auto">
                Create a ReefCultures account to manage orders, shipping updates,
                and receipts.
              </p>
            </div>

            {/* Panel */}
            <div className="mt-8 border border-white/15 bg-white/[0.03] p-6 relative z-10">
              <form onSubmit={onSubmit} className="grid gap-4">
                {/* Name row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.22em] text-white/60">
                      First name
                    </label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      type="text"
                      autoComplete="given-name"
                      required
                      className={inputClass}
                      placeholder="Matthew"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.22em] text-white/60">
                      Last name
                    </label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      type="text"
                      autoComplete="family-name"
                      required
                      className={inputClass}
                      placeholder="Nelson"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.22em] text-white/60">
                    Company <span className="opacity-70">(optional)</span>
                  </label>
                  <input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    type="text"
                    autoComplete="organization"
                    className={inputClass}
                    placeholder="ReefCultures (or leave blank)"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.22em] text-white/60">
                    Email
                  </label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    autoComplete="email"
                    required
                    className={inputClass}
                    placeholder="you@domain.com"
                  />
                </div>

                {/* Password row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.22em] text-white/60">
                      Password
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      autoComplete="new-password"
                      required
                      className={inputClass}
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.22em] text-white/60">
                      Verify password
                    </label>
                    <input
                      value={verifyPassword}
                      onChange={(e) => setVerifyPassword(e.target.value)}
                      type="password"
                      autoComplete="new-password"
                      required
                      className={[
                        inputClass,
                        passwordsMatch ? "" : "border-red-300/70 focus:border-red-300/80 focus:ring-red-300/10",
                      ].join(" ")}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="text-xs text-white/60">Use 8+ characters.</div>

                {error && <div className="text-xs text-red-300">{error}</div>}
                {success && (
                  <div className="text-xs text-emerald-300">{success}</div>
                )}

                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="mt-2 h-[44px] inline-flex items-center justify-center bg-white text-black text-[11px] font-semibold uppercase tracking-[0.20em] hover:bg-white/90 transition disabled:opacity-40"
                >
                  {loading ? "Creating…" : "Create account"}
                </button>
              </form>

              <div className="mt-4 text-xs text-white/60 text-center">
                Already have an account?{" "}
                <Link href="/login" className="text-white hover:opacity-90">
                  Sign in
                </Link>
                .
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-[12px] uppercase tracking-[0.22em] text-white/60 hover:text-white transition"
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