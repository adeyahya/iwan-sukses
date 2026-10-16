"use client";

import { MenuIcon } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navLinks } from "@/lib/data";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="outline" size="icon-lg" className="md:hidden" aria-label="Buka menu" />}>
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right" className="w-[80vw] max-w-xs">
        <SheetHeader>
          <SheetTitle className="font-heading">Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Menu utama" className="flex flex-col gap-1 px-4">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-2 py-3 text-base font-semibold hover:bg-muted">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="px-4 pt-4">
          <a href="#kontak" onClick={() => setOpen(false)} className={cn(buttonVariants({ size: "xl" }), "w-full")}>
            Minta penawaran
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}
