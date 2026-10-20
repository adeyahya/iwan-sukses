import { notFound } from "next/navigation";

import { Panel, PageHead } from "@/app/admin/(panel)/page-head";
import { AdminForm } from "@/components/admin/admin-form";
import { FieldShell, TextField } from "@/components/admin/fields";
import { ImageInput } from "@/components/admin/image-input";
import { RowsInput } from "@/components/admin/rows-input";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/lib/admin/actions";
import { enName, hasTranslation, settingsSections, withEnglishColumns, type Field } from "@/lib/admin/specs";
import { requireAdmin } from "@/lib/auth";
import { readSettingOverlay, readSettings } from "@/lib/content";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

export default async function SettingsPage({ params }: PageProps<"/admin/konten/[bagian]">) {
  await requireAdmin();
  const { bagian } = await params;
  const section = settingsSections.find((s) => s.slug === bagian);
  if (!section) notFound();
  // Terjemahan dibaca mentah (bukan hasil gabung), supaya isian English yang kosong tetap kosong
  const [all, overlay] = await Promise.all([readSettings(), readSettingOverlay(section.key, "en")]);
  const value = all[section.key] as unknown;
  const at = (v: unknown, f: Field) => (f.name === null ? v : (v as Record<string, unknown> | null)?.[f.name]);

  return (
    <>
      <PageHead
        title={section.title}
        description={
          hasTranslation(section)
            ? `${section.description} Isian (English) tampil di versi bahasa Inggris situs (/en); kosongkan untuk memakai teks Bahasa Indonesia.`
            : section.description
        }
      />
      <Panel>
        <AdminForm action={saveSettings.bind(null, section.slug)}>
          {section.fields.map((f) => (
            <SettingField key={f.name ?? "value"} field={f} value={at(value, f)} en={at(overlay, f)} />
          ))}
        </AdminForm>
      </Panel>
    </>
  );
}

const enLabel = (label: string) => `${label} (English)`;

function SettingField({ field, value, en }: { field: Field; value: unknown; en: unknown }) {
  const name = field.name ?? "value";
  switch (field.type) {
    case "text":
    case "textarea": {
      const id = <TextField name={name} label={field.label} hint={field.hint} defaultValue={String(value ?? "")} multiline={field.type === "textarea"} />;
      if (!field.translate) return id;
      return (
        <div className="grid gap-5 sm:grid-cols-2">
          {id}
          <TextField name={enName(name)} label={enLabel(field.label)} defaultValue={typeof en === "string" ? en : ""} multiline={field.type === "textarea"} />
        </div>
      );
    }
    case "image":
      return (
        <FieldShell label={field.label} hint={field.hint} htmlFor={`f-${name}`}>
          <ImageInput id={`f-${name}`} name={name} defaultValue={String(value ?? "")} />
        </FieldShell>
      );
    case "lines": {
      const id = <LinesField name={name} label={field.label} hint={field.hint} value={value as string[]} />;
      if (!field.translate) return id;
      const enLines = Array.isArray(en) ? (en as string[]) : [];
      return (
        <div className="grid gap-5 sm:grid-cols-2">
          {id}
          <LinesField name={enName(name)} label={enLabel(field.label)} hint="Urutan sama dengan versi Indonesia." value={enLines} minRows={(value as string[]).length + 1} />
        </div>
      );
    }
    case "rows": {
      // Kolom English ada di baris yang sama, jadi ikut terurut dan terhapus bersama barisnya
      const enRows = Array.isArray(en) ? (en as Record<string, string>[]) : [];
      const rows = (value as Record<string, string>[]).map((r, i) => ({
        ...r,
        ...Object.fromEntries(field.columns.filter((c) => c.translate).map((c) => [enName(c.name), enRows[i]?.[c.name] ?? ""])),
      }));
      return (
        <FieldShell label={field.label} hint={field.hint}>
          <RowsInput name={name} columns={withEnglishColumns(field.columns)} defaultValue={rows} fixed={field.fixed} />
        </FieldShell>
      );
    }
  }
}

function LinesField({ name, label, hint, value, minRows = 0 }: { name: string; label: string; hint?: string; value: string[]; minRows?: number }) {
  return (
    <FieldShell label={label} hint={hint} htmlFor={`f-${name}`}>
      <Textarea
        id={`f-${name}`}
        name={name}
        defaultValue={value.join("\n")}
        rows={Math.max(4, value.length + 1, minRows)}
        className="rounded-md bg-background text-[15px]"
      />
    </FieldShell>
  );
}
