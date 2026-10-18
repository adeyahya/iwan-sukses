import type { Metadata } from "next";

import { Panel, PageHead } from "@/app/admin/(panel)/page-head";
import { AdminForm } from "@/components/admin/admin-form";
import { inputClass } from "@/components/admin/fields";
import { Input } from "@/components/ui/input";
import { savePrices } from "@/lib/admin/actions";
import { priceForms, type PriceGroup } from "@/lib/admin/specs";
import { requireAdmin } from "@/lib/auth";
import { readSettings } from "@/lib/content";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

export const metadata: Metadata = { title: "Harga konfigurator" };

const get = (obj: unknown, path: string) => path.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj);

const unitLabel: Record<PriceGroup["unit"], string> = { rp: "Rp", factor: "×", m2: "m²" };

export default async function PricesPage() {
  await requireAdmin();
  const settings = await readSettings();
  return (
    <>
      <PageHead
        title="Harga konfigurator"
        description="Harga dasar untuk estimasi di konfigurator 3D. Situs menampilkan rentang ±10% dari hasil hitungan (kecuali kaca potong)."
      />
      <div className="grid gap-6">
        {priceForms.map((form) => {
          const prices = settings[form.key];
          return (
            <Panel key={form.key}>
              <h2 className="font-heading text-lg font-bold">{form.title}</h2>
              <p className="mb-5 text-sm text-muted-foreground">{form.description}</p>
              <AdminForm action={savePrices.bind(null, form.key)} submitLabel={`Simpan harga ${form.title.toLowerCase()}`}>
                {form.groups.map((g) => (
                  <fieldset key={g.path} className="grid gap-2">
                    <legend className="mb-2 text-sm font-semibold">{g.label}</legend>
                    <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
                      {(g.options ?? [{ value: "", label: "" }]).map((o) => {
                        const path = o.label ? `${g.path}.${o.value}` : g.path;
                        return (
                          <label key={path} className="grid gap-1">
                            {o.label && <span className="text-xs text-muted-foreground">{o.label}</span>}
                            <span className="flex items-center gap-2">
                              <span className="w-6 shrink-0 text-xs font-semibold text-muted-foreground">{unitLabel[g.unit]}</span>
                              <Input
                                name={`p:${path}`}
                                type="number"
                                min={0}
                                step="any"
                                required
                                defaultValue={String(get(prices, path) ?? 0)}
                                className={`${inputClass} tabular-nums`}
                              />
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    {g.hint && <p className="text-xs text-muted-foreground">{g.hint}</p>}
                  </fieldset>
                ))}
              </AdminForm>
            </Panel>
          );
        })}
      </div>
    </>
  );
}
