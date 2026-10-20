"use client";

import { useOptimistic, useTransition } from "react";

import { SortableGroup, SortableItem } from "@/components/admin/sortable";
import { reorderRows } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

type Table = Parameters<typeof reorderRows>[0];

// Daftar produk/galeri/lokasi yang bisa diurutkan dengan seret-lepas; urutan langsung tersimpan.
// Isi tiap baris dirender di server (boleh berisi DragHandle dan tombol lain).
export function SortableTable({
  table,
  items,
  grid,
  className,
  itemClassName,
}: {
  table: Table;
  items: { id: number; content: React.ReactNode; className?: string }[];
  grid?: boolean;
  className?: string;
  itemClassName?: string;
}) {
  const [, start] = useTransition();
  const [order, setOrder] = useOptimistic(items.map((i) => i.id));
  const byId = new Map(items.map((i) => [i.id, i]));
  return (
    <SortableGroup
      ids={order}
      grid={grid}
      onReorder={(ids) =>
        start(async () => {
          setOrder(ids);
          await reorderRows(table, ids);
        })
      }
    >
      <ul className={className}>
        {order.map((id) => {
          const item = byId.get(id);
          return (
            item && (
              <SortableItem key={id} id={id} className={cn(itemClassName, item.className)}>
                {item.content}
              </SortableItem>
            )
          );
        })}
      </ul>
    </SortableGroup>
  );
}
