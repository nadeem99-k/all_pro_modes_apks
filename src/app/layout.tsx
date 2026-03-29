import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VisitorTracker } from "@/components/VisitorTracker";
import { MaintenanceCheck } from "@/components/MaintenanceCheck";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://vipmods.com'),
  title: "VIP Mod APKs | Premium 100% Guaranteed Mods",
  description: "Get instant, guaranteed access to the world's best unlocked Mod APKs. Netflix Premium, CapCut Pro, and more. No ads. 100% Virus Free.",
  keywords: "mod apk, premium apk, unlocked apk, netflix mod, capcut pro mod, spotify premium apk",
  manifest: "/manifest.json",
  openGraph: {
    title: "VIP Mod APKs",
    description: "The #1 premium platform for lifetime guaranteed mobile Mod APKs.",
    url: "https://vipmods.com",
    siteName: "VIP Mods Pro",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "VIP Mod APKs Logo",
      }
    ],
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.className} min-h-screen bg-dark-900 text-white selection:bg-gold-500 selection:text-black flex flex-col`}>
        <MaintenanceCheck>
          <VisitorTracker />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <WhatsAppFloat />
        </MaintenanceCheck>
      </body>
    </html>
  );
}
