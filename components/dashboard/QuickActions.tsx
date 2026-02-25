// components/dashboard/QuickActions.tsx

"use client";

import { useState } from "react";

type Action = {
  title: string;
  desc: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "default";
};

export default function QuickActions() {
  const [loadingPortal, setLoadingPortal] = useState(false);

  async function openBillingPortal() {
    try {
      setLoadingPortal(true);
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to open billing portal");
      if (!data?.url) throw new Error("Missing portal url");
      window.location.href = data.url;
    } catch (e: any) {
      alert(e?.message ?? "Something went wrong");
    } finally {
      setLoadingPortal(false);
    }
  }

  const actions: Action[] = [
    {
      title: loadingPortal ? "Opening Billing…" : "Manage Subscription",
      desc: "Pause, update billing, or change frequency.",
      onClick: openBillingPortal,
      variant: "primary",
    },
    {
      title: "Shop Add-ons",
      desc: "Add a bottle to your next shipment.",
      href: "/store",
      variant: "default",
    },
    {
      title: "Contact Support",
      desc: "Shipping issue? We’ll fix it fast.",
      href: "/contact",
      variant: "default",
    },
  ];

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold tracking-tight">Quick actions</h3>
        <span className="text-xs text-[rgb(var(--ink-700))]">Fast</span>
      </div>
      <p className="mt-1 text-sm text-[rgb(var(--ink-700))]">
        The essentials—clean and simple.
      </p>

      <div className="mt-4 space-y-2">
        {actions.map((a) => {
          const base =
            "group block w-full rounded-xl border px-4 py-3 text-left shadow-sm transition " +
            "focus:outline-none focus:ring-2 focus:ring-black/10";

          const primary =
            "border-black/10 bg-[rgb(var(--ocean-950))] text-white hover:opacity-95";
          const secondary =
            "border-black/10 bg-white hover:bg-black/[0.02]";

          const cls =
            base +
            " " +
            (a.variant === "primary" ? primary : secondary) +
            (a.onClick && loadingPortal ? " opacity-80 cursor-not-allowed" : "");

          const Title = (
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-extrabold">{a.title}</div>
              <div
                className={
                  "text-xs font-semibold " +
                  (a.variant === "primary"
                    ? "text-white/80"
                    : "text-[rgb(var(--ink-700))]")
                }
              >
                →
              </div>
            </div>
          );

          const Desc = (
            <div
              className={
                "mt-1 text-xs " +
                (a.variant === "primary"
                  ? "text-white/80"
                  : "text-[rgb(var(--ink-700))]")
              }
            >
              {a.desc}
            </div>
          );

          if (a.onClick) {
            return (
              <button
                key={a.title}
                type="button"
                onClick={a.onClick}
                disabled={loadingPortal}
                className={cls}
              >
                {Title}
                {Desc}
              </button>
            );
          }

          return (
            <a key={a.title} href={a.href} className={cls}>
              {Title}
              {Desc}
            </a>
          );
        })}
      </div>

      <div className="mt-4 border-t border-black/10 pt-3">
        <p className="text-xs text-[rgb(var(--ink-700))]">
          Tip: Use <span className="font-semibold">Manage Subscription</span> to
          update payment methods, address, or cancel anytime.
        </p>
      </div>
    </div>
  );
}