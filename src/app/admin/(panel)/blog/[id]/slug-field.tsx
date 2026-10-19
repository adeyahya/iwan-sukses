"use client";

import { useState } from "react";

import { FieldShell, inputClass } from "@/components/admin/fields";
import { Input } from "@/components/ui/input";
import { slugify } from "@/lib/blog";

// Alamat artikel mengikuti judul sampai diubah manual. Untuk artikel lama, alamat dikunci
// supaya link yang sudah dibagikan tidak rusak.
export function SlugField({ title: initialTitle, slug: initialSlug, locked }: { title: string; slug: string; locked: boolean }) {
  const [title, setTitle] = useState(initialTitle);
  const [slug, setSlug] = useState(initialSlug);
  const [touched, setTouched] = useState(locked);
  const shown = touched ? slug : slugify(title);

  return (
    <>
      <FieldShell label="Judul" htmlFor="f-title">
        <Input
          id="f-title"
          name="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Cara merawat shower box kaca"
          className={`${inputClass} h-12 text-lg font-semibold`}
        />
      </FieldShell>
      <FieldShell label="Alamat (slug)" htmlFor="f-slug" hint={locked ? "Mengubah alamat artikel yang sudah dibagikan akan membuat link lama tidak berfungsi." : undefined}>
        <div className="flex items-center rounded-md border border-input bg-background pl-3 focus-within:border-ring">
          <span className="shrink-0 text-sm text-muted-foreground">/blog/</span>
          <Input
            id="f-slug"
            name="slug"
            value={shown}
            onChange={(e) => {
              setTouched(true);
              setSlug(e.target.value);
            }}
            onBlur={() => setSlug(slugify(shown))}
            className={`${inputClass} border-0 pl-0.5 focus-visible:ring-0`}
          />
        </div>
      </FieldShell>
    </>
  );
}
