import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { GalleryFields } from "@/app/admin/(panel)/galeri/[id]/gallery-fields";
import { Panel, PageHead } from "@/app/admin/(panel)/page-head";
import { AdminForm } from "@/components/admin/admin-form";
import { CheckboxField, SelectField, TextField } from "@/components/admin/fields";
import { db } from "@/db";
import { galleryItems } from "@/db/schema";
import { saveGalleryItem } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { galleryCategories } from "@/lib/data";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

export default async function GalleryEdit({ params }: PageProps<"/admin/galeri/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "baru";
  const [g] = isNew ? [undefined] : await db.select().from(galleryItems).where(eq(galleryItems.id, Number(id)));
  if (!isNew && !g) notFound();

  return (
    <>
      <PageHead title={isNew ? "Tambah foto galeri" : `Ubah: ${g!.title}`} />
      <Panel>
        <AdminForm action={saveGalleryItem.bind(null, g?.id ?? null)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="title" label="Judul" hint="Tampil saat foto disorot dan di bawah foto yang diperbesar." defaultValue={g?.title} required />
            <TextField name="titleEn" label="Judul (English)" hint="Untuk versi bahasa Inggris situs (/en). Kosongkan untuk memakai judul Bahasa Indonesia." defaultValue={g?.titleEn} />
          </div>
          <SelectField name="cat" label="Kategori" defaultValue={g?.cat ?? galleryCategories[0].value} options={galleryCategories} />
          <GalleryFields src={g?.src ?? ""} video={g?.video ?? ""} width={g?.width ?? null} height={g?.height ?? null} />
          <CheckboxField name="enabled" label="Tampilkan di situs" defaultChecked={g?.enabled ?? true} />
        </AdminForm>
      </Panel>
    </>
  );
}
