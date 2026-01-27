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
      default: "Vidlecta — Купить TikTok Монеты и Telegram Stars | Быстро и Дешево",
      template: "%s | Vidlecta — Магазин цифровых товаров",
    },
    description: "Сервис №1 для покупки TikTok Coins и Telegram Stars в России. Моментальное пополнение, низкие цены, гарантия безопасности. Оплата картой РФ и СБП.",
    keywords: [
      "TikTok монеты", "купить TikTok монеты", "TikTok coins дешево", "донат TikTok",
      "Telegram Stars", "купить Telegram Stars", "звезды телеграм", "оплата stars рф",
      "Vidlecta"
    ],
    authors: [{ name: "Vidlecta Team" }],
    creator: "Vidlecta",
    openGraph: {
      type: "website",
      locale: "ru_RU",
      url: "https://vidlecta.com",
      siteName: "Vidlecta",
      title: "Vidlecta — TikTok Монеты и Telegram Stars со скидкой",
      description: "Покупайте валюту для соцсетей без переплат. Моментальная доставка.",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Vidlecta - TikTok & Telegram" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Vidlecta — TikTok & Telegram Shop",
      description: "Выгодная покупка монет и звезд.",
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
