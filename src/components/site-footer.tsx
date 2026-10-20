import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/section";
import { Separator } from "@/components/ui/separator";
import { localePath, type Lang } from "@/i18n/config";
import type { Dict } from "@/i18n/dictionaries";
import { getDict, getLang } from "@/i18n/server";
import { getContent } from "@/lib/content";
import { navLinks, waLink, type Store } from "@/lib/data";

const columns = (lang: Lang, t: Dict, instagram: string, stores: Store[]) => [
  {
    title: t.footer.products,
    links: [
      { href: localePath(lang, "/#produk"), label: t.footer.sheetGlass },
      { href: localePath(lang, "/#produk"), label: t.footer.tempered },
      { href: localePath(lang, "/#produk"), label: t.footer.frames },
      { href: localePath(lang, "/#seni-kaca"), label: t.footer.artGlass },
    ],
  },
  {
    title: t.footer.pages,
    links: navLinks.filter((l) => l.key !== "produk").map((l) => ({ href: localePath(lang, l.href), label: t.nav.links[l.key] })),
  },
  {
    title: t.footer.follow,
    links: [
      { href: instagram, label: "Instagram", external: true },
      ...stores.map((s) => ({ href: waLink(s.number), label: `WA ${s.label.replace(/\s*\(.*\)$/, "")}`, external: true })),
    ],
  },
];

export async function SiteFooter() {
  const [{ settings, stores }, lang, t] = await Promise.all([getContent(), getLang(), getDict()]);
  const { company } = settings;
  return (
    <footer className="dark bg-graphite pt-16 pb-8 text-foreground">
      <Container>
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <Image src="/logo/lockup-horizontal_signal.svg" alt="Iwan Sukses" width={146} height={40} className="mb-4 h-10 w-auto" />
            <p className="max-w-[320px] text-sm leading-5 text-muted-foreground">
              {t.footer.about(company.legalName)}
            </p>
          </div>
          {columns(lang, t, company.instagram, stores).map((c) => (
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
