import { eq } from "drizzle-orm";
import { ExternalLinkIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { DeletePostButton } from "@/app/admin/(panel)/blog/[id]/delete-post-button";
import { SlugField } from "@/app/admin/(panel)/blog/[id]/slug-field";
import { Panel, PageHead } from "@/app/admin/(panel)/page-head";
import { AdminForm } from "@/components/admin/admin-form";
import { FieldShell, SelectField, TextField } from "@/components/admin/fields";
import { ImageInput } from "@/components/admin/image-input";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { savePost } from "@/lib/admin/actions";
import { localePath } from "@/i18n/config";
import { requireAdmin } from "@/lib/auth";
import { emptyDoc, type DocNode } from "@/lib/blog";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

// Tanggal untuk <input type="date"> dalam zona waktu WIB
const toDateInput = (d: Date | null) => (d ? new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 10) : "");

export default async function PostEdit({ params, searchParams }: PageProps<"/admin/blog/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const { baru } = await searchParams;
  const isNew = id === "baru";
  const [p] = isNew ? [undefined] : await db.select().from(posts).where(eq(posts.id, Number(id)));
  if (!isNew && !p) notFound();

  return (
    <>
      <PageHead
        title={isNew ? "Tulis artikel" : "Ubah artikel"}
        description={baru ? "Artikel dibuat. Lanjutkan menulis, lalu simpan lagi." : undefined}
        action={
          p?.status === "published" && (
            <a href={localePath(p.locale, `/blog/${p.slug}`)} target="_blank" rel="noopener" className={buttonVariants({ variant: "outline", size: "lg" })}>
              <ExternalLinkIcon />
              Lihat di situs
            </a>
          )
        }
      />
      <Panel>
        <AdminForm action={savePost.bind(null, p?.id ?? null)} submitLabel={isNew ? "Simpan artikel" : "Simpan perubahan"}>
          <SelectField
            name="locale"
            label="Bahasa artikel"
            hint="Artikel Bahasa Indonesia tampil di /blog dan versi bahasa Inggris (/en/blog). Artikel English hanya tampil di /en/blog."
            defaultValue={p?.locale ?? "id"}
            options={[
              { value: "id", label: "Bahasa Indonesia" },
              { value: "en", label: "English" },
            ]}
          />
          <SlugField title={p?.title ?? ""} slug={p?.slug ?? ""} locked={!isNew} />
          <FieldShell label="Isi artikel">
            <RichTextEditor name="content" defaultValue={(p?.content as DocNode | undefined) ?? emptyDoc} />
          </FieldShell>
          <TextField
            name="excerpt"
            label="Ringkasan"
            multiline
            hint="Tampil di daftar artikel dan hasil pencarian Google. Kosongkan untuk memakai kalimat pertama artikel."
            defaultValue={p?.excerpt}
          />
          <FieldShell label="Foto sampul" htmlFor="f-coverImage" hint="Tampil di daftar artikel, di atas artikel, dan saat link dibagikan.">
            <ImageInput id="f-coverImage" name="coverImage" defaultValue={p?.coverImage ?? ""} />
          </FieldShell>
          <TextField name="coverAlt" label="Deskripsi foto sampul" defaultValue={p?.coverAlt} />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              name="status"
              label="Status"
              defaultValue={p?.status ?? "draft"}
              options={[
                { value: "draft", label: "Draf (belum tampil)" },
                { value: "published", label: "Terbit (tampil di situs)" },
              ]}
            />
            <TextField name="publishedAt" label="Tanggal terbit" type="date" defaultValue={toDateInput(p?.publishedAt ?? null)} hint="Kosongkan untuk memakai tanggal hari ini saat terbit." />
          </div>
        </AdminForm>
      </Panel>
      {p && (
        <div className="mt-6 flex justify-end">
          <DeletePostButton id={p.id} title={p.title} />
        </div>
      )}
    </>
  );
}
