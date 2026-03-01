// app/store/StoreClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { products } from "@/lib/products";
import { Reveal } from "@/components/ui/Reveal";

type CheckoutMode = "guest" | "account";

type StoreClientProps = {
  /**
   * Whether the user is signed in (decided on the server in /store/page.tsx).
   * We still handle stale sessions gracefully if Stripe checkout returns 401.
   */
  isSignedIn?: boolean;
};

function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

async function startCheckout(slug: string, mode: CheckoutMode) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, guest: mode === "guest" }),
  });

  const raw = await res.text();
  let data: any = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg = data?.error || raw || `Checkout failed (${res.status})`;
    return { ok: false as const, error: msg, status: res.status };
  }

  if (data?.url) {
    window.location.href = data.url;
    return { ok: true as const };
  }

  return {
    ok: false as const,
    error: "Checkout error: missing session URL.",
    status: 500,
  };
}

function imageForProduct(p: { slug: string; size?: string }) {
  const s = `${p.slug} ${p.size ?? ""}`.toLowerCase();
  if (s.includes("64")) return "/phyto-64oz.png";
  if (s.includes("32")) return "/phyto-32oz.png";
  if (s.includes("16")) return "/phyto-16oz.png";
  return "/phyto-16oz.png";
}

function CheckoutChoiceModal({
  open,
  title,
  error,
  loading,
  onClose,
  onGuest,
  onAccount,
}: {
  open: boolean;
  title: string;
  error: string | null;
  loading: boolean;
  onClose: () => void;
  onGuest: () => void;
  onAccount: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />

      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[560px] -translate-x-1/2 -translate-y-1/2 border border-white/15 bg-[#070B12] p-6 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)]">
        <div className="text-[10px] uppercase tracking-[0.22em] text-white/60">
          Checkout
        </div>

        <div className="mt-2 text-xl font-semibold text-white">{title}</div>

        <div className="mt-2 text-sm text-white/70 leading-relaxed">
          Choose how you&apos;d like to checkout.
        </div>

        {error && (
          <div className="mt-4 border border-red-300/20 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onGuest}
            disabled={loading}
            className="h-[44px] border border-white/15 text-[11px] font-semibold uppercase tracking-[0.20em] text-white/85 hover:border-white/30 hover:text-white transition disabled:opacity-50"
          >
            {loading ? "Please wait..." : "Checkout as guest"}
          </button>

          <button
            type="button"
            onClick={onAccount}
            disabled={loading}
            className="h-[44px] bg-white text-black text-[11px] font-semibold uppercase tracking-[0.20em] hover:bg-white/90 transition disabled:opacity-50"
          >
            Sign in / Create account
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] uppercase tracking-[0.22em] text-white/60 hover:text-white transition"
          >
            Cancel
          </button>

          <div className="text-[12px] uppercase tracking-[0.22em] text-white/50">
            Secure Stripe checkout
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StoreClient({ isSignedIn = false }: StoreClientProps) {
  const router = useRouter();
  const sp = useSearchParams();

  const [choiceOpen, setChoiceOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const activeTitle = useMemo(() => {
    if (!activeSlug) return null;
    return products.find((p) => p.slug === activeSlug)?.name || "Live Phytoplankton";
  }, [activeSlug]);

  function pushLoginWithRedirect(target: string) {
    // ✅ Encode exactly once using URLSearchParams
    const q = new URLSearchParams({ redirectTo: target }).toString();
    router.push(`/login?${q}`);
  }

  // If we land on /store?buy=slug&mode=account (after login), auto-start account checkout
  useEffect(() => {
    const buy = sp?.get("buy");
    const mode = (sp?.get("mode") as CheckoutMode | null) || null;
    if (!buy) return;

    setActiveSlug(buy);
    setChoiceOpen(true);
    setModalError(null);
    setModalLoading(false);

    if (mode === "account") {
      (async () => {
        setModalLoading(true);
        setModalError(null);

        const r = await startCheckout(buy, "account");

        if (!r.ok) {
          if ((r as any).status === 401) {
            // go to login and come back here
            const redirectTo = `/store?buy=${encodeURIComponent(buy)}&mode=account`;
            pushLoginWithRedirect(redirectTo);
            return;
          }
          setModalError((r as any).error || "Checkout failed.");
          setModalLoading(false);
        }
      })();
    }
  }, [sp]);

  async function onBuyClick(slug: string) {
    setActiveSlug(slug);
    setModalError(null);
    setModalLoading(false);

    // ✅ If the server says we're signed in, skip choice and go straight to Stripe.
    // If the session is stale, the checkout endpoint will return 401 and we'll redirect to login.
    if (isSignedIn) {
      setChoiceOpen(true);
      setModalLoading(true);

      const r = await startCheckout(slug, "account");
      if (!r.ok) {
        if ((r as any).status === 401) {
          const redirectTo = `/store?buy=${encodeURIComponent(slug)}&mode=account`;
          pushLoginWithRedirect(redirectTo);
          return;
        }
        setModalError(r.error);
        setModalLoading(false);
      }
      return;
    }

    // Extra safety: if the server couldn't determine auth (rare), try client session once.
    try {
      const supabase = supabaseBrowser();
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data.session;
      if (hasSession) {
        setChoiceOpen(true);
        setModalLoading(true);
        const r = await startCheckout(slug, "account");
        if (!r.ok) {
          if ((r as any).status === 401) {
            const redirectTo = `/store?buy=${encodeURIComponent(slug)}&mode=account`;
            pushLoginWithRedirect(redirectTo);
            return;
          }
          setModalError(r.error);
          setModalLoading(false);
        }
        return;
      }
    } catch {
      // fall through to modal
    }

    // Not signed in -> show choice modal
    setChoiceOpen(true);
  }

  async function onGuest() {
    if (!activeSlug) return;

    setModalLoading(true);
    setModalError(null);

    const r = await startCheckout(activeSlug, "guest");
    if (!r.ok) {
      setModalError(r.error);
      setModalLoading(false);
    }
  }

  function onAccount() {
    if (!activeSlug) return;

    const redirectTo = `/store?buy=${encodeURIComponent(activeSlug)}&mode=account`;
    pushLoginWithRedirect(redirectTo);
  }

  return (
    <main className="pt-20">
      <CheckoutChoiceModal
        open={choiceOpen}
        title={activeTitle ? `Buy ${activeTitle}` : "Buy"}
        error={modalError}
        loading={modalLoading}
        onClose={() => setChoiceOpen(false)}
        onGuest={onGuest}
        onAccount={onAccount}
      />

      <section className="rc-section bg-band">
        <div className="rc-container">
          <Reveal>
            <div className="rc-kicker text-muted">Store</div>
            <h1 className="mt-4 text-display font-bold">
              Live cultures, shipped cold.
            </h1>
            <p className="mt-5 max-w-2xl text-muted leading-relaxed">
              Choose a size based on system volume and dosing frequency. Same
              standards. Same cold-chain discipline.
            </p>
          </Reveal>

          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            {products.map((p, idx) => (
              <Reveal key={p.slug} delay={0.06 + idx * 0.05}>
                <div className="rc-box p-7">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_140px] gap-8 items-start">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted">
                          {p.size}
                        </div>

                        <div className="mt-3 text-[26px] font-semibold tracking-tightish">
                          {p.name}
                        </div>
                      </div>

                      {/* Bottle Stage */}
                      <div className="relative h-[170px] w-[120px]">
                        <div className="pointer-events-none absolute left-1/2 bottom-3 h-8 w-[70%] -translate-x-1/2 rounded-full bg-black/40 blur-2xl" />

                        <Image
                          src={imageForProduct(p)}
                          alt={`${p.name} ${p.size ?? ""}`}
                          fill
                          className="object-contain object-center drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                          priority={idx === 0}
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    </div>

                    {/* Subtitle + Price */}
                    <div className="mt-6 grid grid-cols-[1fr_160px] gap-6 items-start">
                      <p className="text-sm text-muted leading-relaxed">
                        {p.subtitle}
                      </p>

                      <div className="text-right">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-muted">
                          Price
                        </div>
                        <div className="mt-2 text-[30px] font-semibold">
                          {p.priceLabel}
                        </div>
                      </div>
                    </div>

                    {/* Bullets */}
                    <div className="mt-6 grid gap-2">
                      {p.bullets.slice(0, 3).map((b) => (
                        <div key={b} className="text-sm text-muted">
                          • {b}
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-7 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => onBuyClick(p.slug)}
                        className="px-6 py-3 bg-ink text-bg text-[12px] font-semibold uppercase tracking-[0.20em] hover:bg-[rgba(29,211,197,0.95)] transition"
                      >
                        Buy
                      </button>

                      <Link
                        href={`/store/${p.slug}`}
                        className="px-6 py-3 border border-hair text-[12px] font-semibold uppercase tracking-[0.20em] text-muted hover:text-ink hover:border-accent transition"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}