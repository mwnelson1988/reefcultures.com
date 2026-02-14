import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import type { Metadata } from "next";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { MicrosoftClarity } from "@/components/MicrosoftClarity";

export const metadata: Metadata = {
  title: "Reefcultures",
  description: "Clean reef essentials with an easy checkout and customer dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_ID} />
        <MicrosoftClarity clarityId={process.env.NEXT_PUBLIC_CLARITY_ID} />

        <Nav />
        <main className="min-h-[70vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
