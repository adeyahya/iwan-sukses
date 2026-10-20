import Image from "next/image";

import { Container } from "@/components/section";
import { getDict, getLang } from "@/i18n/server";
import { getContent } from "@/lib/content";

export async function Process() {
  const [{ settings }, t] = await Promise.all([getLang().then(getContent), getDict()]);
  const { orderSteps, sections } = settings;
  return (
    <section id="proses" className="py-12 sm:py-24">
      <Container className="grid items-start gap-10 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-mist lg:sticky lg:top-24 lg:aspect-[4/5]">
          <Image src={sections.processImage} alt={t.process.imageAlt} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
        <div>
          <span className="eyebrow mb-4 block">{t.process.overline}</span>
          <h2 className="text-[clamp(28px,4.2vw,48px)] leading-[1.1] font-bold tracking-[-0.02em]">{sections.processTitle}</h2>
          <p className="mt-4 max-w-[560px] text-lg leading-7 text-muted-foreground">
            {sections.processLead}
          </p>
          <ol className="mt-8">
            {orderSteps.map((s, i) => (
              <li key={i} className="grid grid-cols-[64px_1fr] gap-4 border-t py-6 last:border-b">
                <span className="font-heading text-[28px] leading-[34px] font-bold">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="mb-1 text-lg leading-6 font-bold">{s.title}</h3>
                  <p className="text-[15px] text-muted-foreground">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}
