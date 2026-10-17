import type { Metadata } from "next";

import { KanopiConfigurator } from "@/components/configurator/kanopi-configurator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const title = "Konfigurator kanopi kaca 3D";
const description =
  "Rancang kanopi kaca laminated dalam 3D: atur lebar, tonjolan, kemiringan, dan rangka, lihat bayangan matahari, cek estimasi harga, lalu kirim ke Iwan Sukses.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/konfigurator/kanopi" },
  openGraph: { url: "/konfigurator/kanopi", title, description },
  twitter: { title, description },
};

export default function KanopiPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <KanopiConfigurator />
      </main>
      <SiteFooter />
    </>
  );
}
