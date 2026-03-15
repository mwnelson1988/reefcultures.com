import "./globals.css";

import type { Metadata } from "next";
import AppChrome from "@/components/AppChrome";

export const metadata: Metadata = {
  metadataBase: new URL("https://reefcultures.com"),
  title: {
    default: "ReefCultures",
    template: "%s · ReefCultures",
  },
  description:
    "Premium refrigerated live phytoplankton for reef tanks. Shop batch-positioned marine cultures with cold-chain minded shipping and a cleaner reef-feeding workflow.",
  applicationName: "ReefCultures",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://reefcultures.com",
    siteName: "ReefCultures",
    title: "ReefCultures",
    description:
      "Premium refrigerated live phytoplankton for reef tanks with cold-chain minded shipping and a cleaner reef-feeding workflow.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ReefCultures",
    description:
      "Premium refrigerated live phytoplankton for reef tanks with cold-chain minded shipping and a cleaner reef-feeding workflow.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-ink min-h-screen">
        <div className="min-h-screen bg-ocean-radial">
          <AppChrome>{children}</AppChrome>
        </div>
      </body>
    </html>
  );
}
