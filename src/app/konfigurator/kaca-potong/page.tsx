import type { Metadata } from "next";

import { GlassCutConfigurator } from "@/components/configurator/glass-cut-configurator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const title = "Pesan kaca potong sesuai ukuran";
const description =
  "Hitung harga kaca potong custom: ukuran sampai sentimeter, bentuk, jenis dan tebal kaca, finishing tepi, dan lubang. Untuk kaca meja, rak, cermin, dan jendela.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/konfigurator/kaca-potong" },
  openGraph: { url: "/konfigurator/kaca-potong", title, description },
  twitter: { title, description },
};

export default function KacaPotongPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <GlassCutConfigurator />
      </main>
      <SiteFooter />
    </>
  );
}
