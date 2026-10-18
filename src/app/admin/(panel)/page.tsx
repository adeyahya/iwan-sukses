import { count, eq } from "drizzle-orm";
import { ImagesIcon, MapPinIcon, PackageIcon, ReceiptIcon } from "lucide-react";
import Link from "next/link";

import { Panel, PageHead } from "@/app/admin/(panel)/page-head";
import { db } from "@/db";
import { galleryItems, locations, products } from "@/db/schema";
import { settingsSections } from "@/lib/admin/specs";
import { requireAdmin } from "@/lib/auth";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

async function tally(table: typeof products | typeof galleryItems | typeof locations) {
  const [all] = await db.select({ n: count() }).from(table);
  const [shown] = await db.select({ n: count() }).from(table).where(eq(table.enabled, true));
  return `${shown.n} tampil${all.n > shown.n ? `, ${all.n - shown.n} disembunyikan` : ""}`;
}

export default async function AdminHome() {
  await requireAdmin();
  const [p, g, l] = await Promise.all([tally(products), tally(galleryItems), tally(locations)]);
  const cards = [
    { href: "/admin/produk", title: "Produk", note: p, icon: PackageIcon },
    { href: "/admin/galeri", title: "Galeri", note: g, icon: ImagesIcon },
    { href: "/admin/lokasi", title: "Lokasi & WhatsApp", note: l, icon: MapPinIcon },
    { href: "/admin/harga", title: "Harga konfigurator", note: "Shower box, kanopi, kaca potong", icon: ReceiptIcon },
  ];
  return (
    <>
      <PageHead title="Panel admin" description="Semua perubahan langsung tampil di situs setelah disimpan." />
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="flex items-center gap-4 rounded-lg border bg-background p-5 hover:border-foreground">
            <c.icon className="size-6 shrink-0 stroke-[1.5]" />
            <span>
              <b className="block font-heading">{c.title}</b>
              <span className="text-sm text-muted-foreground">{c.note}</span>
            </span>
          </Link>
        ))}
      </div>
      <Panel>
        <h2 className="mb-3 font-heading text-lg font-bold">Konten halaman</h2>
        <ul className="grid gap-1">
          {settingsSections.map((s) => (
            <li key={s.slug}>
              <Link href={`/admin/konten/${s.slug}`} className="-mx-2 block rounded-md px-2 py-2 hover:bg-muted">
                <b className="text-sm font-semibold">{s.title}</b>
                <span className="block text-sm text-muted-foreground">{s.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
