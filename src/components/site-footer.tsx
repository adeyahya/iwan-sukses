import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/section";
import { Separator } from "@/components/ui/separator";
import { getContent } from "@/lib/content";
import { waLink, type Store } from "@/lib/data";

const columns = (instagram: string, stores: Store[]) => [
  {
    title: "Produk",
    links: [
      { href: "/#produk", label: "Kaca lembaran" },
      { href: "/#produk", label: "Tempered glass" },
      { href: "/#produk", label: "Kusen aluminium" },
      { href: "/#seni-kaca", label: "Seni kaca" },
    ],
  },
  {
    title: "Halaman",
    links: [
      { href: "/#galeri", label: "Galeri" },
      { href: "/konfigurator", label: "Konfigurator" },
      { href: "/blog", label: "Blog" },
      { href: "/#proses", label: "Cara pesan" },
      { href: "/#lokasi", label: "Lokasi" },
      { href: "/#kontak", label: "Kontak" },
    ],
  },
  {
    title: "Ikuti",
    links: [
      { href: instagram, label: "Instagram", external: true },
      ...stores.map((s) => ({ href: waLink(s.number), label: `WA ${s.label.replace(/\s*\(.*\)$/, "")}`, external: true })),
    ],
  },
];

export async function SiteFooter() {
  const { settings, stores } = await getContent();
  const { company } = settings;
  return (
    <footer className="dark bg-graphite pt-16 pb-8 text-foreground">
      <Container>
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Image src="/logo/lockup-horizontal_signal.svg" alt="Iwan Sukses" width={146} height={40} className="mb-4 h-10 w-auto" />
            <p className="max-w-[320px] text-sm leading-5 text-muted-foreground">
              {company.legalName}. Distributor kaca dengan toko di Kabupaten Probolinggo dan Tabanan, Bali.
            </p>
          </div>
          {columns(company.instagram, stores).map((c) => (
            <div key={c.title}>
              <h4 className="mb-3 text-sm leading-5 font-bold">{c.title}</h4>
              <ul className="grid gap-2 text-sm leading-5 text-muted-foreground">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {"external" in l ? (
                      <a href={l.href} target="_blank" rel="noopener" className="hover:text-foreground">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="hover:text-foreground">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex flex-wrap justify-between gap-3 pt-6 text-xs leading-4 text-muted-foreground">
          <span>© 2026 {company.legalName}.</span>
          {company.footerNote && <span>{company.footerNote}</span>}
        </div>
      </Container>
    </footer>
  );
}
