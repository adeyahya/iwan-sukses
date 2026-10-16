"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { quoteOptions, waLink, whatsapp } from "@/lib/data";

const stores = [whatsapp.probolinggo, whatsapp.bali].map((s) => ({ value: s.number, label: s.label }));
const needs = quoteOptions.map((o) => ({ value: o, label: o }));

const field = "h-11 rounded-md text-[15px]";

// Form membuka WhatsApp toko pilihan dengan pesan yang sudah terisi
export function QuoteForm() {
  const [store, setStore] = useState<string>(stores[0].value);
  const [need, setNeed] = useState<string>(needs[0].value);

  function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const msg =
      `Halo Iwan Sukses, saya ingin minta penawaran.\n\n` +
      `Nama: ${f.get("nama")}\nLokasi: ${f.get("lokasi") || "-"}\nKebutuhan: ${need}\nDetail: ${f.get("detail") || "-"}`;
    window.open(waLink(store, msg), "_blank", "noopener");
  }

  return (
    <Card className="self-start rounded-lg">
      <CardHeader>
        <CardTitle className="font-heading text-[22px] leading-7">Form permintaan penawaran</CardTitle>
        <CardDescription>Form ini membuka WhatsApp dengan pesan yang sudah terisi.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="nama">Nama</Label>
              <Input id="nama" name="nama" required autoComplete="name" placeholder="Nama Anda" className={field} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lokasi">Lokasi</Label>
              <Input id="lokasi" name="lokasi" placeholder="Kecamatan / kota" className={field} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label id="toko-label">Kirim ke toko</Label>
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
            <Label id="kebutuhan-label">Kebutuhan</Label>
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
            <Label htmlFor="detail">Detail</Label>
            <Textarea
              id="detail"
              name="detail"
              rows={4}
              placeholder="Contoh: Shower box tempered 10 mm, 90 × 200 cm, pasang di Probolinggo kota"
              className="rounded-md text-[15px]"
            />
          </div>
          <Button type="submit" variant="spark" size="xl">
            Kirim lewat WhatsApp
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
