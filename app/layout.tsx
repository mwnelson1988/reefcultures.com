import "./globals.css";

import type { Metadata } from "next";
import AppChrome from "@/components/AppChrome";

export const metadata: Metadata = {
  title: "ReefCultures",
  description: "Live phytoplankton, engineered for reef performance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink min-h-screen">
        {/* Background treatment */}
        <div className="min-h-screen bg-ocean-radial">
          <AppChrome>{children}</AppChrome>
        </div>
      </body>
    </html>
  );
}