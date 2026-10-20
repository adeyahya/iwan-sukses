import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { Panel, PageHead } from "@/app/admin/(panel)/page-head";
import { AdminForm } from "@/components/admin/admin-form";
import { CheckboxField, TextField } from "@/components/admin/fields";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { saveLocation } from "@/lib/admin/actions";
import { requireAdmin } from "@/lib/auth";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

export default async function LocationEdit({ params }: PageProps<"/admin/lokasi/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const isNew = id === "baru";
  const [l] = isNew ? [undefined] : await db.select().from(locations).where(eq(locations.id, Number(id)));
  if (!isNew && !l) notFound();

  return (
    <>
      <PageHead title={isNew ? "Tambah lokasi" : `Ubah: ${l!.name}`} />
      <Panel>
        <AdminForm action={saveLocation.bind(null, l?.id ?? null)}>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="name" label="Nama toko" defaultValue={l?.name} required />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField name="tag" label="Label" hint="Contoh: Pusat, Cabang Bali" defaultValue={l?.tag} />
              <TextField name="tagEn" label="Label (English)" hint="Contoh: Head store" defaultValue={l?.tagEn} />
            </div>
          </div>
          <TextField name="address" label="Alamat lengkap" multiline defaultValue={l?.address} />
          <fieldset className="grid gap-5 rounded-md border p-4 sm:grid-cols-2">
            <legend className="px-1 text-sm font-semibold">WhatsApp</legend>
            <TextField name="phoneLabel" label="Nama di tombol" hint="Contoh: Bali (Tabanan)" defaultValue={l?.phoneLabel} />
            <TextField name="phoneLabelEn" label="Nama di tombol (English)" hint="Kosongkan untuk memakai nama Indonesia." defaultValue={l?.phoneLabelEn} />
            <TextField name="phoneDisplay" label="Nomor tampil" hint="Contoh: 0811-3331-1155" defaultValue={l?.phoneDisplay} />
            <TextField name="phoneNumber" label="Nomor WhatsApp" hint="0811… atau 62811…; diubah otomatis ke format 62." defaultValue={l?.phoneNumber} required />
          </fieldset>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="opens" label="Jam buka" hint="Contoh: Senin–Sabtu 08.00–16.00" defaultValue={l?.opens} />
            <TextField name="opensEn" label="Jam buka (English)" hint="Contoh: Mon–Sat 08:00–16:00" defaultValue={l?.opensEn} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField name="maps" label="Link Google Maps" defaultValue={l?.maps} />
          </div>
          <fieldset className="grid gap-5 rounded-md border p-4 sm:grid-cols-3">
            <legend className="px-1 text-sm font-semibold">Untuk mesin pencari</legend>
            <TextField name="locality" label="Kota / kabupaten" defaultValue={l?.locality} />
            <TextField name="region" label="Provinsi" defaultValue={l?.region} />
            <TextField name="postalCode" label="Kode pos" defaultValue={l?.postalCode} />
          </fieldset>
          <CheckboxField
            name="main"
            label="Toko utama"
            hint="Nomornya dipakai di tombol WhatsApp melayang dan menjadi pilihan awal di form."
            defaultChecked={l?.main ?? false}
          />
          <CheckboxField name="enabled" label="Tampilkan di situs" defaultChecked={l?.enabled ?? true} />
        </AdminForm>
      </Panel>
    </>
  );
}
