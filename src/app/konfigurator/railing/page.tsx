import type { Metadata } from "next";

import { RailingConfigurator } from "@/components/configurator/railing-configurator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";

const title = "Konfigurator railing kaca 3D";
const description =
  "Rancang railing kaca tempered untuk balkon, mezanin, atau tangga dalam 3D: atur bentuk, panjang, tiang, handrail, dan kaca, cek estimasi harga, lalu kirim ke Iwan Sukses.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/konfigurator/railing" },
  openGraph: { url: "/konfigurator/railing", title, description },
  twitter: { title, description },
};

export default async function RailingPage() {
  const { settings, stores } = await getContent();
  return (
    <>
      <SiteHeader />
      <main>
        <RailingConfigurator prices={settings["prices.railing"]} stores={stores} />
      </main>
      <SiteFooter />
    </>
  );
}
