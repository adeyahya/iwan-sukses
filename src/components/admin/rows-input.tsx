"use client";

import { ArrowDownIcon, ArrowUpIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useState } from "react";

import { inputClass } from "@/components/admin/fields";
import { ImageInput } from "@/components/admin/image-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Column } from "@/lib/admin/specs";

type Row = Record<string, string>;

// Daftar baris yang bisa ditambah, dihapus, dan diurutkan; dikirim sebagai JSON di input tersembunyi
export function RowsInput({ name, columns, defaultValue, fixed }: { name: string; columns: Column[]; defaultValue: Row[]; fixed?: boolean }) {
  const [rows, setRows] = useState<Row[]>(defaultValue);
  const empty = () => Object.fromEntries(columns.map((c) => [c.name, ""]));
  const update = (i: number, key: string, v: string) => setRows((r) => r.map((row, j) => (j === i ? { ...row, [key]: v } : row)));
  const move = (i: number, d: number) =>
    setRows((r) => {
      const next = [...r];
      [next[i], next[i + d]] = [next[i + d], next[i]];
      return next;
    });

  return (
    <div className="grid gap-3">
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {rows.map((row, i) => (
        <div key={i} className="grid gap-3 rounded-md border bg-secondary/50 p-3 sm:grid-cols-[1fr_auto]">
          <div className="grid gap-3 sm:grid-cols-2">
            {columns.map((c) => (
              <label key={c.name} className={c.type === "image" || c.type === "textarea" ? "grid gap-1 sm:col-span-2" : "grid gap-1"}>
                <span className="text-xs font-semibold text-muted-foreground">{c.label}</span>
                {c.type === "image" ? (
                  <ImageInput value={row[c.name] ?? ""} onChange={(v) => update(i, c.name, v)} />
                ) : c.type === "textarea" ? (
                  <Textarea value={row[c.name] ?? ""} onChange={(e) => update(i, c.name, e.target.value)} rows={2} className="rounded-md bg-background text-[15px]" />
                ) : (
                  <Input value={row[c.name] ?? ""} onChange={(e) => update(i, c.name, e.target.value)} className={inputClass} />
                )}
              </label>
            ))}
          </div>
          <div className="flex gap-1 sm:flex-col">
            <Button type="button" variant="ghost" size="icon" aria-label="Naikkan" disabled={i === 0} onClick={() => move(i, -1)}>
              <ArrowUpIcon />
            </Button>
            <Button type="button" variant="ghost" size="icon" aria-label="Turunkan" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
              <ArrowDownIcon />
            </Button>
            {!fixed && (
              <Button type="button" variant="ghost" size="icon" aria-label="Hapus baris" onClick={() => setRows((r) => r.filter((_, j) => j !== i))}>
                <Trash2Icon />
              </Button>
            )}
          </div>
        </div>
      ))}
      {!fixed && (
        <div>
          <Button type="button" variant="outline" size="lg" onClick={() => setRows((r) => [...r, empty()])}>
            <PlusIcon />
            Tambah baris
          </Button>
        </div>
      )}
    </div>
  );
}
