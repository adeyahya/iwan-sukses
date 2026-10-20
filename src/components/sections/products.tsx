import { ArrowRightIcon, BoxIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container, SectionHead } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";
import { configurators, configuratorText } from "@/lib/configurators";
import { getContent } from "@/lib/content";
import { cn } from "@/lib/utils";

export async function Products() {
  const [{ products, settings }, lang, { products: t }] = await Promise.all([getLang().then(getContent), getLang(), getDict()]);
  return (
    <section id="produk" className="py-12 sm:py-24">
      <Container>
        <SectionHead
          overline={t.overline}
          title={settings.sections.productsTitle}
          lead={settings.sections.productsLead}
          action={
            <a href="#kontak" className={buttonVariants({ variant: "outline", size: "xl" })}>
              {t.ask}
            </a>
          }
        />
        <div className="grid auto-rows-[240px] grid-cols-1 gap-4 sm:auto-rows-[260px] sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <a
              key={`${p.title}-${p.image}`}
              href={localePath(lang, p.href)}
              className={cn(
                "group relative overflow-hidden rounded-lg bg-mist",
                p.layout === "feature" && "sm:col-span-2 sm:row-span-2",
                p.layout === "wide" && "sm:col-span-2",
              )}
            >
              <Image
                src={p.image}
                alt={p.alt}
                fill
                sizes={p.layout ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
                className="object-cover transition-transform duration-250 ease-linear group-hover:scale-[1.04]"
              />
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-md bg-paper px-4 py-3 text-ink">
                <div>
                  <h3 className="text-[17px] leading-[22px] font-bold">{p.title}</h3>
                  <p className="text-[13px] leading-[18px] text-[#555A62]">{p.note}</p>
                </div>
                <ArrowRightIcon className="size-5 shrink-0" />
              </div>
            </a>
          ))}
        </div>
        {/* Konfigurator 3D untuk produk yang paling sering dipesan */}
        <div className="mt-4 rounded-lg border border-input p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-3">
              <BoxIcon className="size-7 shrink-0 stroke-[1.5]" />
              <b className="font-heading text-lg leading-6">{t.configurators}</b>
            </span>
            <Link href={localePath(lang, "/konfigurator")} className="text-sm font-semibold underline-offset-4 hover:underline">
              {t.allConfigurators}
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {configurators.map((c) => (
              <Link key={c.path} href={localePath(lang, c.path)} className={cn(buttonVariants({ variant: "outline", size: "xl" }), "group justify-between")}>
                {configuratorText(c, lang).title}
                <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
