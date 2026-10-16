import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
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
  title: "Iwan Sukses — Distributor Kaca",
  description:
    "CV Iwan Sukses Cemerlang, distributor kaca dengan toko di Probolinggo dan Tabanan, Bali: grosir kaca lembaran, tempered glass, seni kaca, kusen aluminium, sliding dan folding door, kanopi, shower, dan railing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${inter.variable} ${poppins.variable} antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
