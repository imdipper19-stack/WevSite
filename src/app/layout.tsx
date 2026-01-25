import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vidlecta — Быстрая покупка TikTok монет",
    template: "%s | Vidlecta",
  },
  description:
    "Vidlecta — надежная платформа для покупки TikTok монет. Быстро, безопасно и по лучшей цене. От 30 до 100,000 монет.",
  keywords: [
    "TikTok монеты",
    "купить TikTok монеты",
    "TikTok coins",
    "донат TikTok",
    "Vidlecta",
  ],
  authors: [{ name: "Vidlecta" }],
  creator: "Vidlecta",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://vidlecta.com",
    siteName: "Vidlecta",
    title: "Vidlecta — Быстрая покупка TikTok монет",
    description:
      "Надежная платформа для покупки TikTok монет. Быстро, безопасно и по лучшей цене.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vidlecta - TikTok Coins",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vidlecta — Быстрая покупка TikTok монет",
    description:
      "Надежная платформа для покупки TikTok монет. Быстро, безопасно и по лучшей цене.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
