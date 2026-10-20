import Image from "next/image";

import { Container } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { getDict, getLang } from "@/i18n/server";
import { getContent } from "@/lib/content";
import { cn } from "@/lib/utils";

export async function ArtGlass() {
  const [{ settings }, t] = await Promise.all([getLang().then(getContent), getDict()]);
  const { artTechniques, sections } = settings;
  return (
    <section id="seni-kaca" className="dark bg-background py-12 text-foreground sm:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="grid grid-cols-2 grid-rows-[160px_160px] gap-3 sm:grid-rows-[220px_220px]">
          {sections.artImages.slice(0, 3).map((img, i) => (
            <div key={i} className={cn("relative overflow-hidden rounded-lg bg-mist", i === 0 && "row-span-2")}>
              {img.image && <Image src={img.image} alt={img.alt} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />}
            </div>
          ))}
        </div>
        <div>
          <span className="eyebrow mb-4 block">{t.art.overline}</span>
          <h2 className="text-[clamp(28px,4.2vw,48px)] leading-[1.1] font-bold tracking-[-0.02em]">
            {sections.artTitle}
            <span aria-hidden className="spark" />
          </h2>
          <p className="mt-4 max-w-[560px] text-lg leading-7 text-muted-foreground">
            {sections.artLead}
          </p>
          <ul className="my-8 grid gap-3">
            {artTechniques.map((t) => (
              <li key={t.name} className="flex items-baseline gap-3 border-b pb-3">
                <b className="min-w-[110px] font-heading font-medium sm:min-w-[140px]">{t.name}</b>
                <span className="text-[15px] text-muted-foreground">{t.desc}</span>
              </li>
            ))}
          </ul>
          <a href="#kontak" className={buttonVariants({ variant: "outline", size: "xl" })}>
            {t.art.cta}
          </a>
        </div>
      </Container>
    </section>
  );
}
