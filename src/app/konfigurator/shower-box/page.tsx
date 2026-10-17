import type { Metadata } from "next";

import { ShowerConfigurator } from "@/components/configurator/shower-configurator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const title = "Konfigurator shower box 3D";
const description =
  "Rancang shower box kaca tempered dalam 3D: pilih model, ukuran, jenis kaca, dan warna aksesoris, lihat estimasi harga, lalu kirim spesifikasinya ke Iwan Sukses.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/konfigurator/shower-box" },
  openGraph: { url: "/konfigurator/shower-box", title, description },
  twitter: { title, description },
};

export default function KonfiguratorPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <ShowerConfigurator />
      </main>
      <SiteFooter />
    </>
  );
}
