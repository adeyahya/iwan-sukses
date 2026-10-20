import type { Metadata } from "next";

import { fontVariables } from "@/app/fonts";

import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Admin Iwan Sukses" },
  robots: { index: false, follow: false },
};

// Panel admin membaca sesi dan database di setiap permintaan, jadi tidak perlu dinilai untuk navigasi instan
export const instant = false;

// Root layout tersendiri: situs publik ada di app/[lang], admin selalu Bahasa Indonesia
export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="id" className={`${fontVariables} antialiased`}>
      <body className="min-h-full">
        <div className="min-h-dvh bg-secondary">{children}</div>
      </body>
    </html>
  );
}
