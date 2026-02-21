import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Saydan.net — Kişisel Marka Merkezi",
    template: "%s | Saydan.net",
  },
  description:
    "Yazılım & Lojistik alanında kişisel marka merkezi. Projeler, makaleler ve daha fazlası.",
  metadataBase: new URL("https://saydan.net"),
  openGraph: {
    title: "Saydan.net — Kişisel Marka Merkezi",
    description:
      "Yazılım & Lojistik alanında kişisel marka merkezi. Projeler, makaleler ve daha fazlası.",
    url: "https://saydan.net",
    siteName: "Saydan.net",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-surface font-sans text-gray-900 antialiased dark:bg-surface-dark dark:text-gray-100`}
      >
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-6">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
