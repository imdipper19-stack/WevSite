import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

import { getSeoMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const defaultMetadata: Metadata = {
    title: {
      default: "Vidlecta — Быстрая покупка TikTok монет",
      template: "%s | Vidlecta",
    },
    description: "Vidlecta — надежная платформа для покупки TikTok монет. Быстро, безопасно и по лучшей цене.",
    keywords: ["TikTok монеты", "купить TikTok монеты", "TikTok coins", "донат TikTok", "Vidlecta"],
    authors: [{ name: "Vidlecta" }],
    creator: "Vidlecta",
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: "https://vidlecta.com",
      siteName: "Vidlecta",
      title: "Vidlecta — Быстрая покупка TikTok монет",
      description: "Надежная платформа для покупки TikTok монет.",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Vidlecta" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Vidlecta",
      description: "Покупка монет TikTok",
      images: ["/og-image.png"],
    },
    robots: { index: true, follow: true },
  };

  // Fetch SEO for the homepage (slug: "/")
  return getSeoMetadata("/", defaultMetadata);
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
