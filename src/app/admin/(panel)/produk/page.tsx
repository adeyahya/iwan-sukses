import { asc } from "drizzle-orm";
import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHead } from "@/app/admin/(panel)/page-head";
import { RowActions } from "@/components/admin/row-actions";
import { DragHandle } from "@/components/admin/sortable";
import { SortableTable } from "@/components/admin/sortable-table";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { products } from "@/db/schema";
import { previewSrc } from "@/lib/admin/preview";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

export const metadata: Metadata = { title: "Produk" };

export default async function ProductsAdmin() {
  await requireAdmin();
  const rows = await db.select().from(products).orderBy(asc(products.sortOrder), asc(products.id));
  return (
    <>
      <PageHead
        title="Produk"
        description="Kartu kategori di bagian Produk. Urutan di sini sama dengan urutan di situs: seret ikon titik-titik untuk memindahkan."
        action={
          <Link href="/admin/produk/baru" className={buttonVariants({ size: "xl" })}>
            <PlusIcon />
            Tambah produk
          </Link>
        }
      />
      <SortableTable
        table="products"
        className="divide-y rounded-lg border bg-background"
        itemClassName="flex items-center gap-2 bg-background p-3"
        items={rows.map((p, i) => ({
          id: p.id,
          className: cn(!p.enabled && "opacity-50"),
          content: (
            <>
              <DragHandle label={p.title} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewSrc(p.image)} alt="" className="size-14 shrink-0 rounded-md bg-mist object-cover" />
              <Link href={`/admin/produk/${p.id}`} className="min-w-0 flex-1 hover:underline">
                <b className="block truncate text-sm">{p.title}</b>
                <span className="block truncate text-xs text-muted-foreground">
                  {p.note}
                  {p.layout === "feature" ? " · kartu besar" : p.layout === "wide" ? " · kartu lebar" : ""}
                </span>
              </Link>
              <RowActions table="products" id={p.id} enabled={p.enabled} first={i === 0} last={i === rows.length - 1} label={p.title} />
            </>
          ),
        }))}
      />
    </>
  );
}
