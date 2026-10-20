import Image from "next/image";
import Link from "next/link";

import { LanguageSwitch } from "@/components/language-switch";
import { MobileNav } from "@/components/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

export async function SiteHeader() {
  const [lang, { nav }] = await Promise.all([getLang(), getDict()]);
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-4 lg:gap-4 xl:gap-6 sm:px-8 lg:h-[76px] lg:px-16">
        <Link href={localePath(lang, "/")} aria-label={nav.home} className="shrink-0">
          <Image src="/logo/lockup-horizontal_black.svg" alt="Iwan Sukses" width={146} height={40} priority className="h-[34px] w-auto lg:h-10" />
        </Link>
        <nav aria-label={nav.main} className="hidden gap-4 text-[15px] font-semibold whitespace-nowrap lg:flex xl:gap-7">
          {navLinks.map((l) => (
            <Link key={l.href} href={localePath(lang, l.href)} className="text-muted-foreground transition-colors hover:text-foreground">
              {nav.links[l.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitch compact className="hidden lg:flex" />
          <Link href={localePath(lang, "/#kontak")} className={cn(buttonVariants({ size: "xl" }), "hidden lg:inline-flex")}>
            {nav.quote}
          </Link>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
