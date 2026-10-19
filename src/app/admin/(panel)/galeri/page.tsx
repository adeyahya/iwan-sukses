import { asc } from "drizzle-orm";
import { PlayIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHead } from "@/app/admin/(panel)/page-head";
import { RowActions } from "@/components/admin/row-actions";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { galleryItems } from "@/db/schema";
import { previewSrc } from "@/lib/admin/preview";
import { requireAdmin } from "@/lib/auth";
import { galleryCategories } from "@/lib/data";
import { cn } from "@/lib/utils";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

export const metadata: Metadata = { title: "Galeri" };

export default async function GalleryAdmin() {
  await requireAdmin();
  const rows = await db.select().from(galleryItems).orderBy(asc(galleryItems.sortOrder), asc(galleryItems.id));
  const catLabel = Object.fromEntries(galleryCategories.map((c) => [c.value, c.label]));
  return (
    <>
      <PageHead
        title="Galeri"
        description="Foto dan video proyek. Galeri mengisi kolom dari atas ke bawah, jadi selang-seling kategori agar tiap kolom bervariasi."
        action={
          <Link href="/admin/galeri/baru" className={buttonVariants({ size: "xl" })}>
            <PlusIcon />
            Tambah foto
          </Link>
        }
      />
      <ul className="divide-y rounded-lg border bg-background">
        {rows.map((g, i) => (
          <li key={g.id} className={cn("flex items-center gap-3 p-3", !g.enabled && "opacity-50")}>
            <span className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc(g.src)} alt="" className="size-14 rounded-md bg-mist object-cover" />
              {g.video && <PlayIcon className="absolute top-1/2 left-1/2 size-5 -translate-1/2 fill-paper text-paper drop-shadow" />}
            </span>
            <Link href={`/admin/galeri/${g.id}`} className="min-w-0 flex-1 hover:underline">
              <b className="block truncate text-sm">{g.title}</b>
              <span className="block truncate text-xs text-muted-foreground">
                {catLabel[g.cat]}
                {g.video ? " · video" : ""}
              </span>
            </Link>
            <RowActions table="galleryItems" id={g.id} enabled={g.enabled} first={i === 0} last={i === rows.length - 1} label={g.title} />
          </li>
        ))}
      </ul>
    </>
  );
}
