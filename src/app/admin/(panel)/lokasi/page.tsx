import { asc } from "drizzle-orm";
import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHead } from "@/app/admin/(panel)/page-head";
import { RowActions } from "@/components/admin/row-actions";
import { DragHandle } from "@/components/admin/sortable";
import { SortableTable } from "@/components/admin/sortable-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cn } from "@/lib/utils";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

export const metadata: Metadata = { title: "Lokasi & WhatsApp" };

export default async function LocationsAdmin() {
  await requireAdmin();
  const rows = await db.select().from(locations).orderBy(asc(locations.sortOrder), asc(locations.id));
  return (
    <>
      <PageHead
        title="Lokasi & WhatsApp"
        description="Toko, alamat, dan nomor WhatsApp. Nomor ini dipakai di tombol WhatsApp, form penawaran, footer, dan konfigurator."
        action={
          <Link href="/admin/lokasi/baru" className={buttonVariants({ size: "xl" })}>
            <PlusIcon />
            Tambah lokasi
          </Link>
        }
      />
      <SortableTable
        table="locations"
        className="divide-y rounded-lg border bg-background"
        itemClassName="flex items-center gap-2 bg-background p-3"
        items={rows.map((l, i) => ({
          id: l.id,
          className: cn(!l.enabled && "opacity-50"),
          content: (
            <>
              <DragHandle label={l.name} />
              <Link href={`/admin/lokasi/${l.id}`} className="min-w-0 flex-1 hover:underline">
                <b className="flex items-center gap-2 text-sm">
                  {l.name}
                  {l.main && <Badge className="rounded-sm">Utama</Badge>}
                </b>
                <span className="block truncate text-xs text-muted-foreground">
                  {l.phoneLabel}: {l.phoneDisplay} · {l.address}
                </span>
              </Link>
              <RowActions table="locations" id={l.id} enabled={l.enabled} first={i === 0} last={i === rows.length - 1} label={l.name} />
            </>
          ),
        }))}
      />
    </>
  );
}
