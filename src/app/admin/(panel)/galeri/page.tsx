import { asc } from "drizzle-orm";
import { PlayIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AddPhotos } from "@/app/admin/(panel)/galeri/add-photos";
import { PageHead } from "@/app/admin/(panel)/page-head";
import { RowActions } from "@/components/admin/row-actions";
import { DragHandle } from "@/components/admin/sortable";
import { SortableTable } from "@/components/admin/sortable-table";
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
        description="Foto dan video proyek, dengan urutan sama seperti di situs. Seret ikon titik-titik untuk memindahkan foto, klik foto untuk mengubah judul atau kategori. Selang-seling kategori agar tiap kolom bervariasi."
        action={<AddPhotos />}
      />
      <SortableTable
        table="galleryItems"
        grid
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
        itemClassName="relative overflow-hidden rounded-lg border bg-background"
        items={rows.map((g, i) => ({
          id: g.id,
          className: cn(!g.enabled && "opacity-50"),
          content: (
            <>
              <Link href={`/admin/galeri/${g.id}`} className="group block">
                <span className="relative block aspect-square bg-mist">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewSrc(g.src)} alt="" loading="lazy" className="size-full object-cover" />
                  {g.video && <PlayIcon className="absolute top-1/2 left-1/2 size-8 -translate-1/2 fill-paper text-paper drop-shadow" />}
                </span>
                <span className="block p-2.5">
                  <b className="block truncate text-sm group-hover:underline">{g.title}</b>
                  <span className="block truncate text-xs text-muted-foreground">
                    {i + 1}. {catLabel[g.cat]}
                    {g.video ? " · video" : ""}
                    {!g.enabled ? " · disembunyikan" : ""}
                  </span>
                </span>
              </Link>
              <DragHandle label={g.title} className="absolute top-1.5 left-1.5 bg-background/90 shadow-sm" />
              <div className="absolute top-1.5 right-1.5 rounded-md bg-background/90 shadow-sm">
                <RowActions table="galleryItems" id={g.id} enabled={g.enabled} first={i === 0} last={i === rows.length - 1} label={g.title} arrows={false} />
              </div>
            </>
          ),
        }))}
      />
    </>
  );
}
