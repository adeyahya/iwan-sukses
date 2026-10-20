"use client";

import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useRef, useState } from "react";

import { inputClass } from "@/components/admin/fields";
import { ImageInput } from "@/components/admin/image-input";
import { DragHandle, SortableGroup, SortableItem } from "@/components/admin/sortable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Column } from "@/lib/admin/specs";

type Row = Record<string, string>;
// Kunci tetap per baris, supaya seret-lepas dan isian tidak tertukar saat urutan berubah
type Keyed = { key: number; row: Row };

// Daftar baris yang bisa ditambah, dihapus, dan diurutkan; dikirim sebagai JSON di input tersembunyi
export function RowsInput({ name, columns, defaultValue, fixed }: { name: string; columns: Column[]; defaultValue: Row[]; fixed?: boolean }) {
  const nextKey = useRef(defaultValue.length);
  const [rows, setRows] = useState<Keyed[]>(() => defaultValue.map((row, key) => ({ key, row })));
  const empty = () => Object.fromEntries(columns.map((c) => [c.name, ""]));
  const update = (key: number, col: string, v: string) => setRows((r) => r.map((x) => (x.key === key ? { key, row: { ...x.row, [col]: v } } : x)));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const next = [...r];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={JSON.stringify(rows.map((x) => x.row))} />
      <SortableGroup ids={rows.map((x) => x.key)} onReorder={(keys) => setRows((r) => keys.map((k) => r.find((x) => x.key === k)!))}>
        {rows.map(({ key, row }, i) => (
          <SortableItem as="div" key={key} id={key} className="grid gap-3 rounded-md border bg-secondary p-3 sm:grid-cols-[auto_1fr_auto]">
            <DragHandle label={`baris ${i + 1}`} className="hidden sm:flex" />
            <div className="grid gap-3 sm:grid-cols-2">
              {columns.map((c) => (
                <label key={c.name} className={c.type === "image" || c.type === "textarea" ? "grid gap-1 sm:col-span-2" : "grid gap-1"}>
                  <span className="text-xs font-semibold text-muted-foreground">{c.label}</span>
                  {c.type === "image" ? (
                    <ImageInput value={row[c.name] ?? ""} onChange={(v) => update(key, c.name, v)} />
                  ) : c.type === "textarea" ? (
                    <Textarea
                      value={row[c.name] ?? ""}
                      onChange={(e) => update(key, c.name, e.target.value)}
                      rows={2}
                      className="rounded-md bg-background text-[15px]"
                    />
                  ) : (
                    <Input value={row[c.name] ?? ""} onChange={(e) => update(key, c.name, e.target.value)} className={inputClass} />
                  )}
                </label>
              ))}
            </div>
            <div className="flex gap-1 sm:flex-col">
              <DragHandle label={`baris ${i + 1}`} className="sm:hidden" />
              <Button type="button" variant="ghost" size="icon" aria-label="Naikkan" disabled={i === 0} onClick={() => move(i, -1)}>
                <ArrowUpIcon />
              </Button>
              <Button type="button" variant="ghost" size="icon" aria-label="Turunkan" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                <ArrowDownIcon />
              </Button>
              {!fixed && (
                <Button type="button" variant="ghost" size="icon" aria-label="Hapus baris" onClick={() => setRows((r) => r.filter((x) => x.key !== key))}>
                  <Trash2Icon />
                </Button>
              )}
            </div>
          </SortableItem>
        ))}
      </SortableGroup>
      {!fixed && (
        <div>
          <Button type="button" variant="outline" size="lg" onClick={() => setRows((r) => [...r, { key: nextKey.current++, row: empty() }])}>
            <PlusIcon />
            Tambah baris
          </Button>
        </div>
      )}
    </div>
  );
}
