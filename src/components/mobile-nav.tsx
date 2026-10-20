"use client";

import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LanguageSwitch } from "@/components/language-switch";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useDict, useLocalePath } from "@/i18n/client";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { nav } = useDict();
  const href = useLocalePath();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="icon-lg" className="lg:hidden" aria-label={nav.open} />}>
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right" className="w-[80vw] max-w-xs">
        <SheetHeader>
          <SheetTitle className="font-heading">{nav.menu}</SheetTitle>
        </SheetHeader>
        <nav aria-label={nav.main} className="flex flex-col gap-1 px-4">
          {navLinks.map((l) => (
            <Link key={l.href} href={href(l.href)} onClick={() => setOpen(false)} className="rounded-md px-2 py-3 text-base font-semibold hover:bg-muted">
              {nav.links[l.key]}
            </Link>
          ))}
        </nav>
        <div className="grid gap-4 px-4 pt-4">
          <Link href={href("/#kontak")} onClick={() => setOpen(false)} className={cn(buttonVariants({ size: "xl" }), "w-full")}>
            {nav.quote}
          </Link>
          <LanguageSwitch className="px-2" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
