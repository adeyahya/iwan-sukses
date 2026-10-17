import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — Distributor Kaca Probolinggo & Bali`,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "distributor kaca",
    "toko kaca Probolinggo",
    "toko kaca Bali",
    "kaca tempered",
    "shower box",
    "railing kaca",
    "kanopi kaca",
    "kusen aluminium",
    "seni kaca",
    "Iwan Sukses",
  ],
  authors: [{ name: "CV Iwan Sukses Cemerlang" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName,
    url: "/",
    title: `${siteName} — Distributor Kaca Probolinggo & Bali`,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} — Distributor Kaca Probolinggo & Bali`,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0B",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${poppins.variable} antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
