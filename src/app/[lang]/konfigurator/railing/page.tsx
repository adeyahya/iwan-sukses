import type { Metadata } from "next";

import { RailingConfigurator } from "@/components/configurator/railing-configurator";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { hasLang } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { pageMetadata } from "@/i18n/metadata";
import { getContent } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[lang]/konfigurator/railing">): Promise<Metadata> {
  const { lang } = await params;
  return hasLang(lang) ? pageMetadata(lang, "/konfigurator/railing", dictionaries[lang].configurator.railing) : {};
}

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
