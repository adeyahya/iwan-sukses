import Image from "next/image";

import { Container, SectionHead } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { company, instagramShots, unsplash } from "@/lib/data";

export function Instagram() {
  return (
    <section className="pb-12 sm:pb-24">
      <Container>
        <SectionHead
          overline="Instagram"
          title={`Karya terbaru di ${company.instagramHandle}`}
          action={
            <a href={company.instagram} target="_blank" rel="noopener" className={buttonVariants({ size: "xl" })}>
              Ikuti di Instagram
            </a>
          }
        />
        {/* DRAFT: ganti dengan foto dari feed Instagram */}
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-6">
          {instagramShots.map((s) => (
            <a key={s.id} href={company.instagram} target="_blank" rel="noopener" aria-label={`Instagram: ${s.label}`} className="group relative aspect-square overflow-hidden rounded-md bg-mist">
              <Image src={unsplash(s.id)} alt="" fill sizes="(min-width: 1024px) 16vw, 33vw" quality={70} className="object-cover transition-transform duration-250 ease-linear group-hover:scale-105" />
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
