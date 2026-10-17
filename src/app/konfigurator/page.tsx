import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { configurators } from "@/lib/configurators";

const title = "Konfigurator 3D";
const description =
  "Rancang shower box, kanopi kaca, atau pesan kaca potong sesuai ukuran. Lihat hasilnya dalam 3D, cek estimasi harga, lalu kirim spesifikasinya ke Iwan Sukses.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/konfigurator" },
  openGraph: { url: "/konfigurator", title, description },
  twitter: { title, description },
};

export default function KonfiguratorHub() {
  return (
    <>
      <SiteHeader />
      <main className="py-12 sm:py-20">
        <Container>
          <span className="eyebrow mb-4 block">Konfigurator 3D</span>
          <h1 className="max-w-[720px] text-[clamp(32px,4.2vw,48px)] leading-[1.1] font-bold tracking-[-0.02em]">
            Rancang sendiri, lihat hasilnya sebelum memesan
            <span aria-hidden className="spark" />
          </h1>
          <p className="mt-4 max-w-[600px] text-lg leading-7 text-muted-foreground">
            Pilih produk, atur ukuran dan bahan, lihat dalam 3D, lalu kirim spesifikasinya lewat WhatsApp. Tim kami membalas dengan
            penawaran resmi.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {configurators.map((c) => (
              <Link key={c.path} href={c.path} className="group flex flex-col overflow-hidden rounded-lg border transition-colors hover:border-foreground">
                <div className="relative aspect-[4/3] bg-mist">
                  <Image src={c.image} alt={c.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-250 ease-linear group-hover:scale-[1.03]" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h2 className="text-[22px] leading-7 font-bold">{c.title}</h2>
                  <p className="flex-1 text-sm leading-5 text-muted-foreground">{c.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {c.features.map((f) => (
                      <Badge key={f} variant="secondary" className="rounded-sm">
                        {f}
                      </Badge>
                    ))}
                  </div>
                  <span className={buttonVariants({ size: "xl" })}>
                    Mulai rancang
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
