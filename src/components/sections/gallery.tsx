"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

import { Container, SectionHead } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { gallery, galleryFilters, unsplash, type GalleryCategory } from "@/lib/data";

type Filter = GalleryCategory | "semua";

export function Gallery() {
  const [filter, setFilter] = useState<Filter>("semua");
  const [current, setCurrent] = useState<number | null>(null);
  const visible = gallery.map((p, i) => ({ ...p, i })).filter((p) => filter === "semua" || p.cat === filter);

  // Kartu produk menautkan ke "#galeri:<kategori>": pasang filter lalu gulir ke galeri
  useEffect(() => {
    const apply = () => {
      const m = location.hash.match(/^#galeri:(\w+)$/);
      if (!m) return;
      if (galleryFilters.some((f) => f.value === m[1])) setFilter(m[1] as Filter);
      document.getElementById("galeri")?.scrollIntoView({ behavior: "smooth" });
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const step = (d: number) => {
    if (current === null) return;
    const order = visible.map((p) => p.i);
    setCurrent(order[(order.indexOf(current) + d + order.length) % order.length]);
  };
  const photo = current !== null ? gallery[current] : null;

  return (
    <section id="galeri" className="bg-secondary py-12 sm:py-24">
      <Container>
        <SectionHead
          overline="Galeri proyek"
          title="Hasil kerja yang bisa Anda lihat"
          lead={
            <>
              Klik foto untuk memperbesar. <span className="text-muted-foreground">(Draft: foto contoh dari Unsplash, nanti diganti foto proyek asli.)</span>
            </>
          }
        />

        <ToggleGroup
          aria-label="Filter galeri"
          value={[filter]}
          onValueChange={(v) => v[0] && setFilter(v[0] as Filter)}
          className="mb-8 w-full flex-wrap"
        >
          {galleryFilters.map((f) => (
            <ToggleGroupItem
              key={f.value}
              value={f.value}
              variant="outline"
              size="lg"
              className="bg-background font-semibold aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground data-[pressed]:border-primary data-[pressed]:bg-primary data-[pressed]:text-primary-foreground"
            >
              {f.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <div className="columns-2 gap-2 sm:columns-3 sm:gap-4 lg:columns-4">
          {visible.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setCurrent(p.i)}
              aria-label={`Perbesar: ${p.title}`}
              className="group relative mb-2 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-lg bg-mist text-left sm:mb-4"
            >
              <Image
                src={unsplash(p.id)}
                alt={p.title}
                width={600}
                height={600}
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="h-auto w-full transition-transform duration-250 ease-linear group-hover:scale-[1.03]"
                style={{ height: "auto" }}
              />
              <span className="absolute bottom-3 left-3 translate-y-1 rounded-sm bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink opacity-0 transition-all duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                {p.title}
              </span>
            </button>
          ))}
        </div>
      </Container>

      <Dialog open={photo !== null} onOpenChange={(o) => !o && setCurrent(null)}>
        <DialogContent
          className="dark max-w-[min(1100px,calc(100vw-2rem))] border-steel bg-ink p-3 text-foreground sm:max-w-[min(1100px,calc(100vw-4rem))]"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") step(-1);
            if (e.key === "ArrowRight") step(1);
          }}
        >
          {photo && (
            <>
              <div className="relative h-[70vh] w-full">
                <Image src={unsplash(photo.id)} alt={photo.title} fill sizes="100vw" className="object-contain" />
              </div>
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button variant="outline" size="icon-lg" onClick={() => step(-1)} aria-label="Sebelumnya">
                  <ChevronLeftIcon />
                </Button>
                <div className="text-center">
                  <DialogTitle className="font-heading font-medium">{photo.title}</DialogTitle>
                  <DialogDescription className="sr-only">Foto galeri proyek</DialogDescription>
                </div>
                <Button variant="outline" size="icon-lg" onClick={() => step(1)} aria-label="Berikutnya">
                  <ChevronRightIcon />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
