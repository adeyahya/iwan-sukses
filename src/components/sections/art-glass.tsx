import Image from "next/image";

import { Container } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { artTechniques, unsplash } from "@/lib/data";

export function ArtGlass() {
  return (
    <section id="seni-kaca" className="dark bg-background py-12 text-foreground sm:py-24">
      <Container className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="grid grid-cols-2 grid-rows-[160px_160px] gap-3 sm:grid-rows-[220px_220px]">
          <div className="relative row-span-2 overflow-hidden rounded-lg">
            <Image src={unsplash("1765447041711-701f95812945")} alt="Jendela kaca patri berwarna memantulkan cahaya" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
          </div>
          <div className="relative overflow-hidden rounded-lg">
            <Image src={unsplash("1579127499396-1fc18048a068")} alt="Kaca patri motif bunga" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
          </div>
          <div className="relative overflow-hidden rounded-lg">
            <Image src={unsplash("1632230997264-b2bfc65cb8b4")} alt="Jendela kaca patri besar" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
          </div>
        </div>
        <div>
          <span className="eyebrow mb-4 block">Produksi seni kaca</span>
          <h2 className="text-[clamp(28px,4.2vw,48px)] leading-[1.1] font-bold tracking-[-0.02em]">
            Kaca yang jadi bagian dari desain
            <span aria-hidden className="spark" />
          </h2>
          <p className="mt-4 max-w-[560px] text-lg leading-7 text-muted-foreground">
            Kami memproduksi kaca dekoratif sesuai gambar atau motif pilihan Anda, untuk pintu, jendela, plafon, dan partisi.
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
            Konsultasikan motif
          </a>
        </div>
      </Container>
    </section>
  );
}
