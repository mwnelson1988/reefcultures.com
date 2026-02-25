"use client";

import { useEffect, useState } from "react";

export function AdminModeBadge() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/admin/status")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setIsAdmin(Boolean(data?.isAdmin));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-200">
      Admin Mode
    </span>
  );
}
