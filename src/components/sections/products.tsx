import { ArrowRightIcon, BoxIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Container, SectionHead } from "@/components/section";
import { buttonVariants } from "@/components/ui/button";
import { products } from "@/lib/data";
import { cn } from "@/lib/utils";

export function Products() {
  return (
    <section id="produk" className="py-12 sm:py-24">
      <Container>
        <SectionHead
          overline="Produk"
          title="Satu distributor untuk kaca, kusen, dan pintu"
          lead="Pelanggan menyebut kami agen kaca terlengkap. Pilih kategori untuk melihat contoh pekerjaan; semua kaca bisa dipotong sesuai ukuran."
          action={
            <a href="#kontak" className={buttonVariants({ variant: "outline", size: "xl" })}>
              Tanya stok &amp; harga
            </a>
          }
        />
        <div className="grid auto-rows-[240px] grid-cols-1 gap-4 sm:auto-rows-[260px] sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <a
              key={p.title}
              href={p.href}
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
        <Link
          href="/konfigurator"
          className="group mt-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-input p-5 transition-colors hover:border-foreground sm:p-6"
        >
          <span className="flex items-center gap-4">
            <BoxIcon className="size-8 shrink-0 stroke-[1.5]" />
            <span>
              <b className="block font-heading text-lg leading-6">Rancang shower box Anda dalam 3D</b>
              <span className="text-sm text-muted-foreground">Pilih ukuran, jenis kaca, dan warna aksesoris, lihat estimasi harganya.</span>
            </span>
          </span>
          <span className={buttonVariants({ size: "xl" })}>
            Coba konfigurator
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </Container>
    </section>
  );
}
