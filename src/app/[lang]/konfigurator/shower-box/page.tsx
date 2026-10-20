import type { Metadata } from "next";

import { ShowerConfigurator } from "@/components/configurator/shower-configurator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { hasLang } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { pageMetadata } from "@/i18n/metadata";
import { getLang } from "@/i18n/server";
import { getContent } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[lang]/konfigurator/shower-box">): Promise<Metadata> {
  const { lang } = await params;
  return hasLang(lang) ? pageMetadata(lang, "/konfigurator/shower-box", dictionaries[lang].configurator.shower) : {};
}

export default async function KonfiguratorPage() {
  const { settings, stores } = await getLang().then(getContent);
  return (
    <>
      <SiteHeader />
      <main>
        <ShowerConfigurator prices={settings["prices.shower"]} stores={stores} />
      </main>
      <SiteFooter />
    </>
  );
}
