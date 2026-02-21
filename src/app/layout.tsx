import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";
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
    default: "Murat Saydan — Yazılım Mimarı & Lojistik Teknolojileri Uzmanı",
    template: "%s | Murat Saydan",
  },
  description:
    "25+ yıl deneyimli Yazılım Mimarı & BT Direktörü. Yazılım Proje Yönetimi, SaaS Geliştirme ve Lojistik Teknolojileri Danışmanlığı.",
  metadataBase: new URL("https://saydan.net"),
  openGraph: {
    title: "Murat Saydan — Yazılım Mimarı & Lojistik Teknolojileri Uzmanı",
    description:
      "25+ yıl deneyimli Yazılım Mimarı & BT Direktörü. Yazılım Proje Yönetimi, SaaS Geliştirme ve Lojistik Teknolojileri Danışmanlığı.",
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
        <AuthProvider>
          <Navbar />
          <main className="mx-auto w-full max-w-6xl px-6">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
