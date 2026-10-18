"use client";

import { ArrowDownIcon, ArrowUpIcon, EyeIcon, EyeOffIcon, Trash2Icon } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deleteRow, moveRow, toggleRow } from "@/lib/admin/actions";

type Table = Parameters<typeof moveRow>[0];

// Tombol urut, tampil/sembunyi, dan hapus di daftar produk/galeri/lokasi
export function RowActions({ table, id, enabled, first, last, label }: { table: Table; id: number; enabled: boolean; first: boolean; last: boolean; label: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex shrink-0 gap-1" aria-busy={pending}>
      <Button variant="ghost" size="icon" aria-label={`Naikkan ${label}`} disabled={pending || first} onClick={() => start(() => moveRow(table, id, "up"))}>
        <ArrowUpIcon />
      </Button>
      <Button variant="ghost" size="icon" aria-label={`Turunkan ${label}`} disabled={pending || last} onClick={() => start(() => moveRow(table, id, "down"))}>
        <ArrowDownIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={enabled ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
        title={enabled ? "Sembunyikan dari situs" : "Tampilkan di situs"}
        disabled={pending}
        onClick={() => start(() => toggleRow(table, id, !enabled))}
      >
        {enabled ? <EyeIcon /> : <EyeOffIcon />}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Hapus ${label}`}
        disabled={pending}
        onClick={() => {
          if (confirm(`Hapus "${label}"? Tindakan ini tidak bisa dibatalkan.`)) start(() => deleteRow(table, id));
        }}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
}
