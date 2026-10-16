import Image from "next/image";

import { MobileNav } from "@/components/mobile-nav";
import { buttonVariants } from "@/components/ui/button";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between gap-6 px-4 sm:px-8 lg:h-[76px] lg:px-16">
        <a href="#" aria-label="Iwan Sukses, beranda" className="shrink-0">
          <Image src="/logo/lockup-horizontal_black.svg" alt="Iwan Sukses" width={146} height={40} priority className="h-[34px] w-auto lg:h-10" />
        </a>
        <nav aria-label="Menu utama" className="hidden gap-8 text-[15px] font-semibold md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <a href="#kontak" className={cn(buttonVariants({ size: "xl" }), "hidden md:inline-flex")}>
          Minta penawaran
        </a>
        <MobileNav />
      </div>
    </header>
  );
}
