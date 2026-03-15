"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Global site chrome (marketing navbar + footer).
 * Dashboard routes ship their own topbar/sidebars and should not inherit the marketing chrome.
 */
export default function AppChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const isDashboard = pathname.startsWith("/dashboard");

  if (isDashboard) return <>{children}</>;

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
