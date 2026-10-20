"use client";

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVerticalIcon } from "lucide-react";
import { createContext, useContext, useId } from "react";

import { cn } from "@/lib/utils";

// Urutkan dengan seret-lepas lewat pegangan (ikon titik-titik). Pegangan memakai touch-action: none,
// jadi di HP bisa langsung diseret tanpa mengganggu gulir halaman. Keyboard: fokus pegangan, Spasi, panah, Spasi.
export function SortableGroup<T extends UniqueIdentifier>({
  ids,
  onReorder,
  grid,
  children,
}: {
  ids: T[];
  onReorder: (ids: T[]) => void;
  grid?: boolean;
  children: React.ReactNode;
}) {
  // id tetap dari React, supaya atribut aria dnd-kit sama di server dan browser (tanpa hydration mismatch)
  const id = useId();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    onReorder(arrayMove(ids, ids.indexOf(active.id as T), ids.indexOf(over.id as T)));
  };
  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        screenReaderInstructions: { draggable: "Tekan Spasi untuk mengangkat, panah untuk memindahkan, Spasi lagi untuk meletakkan, Esc untuk batal." },
      }}
    >
      <SortableContext items={ids} strategy={grid ? rectSortingStrategy : verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

type HandleProps = ReturnType<typeof useSortable>["listeners"] & ReturnType<typeof useSortable>["attributes"];
const HandleContext = createContext<{ props: HandleProps; setRef: (el: HTMLElement | null) => void } | null>(null);

export function SortableItem({
  id,
  className,
  children,
  as: Tag = "li",
}: {
  id: UniqueIdentifier;
  className?: string;
  children: React.ReactNode;
  as?: "li" | "div";
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <HandleContext value={{ props: { ...attributes, ...listeners } as HandleProps, setRef: setActivatorNodeRef }}>
      <Tag
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform), transition }}
        className={cn(className, isDragging && "relative z-10 shadow-lg ring-2 ring-ink")}
      >
        {children}
      </Tag>
    </HandleContext>
  );
}

// Pegangan seret; taruh di dalam SortableItem
export function DragHandle({ label, className }: { label: string; className?: string }) {
  const handle = useContext(HandleContext);
  return (
    <button
      type="button"
      ref={handle?.setRef}
      {...handle?.props}
      aria-label={`Seret untuk memindahkan ${label}`}
      title="Seret untuk mengubah urutan"
      className={cn(
        "flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing",
        className,
      )}
    >
      <GripVerticalIcon className="size-5" />
    </button>
  );
}
