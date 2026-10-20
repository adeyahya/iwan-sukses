import type { Metadata } from "next";

import { KanopiConfigurator } from "@/components/configurator/kanopi-configurator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { hasLang } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { pageMetadata } from "@/i18n/metadata";
import { getLang } from "@/i18n/server";
import { getContent } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[lang]/konfigurator/kanopi">): Promise<Metadata> {
  const { lang } = await params;
  return hasLang(lang) ? pageMetadata(lang, "/konfigurator/kanopi", dictionaries[lang].configurator.kanopi) : {};
}

export default async function KanopiPage() {
  const { settings, stores } = await getLang().then(getContent);
  return (
    <>
      <SiteHeader />
      <main>
        <KanopiConfigurator prices={settings["prices.kanopi"]} stores={stores} />
      </main>
      <SiteFooter />
    </>
  );
}
