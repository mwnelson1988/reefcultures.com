import "./globals.css";

import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
          <Navbar />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}