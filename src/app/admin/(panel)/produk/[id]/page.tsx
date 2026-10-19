import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { Panel, PageHead } from "@/app/admin/(panel)/page-head";
import { AdminForm } from "@/components/admin/admin-form";
import { CheckboxField, FieldShell, SelectField, TextField } from "@/components/admin/fields";
import { ImageInput } from "@/components/admin/image-input";
import { db } from "@/db";
import { products } from "@/db/schema";
import { saveProduct } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { galleryCategories } from "@/lib/data";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

// Tujuan klik kartu produk: filter galeri atau bagian lain di halaman depan
const hrefHint = `Contoh: ${galleryCategories
  .slice(0, 3)
  .map((c) => `#galeri:${c.value}`)
  .join(", ")} (membuka galeri dengan filter), atau #seni-kaca. Kategori galeri: ${galleryCategories.map((c) => c.value).join(", ")}.`;

export default async function ProductEdit({ params }: PageProps<"/admin/produk/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "baru";
  const [p] = isNew ? [undefined] : await db.select().from(products).where(eq(products.id, Number(id)));
  if (!isNew && !p) notFound();

  return (
    <>
      <PageHead title={isNew ? "Tambah produk" : `Ubah: ${p!.title}`} />
      <Panel>
        <AdminForm action={saveProduct.bind(null, p?.id ?? null)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="title" label="Judul" defaultValue={p?.title} required />
            <TextField name="note" label="Keterangan singkat" defaultValue={p?.note} />
          </div>
          <FieldShell label="Foto" htmlFor="f-image">
            <ImageInput id="f-image" name="image" defaultValue={p?.image ?? ""} />
          </FieldShell>
          <TextField name="alt" label="Deskripsi foto" hint="Untuk pembaca layar dan mesin pencari." defaultValue={p?.alt} />
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="href" label="Tujuan saat diklik" hint={hrefHint} defaultValue={p?.href ?? "#galeri"} />
            <SelectField
              name="layout"
              label="Ukuran kartu"
              defaultValue={p?.layout ?? ""}
              options={[
                { value: "", label: "Normal" },
                { value: "feature", label: "Besar (2 × 2)" },
                { value: "wide", label: "Lebar (2 × 1)" },
              ]}
            />
          </div>
          <CheckboxField name="enabled" label="Tampilkan di situs" defaultChecked={p?.enabled ?? true} />
        </AdminForm>
      </Panel>
    </>
  );
}
