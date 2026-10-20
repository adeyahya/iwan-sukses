"use client";

import { ExternalLinkIcon, FileTextIcon, ImagesIcon, LayoutDashboardIcon, LogOutIcon, MapPinIcon, PackageIcon, ReceiptIcon, TypeIcon, UsersIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logout } from "@/lib/admin/actions";
import { settingsSections } from "@/lib/admin/specs";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Ringkasan", icon: LayoutDashboardIcon },
  { href: "/admin/produk", label: "Produk", icon: PackageIcon },
  { href: "/admin/galeri", label: "Galeri", icon: ImagesIcon },
  { href: "/admin/blog", label: "Blog", icon: FileTextIcon },
  { href: "/admin/lokasi", label: "Lokasi & WhatsApp", icon: MapPinIcon },
  { href: "/admin/harga", label: "Harga konfigurator", icon: ReceiptIcon },
  { href: "/admin/pengguna", label: "Pengguna", icon: UsersIcon },
];

export function AdminNav() {
  const path = usePathname();
  const active = (href: string) => (href === "/admin" ? path === href : path.startsWith(href));
  const item = (href: string) =>
    cn(
      "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap text-muted-foreground hover:bg-muted hover:text-foreground",
      active(href) && "bg-muted text-foreground",
    );

  return (
    <aside className="border-b bg-background lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-r lg:border-b-0">
      <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-5 lg:py-6">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo/lockup-horizontal_black.svg" alt="Iwan Sukses" width={146} height={40} className="h-7 w-auto" />
          <span className="rounded-sm bg-ink px-1.5 py-0.5 text-[11px] font-bold tracking-wide text-paper uppercase">Admin</span>
        </Link>
      </div>
      <nav aria-label="Menu admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={item(l.href)}>
            <l.icon className="size-4" />
            {l.label}
          </Link>
        ))}
        <span className="mt-4 hidden px-3 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:block">Konten halaman</span>
        {settingsSections.map((s) => (
          <Link key={s.slug} href={`/admin/konten/${s.slug}`} className={item(`/admin/konten/${s.slug}`)}>
            <TypeIcon className="size-4 lg:hidden" />
            {s.title}
          </Link>
        ))}
        <div className="flex gap-1 lg:mt-6 lg:flex-col lg:border-t lg:pt-4">
          <a href="/" target="_blank" rel="noopener" className={item("/__situs")}>
            <ExternalLinkIcon className="size-4" />
            Lihat situs
          </a>
          <form action={logout}>
            <button type="submit" className={cn(item("/__keluar"), "w-full")}>
              <LogOutIcon className="size-4" />
              Keluar
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
