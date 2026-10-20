"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDict } from "@/i18n/client";
import { waLink, type Store } from "@/lib/data";

const field = "h-11 rounded-md text-[15px]";

// Form membuka WhatsApp toko pilihan dengan pesan yang sudah terisi
// needs: label sesuai bahasa halaman, value Bahasa Indonesia (masuk ke pesan)
export function QuoteForm({ stores: storeList, needs }: { stores: Store[]; needs: { value: string; label: string }[] }) {
  const stores = storeList.map((s) => ({ value: s.number, label: s.label }));
  const [store, setStore] = useState<string>(stores[0]?.value ?? "");
  const [need, setNeed] = useState<string>(needs[0]?.value ?? "");
  const t = useDict().quoteForm;

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // Pesan untuk staf toko, jadi selalu dalam Bahasa Indonesia
    const msg =
      `Halo Iwan Sukses, saya ingin minta penawaran.\n\n` +
      `Nama: ${f.get("nama")}\nLokasi: ${f.get("lokasi") || "-"}\nKebutuhan: ${need}\nDetail: ${f.get("detail") || "-"}`;
    window.open(waLink(store, msg), "_blank", "noopener");
  }

  return (
    <Card className="self-start rounded-lg">
      <CardHeader>
        <CardTitle className="font-heading text-[22px] leading-7">{t.title}</CardTitle>
        <CardDescription>{t.desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="nama">{t.name}</Label>
              <Input id="nama" name="nama" required autoComplete="name" placeholder={t.namePlaceholder} className={field} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lokasi">{t.location}</Label>
              <Input id="lokasi" name="lokasi" placeholder={t.locationPlaceholder} className={field} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label id="toko-label">{t.store}</Label>
            <Select items={stores} value={store} onValueChange={(v) => v && setStore(v)}>
              <SelectTrigger aria-labelledby="toko-label" className={`${field} w-full`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stores.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label id="kebutuhan-label">{t.need}</Label>
            <Select items={needs} value={need} onValueChange={(v) => v && setNeed(v)}>
              <SelectTrigger aria-labelledby="kebutuhan-label" className={`${field} w-full`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {needs.map((n) => (
                  <SelectItem key={n.value} value={n.value}>
                    {n.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="detail">{t.detail}</Label>
            <Textarea
              id="detail"
              name="detail"
              rows={4}
              placeholder={t.detailPlaceholder}
              className="rounded-md text-[15px]"
            />
          </div>
          <Button type="submit" variant="spark" size="xl">
            {t.submit}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
