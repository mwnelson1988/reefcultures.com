"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthNav() {
  const supabase = createSupabaseBrowserClient();
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function init() {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSignedIn(!!data.session);
      setLoading(false);
    }

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  async function signOut() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setSignedIn(false);
    setLoading(false);
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div className="text-[12px] uppercase tracking-[0.20em] text-muted">
        Loading
      </div>
    );
  }

  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="text-[12px] uppercase tracking-[0.20em] text-muted hover:text-ink transition"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link
        href="/account"
        className="text-[12px] uppercase tracking-[0.20em] text-muted hover:text-ink transition"
      >
        Account
      </Link>
      <button
        onClick={signOut}
        className="text-[12px] uppercase tracking-[0.20em] text-muted hover:text-accent transition"
      >
        Sign Out
      </button>
    </div>
  );
}
