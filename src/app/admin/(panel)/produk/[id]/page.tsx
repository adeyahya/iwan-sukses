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
import { configurators } from "@/lib/configurators";
import { galleryCategories } from "@/lib/data";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

// Tujuan klik kartu produk: galeri dengan filter, bagian lain di halaman depan, atau konfigurator
const hrefOptions = [
  { value: "#galeri", label: "Galeri: semua foto" },
  ...galleryCategories.map((c) => ({ value: `#galeri:${c.value}`, label: `Galeri: ${c.label}` })),
  { value: "#seni-kaca", label: "Bagian seni kaca" },
  { value: "#kontak", label: "Form minta penawaran" },
  ...configurators.map((c) => ({ value: c.path, label: `Konfigurator 3D: ${c.title}` })),
];

export default async function ProductEdit({ params }: PageProps<"/admin/produk/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "baru";
  const [p] = isNew
    ? [undefined]
    : await db
        .select()
        .from(products)
        .where(eq(products.id, Number(id)));
  if (!isNew && !p) notFound();

  return (
    <>
      <PageHead title={isNew ? "Tambah produk" : `Ubah: ${p!.title}`} />
      <Panel>
        <AdminForm action={saveProduct.bind(null, p?.id ?? null)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="title" label="Judul" defaultValue={p?.title} required />
            <TextField name="titleEn" label="Judul (English)" hint="Untuk versi bahasa Inggris situs (/en). Kosongkan untuk memakai teks Bahasa Indonesia." defaultValue={p?.titleEn} />
            <TextField name="note" label="Keterangan singkat" defaultValue={p?.note} />
            <TextField name="noteEn" label="Keterangan singkat (English)" defaultValue={p?.noteEn} />
          </div>
          <FieldShell label="Foto" htmlFor="f-image">
            <ImageInput id="f-image" name="image" defaultValue={p?.image ?? ""} />
          </FieldShell>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              name="alt"
              label="Deskripsi foto (opsional)"
              hint="Kalimat singkat isi foto, untuk Google dan pengunjung tunanetra."
              defaultValue={p?.alt}
            />
            <TextField name="altEn" label="Deskripsi foto (English)" defaultValue={p?.altEn} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              name="href"
              label="Saat kartu diklik, buka"
              defaultValue={p?.href ?? "#galeri"}
              // Nilai lama yang tidak ada di daftar tetap dipertahankan
              options={p && !hrefOptions.some((o) => o.value === p.href) ? [...hrefOptions, { value: p.href, label: p.href }] : hrefOptions}
            />
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
