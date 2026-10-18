import { notFound } from "next/navigation";

import { Panel, PageHead } from "@/app/admin/(panel)/page-head";
import { AdminForm } from "@/components/admin/admin-form";
import { FieldShell, TextField } from "@/components/admin/fields";
import { ImageInput } from "@/components/admin/image-input";
import { RowsInput } from "@/components/admin/rows-input";
import { Textarea } from "@/components/ui/textarea";
import { saveSettings } from "@/lib/admin/actions";
import { settingsSections, type Field } from "@/lib/admin/specs";
import { requireAdmin } from "@/lib/auth";
import { readSettings } from "@/lib/content";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

export default async function SettingsPage({ params }: PageProps<"/admin/konten/[bagian]">) {
  await requireAdmin();
  const { bagian } = await params;
  const section = settingsSections.find((s) => s.slug === bagian);
  if (!section) notFound();
  const value = (await readSettings())[section.key] as unknown;

  return (
    <>
      <PageHead title={section.title} description={section.description} />
      <Panel>
        <AdminForm action={saveSettings.bind(null, section.slug)}>
          {section.fields.map((f) => (
            <SettingField key={f.name ?? "value"} field={f} value={f.name === null ? value : (value as Record<string, unknown>)[f.name]} />
          ))}
        </AdminForm>
      </Panel>
    </>
  );
}

function SettingField({ field, value }: { field: Field; value: unknown }) {
  const name = field.name ?? "value";
  switch (field.type) {
    case "text":
    case "textarea":
      return <TextField name={name} label={field.label} hint={field.hint} defaultValue={String(value ?? "")} multiline={field.type === "textarea"} />;
    case "image":
      return (
        <FieldShell label={field.label} hint={field.hint} htmlFor={`f-${name}`}>
          <ImageInput id={`f-${name}`} name={name} defaultValue={String(value ?? "")} />
        </FieldShell>
      );
    case "lines":
      return (
        <FieldShell label={field.label} hint={field.hint} htmlFor={`f-${name}`}>
          <Textarea
            id={`f-${name}`}
            name={name}
            defaultValue={(value as string[]).join("\n")}
            rows={Math.max(4, (value as string[]).length + 1)}
            className="rounded-md bg-background text-[15px]"
          />
        </FieldShell>
      );
    case "rows":
      return (
        <FieldShell label={field.label} hint={field.hint}>
          <RowsInput name={name} columns={field.columns} defaultValue={value as Record<string, string>[]} fixed={field.fixed} />
        </FieldShell>
      );
  }
}
