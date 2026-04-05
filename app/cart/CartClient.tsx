"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cartCount, clearCart, readCart, removeCartItem, updateCartItem, type CartItem } from "@/lib/cart";
import { products } from "@/lib/products";
import { Reveal } from "@/components/ui/Reveal";

type ShippingMethod = "ship" | "pickup";
type CheckoutMode = "guest" | "account";

type CartClientProps = {
  isSignedIn?: boolean;
  userEmail?: string;
};

function imageForProduct(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes("64")) return "/images/bottles/IMG_0094.jpeg";
  if (s.includes("32")) return "/images/bottles/IMG_0093.jpeg";
  return "/images/bottles/IMG_0092.jpeg";
}

async function startCartCheckout(
  items: CartItem[],
  mode: CheckoutMode,
  shippingMethod: ShippingMethod,
  email?: string
) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      items,
      guest: mode === "guest",
      shippingMethod,
      customerEmail: email,
    }),
  });

  const raw = await res.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    return {
      ok: false as const,
      error: data?.error || raw || `Checkout failed (${res.status})`,
      status: res.status,
    };
  }

  if (data?.url) {
    window.location.href = data.url;
    return { ok: true as const };
  }

  return { ok: false as const, error: "Missing Stripe checkout URL.", status: 500 };
}

function CheckoutModal({
  open,
  signedIn,
  guestEmail,
  setGuestEmail,
  shippingMethod,
  setShippingMethod,
  loading,
  error,
  onClose,
  onGuest,
  onAccount,
}: {
  open: boolean;
  signedIn: boolean;
  guestEmail: string;
  setGuestEmail: (value: string) => void;
  shippingMethod: ShippingMethod;
  setShippingMethod: (value: ShippingMethod) => void;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onGuest: () => void;
  onAccount: () => void;
}) {
  if (!open) return null;
  const pickupNeedsEmail = !signedIn && shippingMethod === "pickup";

  return (
    <div className="fixed inset-0 z-[100]">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70" />
      <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-[28px] border border-white/12 bg-[#070B12] p-6 shadow-[0_30px_120px_-60px_rgba(0,0,0,0.9)]">
        <div className="text-[10px] uppercase tracking-[0.24em] text-white/55">Checkout</div>
        <div className="mt-2 text-2xl font-semibold tracking-tight text-white">Choose fulfillment</div>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Review your cart, choose shipping or local pickup, then continue to secure Stripe checkout.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setShippingMethod("ship")}
            className={`rounded-2xl border p-4 text-left transition ${
              shippingMethod === "ship"
                ? "border-[rgba(29,211,197,0.55)] bg-[rgba(29,211,197,0.08)]"
                : "border-white/12 bg-white/[0.03] hover:border-white/25"
            }`}
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">Shipping</div>
            <div className="mt-2 text-lg font-semibold text-white">$6.99 flat rate</div>
            <div className="mt-1 text-sm text-white/65">Cold-chain shipping added once per order.</div>
          </button>
          <button
            type="button"
            onClick={() => setShippingMethod("pickup")}
            className={`rounded-2xl border p-4 text-left transition ${
              shippingMethod === "pickup"
                ? "border-[rgba(29,211,197,0.55)] bg-[rgba(29,211,197,0.08)]"
                : "border-white/12 bg-white/[0.03] hover:border-white/25"
            }`}
          >
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">Local pickup</div>
            <div className="mt-2 text-lg font-semibold text-white">Free</div>
            <div className="mt-1 text-sm text-white/65">We&apos;ll email pickup instructions after purchase.</div>
          </button>
        </div>

        {pickupNeedsEmail ? (
          <div className="mt-5">
            <label className="text-[11px] uppercase tracking-[0.18em] text-white/55">Email for pickup instructions</label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border border-white/12 bg-black/30 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
            />
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-300/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>
        ) : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {!signedIn ? (
            <button
              type="button"
              onClick={onGuest}
              disabled={loading}
              className="h-[46px] rounded-2xl border border-white/12 text-[11px] font-semibold uppercase tracking-[0.20em] text-white/90 transition hover:border-white/30 disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Continue as guest"}
            </button>
          ) : null}

          <button
            type="button"
            onClick={signedIn ? onGuest : onAccount}
            disabled={loading}
            className="h-[46px] rounded-2xl bg-white text-[11px] font-semibold uppercase tracking-[0.20em] text-black transition hover:bg-white/90 disabled:opacity-50"
          >
            {loading ? "Please wait..." : signedIn ? "Continue to checkout" : "Sign in / create account"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CartClient({ isSignedIn = false, userEmail = "" }: CartClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("ship");
  const [guestEmail, setGuestEmail] = useState(userEmail);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setItems(readCart());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("reefcart:updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("reefcart:updated", refresh);
    };
  }, []);

  const detailedItems = useMemo(() => {
    return items
      .map((item) => {
        const product = products.find((p) => p.slug === item.slug);
        if (!product) return null;
        const price = Number(product.priceLabel.replace(/[^0-9.]/g, "")) || 0;
        return {
          ...item,
          product,
          unitPrice: price,
          lineTotal: price * item.quantity,
        };
      })
      .filter(Boolean) as Array<{ item?: never; slug: string; quantity: number; product: (typeof products)[number]; unitPrice: number; lineTotal: number }>;
  }, [items]);

  const subtotal = detailedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const count = cartCount(items);

  function pushLoginWithRedirect() {
    const q = new URLSearchParams({ redirectTo: "/cart" }).toString();
    router.push(`/login?${q}`);
  }

  async function continueCheckout(mode: CheckoutMode) {
    if (!items.length) return;
    if (mode === "guest" && shippingMethod === "pickup" && !guestEmail.trim()) {
      setError("Enter an email address so we can send pickup instructions.");
      return;
    }

    setLoading(true);
    setError(null);
    const result = await startCartCheckout(items, mode, shippingMethod, guestEmail.trim() || undefined);
    if (!result.ok) {
      if (result.status === 401 && mode === "account") {
        pushLoginWithRedirect();
        return;
      }
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <main className="pt-20">
      <CheckoutModal
        open={choiceOpen}
        signedIn={isSignedIn}
        guestEmail={guestEmail}
        setGuestEmail={setGuestEmail}
        shippingMethod={shippingMethod}
        setShippingMethod={setShippingMethod}
        loading={loading}
        error={error}
        onClose={() => {
          setChoiceOpen(false);
          setLoading(false);
          setError(null);
        }}
        onGuest={() => continueCheckout(isSignedIn ? "account" : "guest")}
        onAccount={() => continueCheckout("account")}
      />

      <section className="rc-section bg-band">
        <div className="rc-container">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="rc-kicker text-muted">Cart</div>
                <h1 className="mt-4 text-display font-bold">Review your order before checkout.</h1>
                <p className="mt-5 max-w-3xl text-muted leading-relaxed">
                  Adjust quantities, then choose $6.99 flat-rate cold shipping or free local pickup at checkout.
                </p>
              </div>
              <Link
                href="/store"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.20em] text-white/85 transition hover:border-white/30"
              >
                Continue shopping
              </Link>
            </div>
          </Reveal>

          {!detailedItems.length ? (
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center ring-1 ring-white/[0.06]">
              <div className="text-[12px] uppercase tracking-[0.22em] text-white/50">Your cart is empty</div>
              <div className="mt-4 text-2xl font-semibold text-white">Add a bottle size to get started.</div>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/65">
                Build your order first, then choose shipping or local pickup once for the whole order.
              </p>
              <Link
                href="/store"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.20em] text-black transition hover:bg-white/90"
              >
                Shop the store
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_380px]">
              <div className="space-y-4">
                {detailedItems.map(({ product, quantity, lineTotal, slug }) => (
                  <div key={slug} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 ring-1 ring-white/[0.06]">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="relative h-[112px] w-[84px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/15">
                        <Image src={imageForProduct(slug)} alt={`${product.name} ${product.size}`} fill className="object-cover object-center" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] uppercase tracking-[0.20em] text-white/50">{product.size}</div>
                        <div className="mt-2 text-xl font-semibold text-white">{product.name}</div>
                        <p className="mt-2 text-sm text-white/65">{product.subtitle}</p>
                        <div className="mt-3 text-sm text-white/80">${product.priceLabel.replace(/[^0-9.]/g, "")} each</div>
                      </div>
                      <div className="sm:w-[180px]">
                        <div className="text-[11px] uppercase tracking-[0.20em] text-white/45">Quantity</div>
                        <div className="mt-2 flex items-center overflow-hidden rounded-2xl border border-white/10 bg-black/15">
                          <button type="button" onClick={() => updateCartItem(slug, Math.max(1, quantity - 1))} className="px-4 py-3 text-white/85 transition hover:bg-white/[0.06]">−</button>
                          <div className="min-w-[48px] text-center text-sm font-semibold text-white">{quantity}</div>
                          <button type="button" onClick={() => updateCartItem(slug, quantity + 1)} className="px-4 py-3 text-white/85 transition hover:bg-white/[0.06]">+</button>
                        </div>
                        <button type="button" onClick={() => removeCartItem(slug)} className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/45 transition hover:text-white/75">Remove</button>
                      </div>
                      <div className="text-right sm:w-[120px]">
                        <div className="text-[11px] uppercase tracking-[0.20em] text-white/45">Line total</div>
                        <div className="mt-2 text-xl font-semibold text-white">${lineTotal.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/[0.06] lg:sticky lg:top-24 lg:h-fit">
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Order summary</div>
                <div className="mt-6 space-y-4 text-sm text-white/75">
                  <div className="flex items-center justify-between">
                    <span>Items</span>
                    <span>{count}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span>Chosen at checkout</span>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-black/15 p-4 text-sm leading-relaxed text-white/65">
                  Choose <span className="font-semibold text-white">$6.99 cold shipping</span> or <span className="font-semibold text-white">free local pickup</span> once for the whole order.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setChoiceOpen(true);
                    setError(null);
                  }}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.20em] text-black transition hover:bg-white/90"
                >
                  Proceed to checkout
                </button>
                <button
                  type="button"
                  onClick={() => clearCart()}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-white/12 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.20em] text-white/80 transition hover:border-white/28"
                >
                  Clear cart
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
