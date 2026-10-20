import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { hasLang, localePath } from "@/i18n/config";
import { dictionaries } from "@/i18n/dictionaries";
import { pageMetadata } from "@/i18n/metadata";
import { getDict, getLang } from "@/i18n/server";
import { configurators, configuratorText } from "@/lib/configurators";
import { getContent } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/[lang]/konfigurator">): Promise<Metadata> {
  const { lang } = await params;
  return hasLang(lang) ? pageMetadata(lang, "/konfigurator", dictionaries[lang].configurator.hub) : {};
}

export default async function KonfiguratorHub() {
  const [{ settings }, lang, t] = await Promise.all([getLang().then(getContent), getLang(), getDict()]);
  const images = settings.configuratorImages;
  const hub = t.configurator.hub;
  return (
    <>
      <SiteHeader />
      <main className="py-12 sm:py-20">
        <Container>
          <span className="eyebrow mb-4 block">{hub.overline}</span>
          <h1 className="max-w-[720px] text-[clamp(32px,4.2vw,48px)] leading-[1.1] font-bold tracking-[-0.02em]">
            {hub.heading}
            <span aria-hidden className="spark" />
          </h1>
          <p className="mt-4 max-w-[600px] text-lg leading-7 text-muted-foreground">
            {hub.lead}
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {configurators.map((c) => ({ ...c, text: configuratorText(c, lang) })).map((c) => (
              <Link key={c.path} href={localePath(lang, c.path)} className="group flex flex-col overflow-hidden rounded-lg border transition-colors hover:border-foreground">
                <div className="relative aspect-[4/3] bg-mist">
                  {images[c.id] && <Image src={images[c.id]} alt={images[`${c.id}Alt`]} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-250 ease-linear group-hover:scale-[1.03]" />}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h2 className="text-[22px] leading-7 font-bold">{c.text.title}</h2>
                  <p className="flex-1 text-sm leading-5 text-muted-foreground">{c.text.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.text.features.map((f) => (
                      <Badge key={f} variant="secondary" className="rounded-sm">
                        {f}
                      </Badge>
                    ))}
                  </div>
                  <span className={buttonVariants({ size: "xl" })}>
                    {hub.start}
                    <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
