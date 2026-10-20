import type { Metadata } from "next";

import { GlassCutConfigurator } from "@/components/configurator/glass-cut-configurator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { hasLang } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { pageMetadata } from "@/i18n/metadata";
import { getLang } from "@/i18n/server";
import { getContent } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[lang]/konfigurator/kaca-potong">): Promise<Metadata> {
  const { lang } = await params;
  return hasLang(lang) ? pageMetadata(lang, "/konfigurator/kaca-potong", dictionaries[lang].configurator.kacaPotong) : {};
}

export default async function KacaPotongPage() {
  const { settings, stores } = await getLang().then(getContent);
  return (
    <>
      <SiteHeader />
      <main>
        <GlassCutConfigurator prices={settings["prices.kacaPotong"]} stores={stores} />
      </main>
      <SiteFooter />
    </>
  );
}
