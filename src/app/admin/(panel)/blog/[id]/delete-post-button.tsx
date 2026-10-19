"use client";

import { Trash2Icon } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { deletePost } from "@/lib/admin/actions";

export function DeletePostButton({ id, title }: { id: number; title: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="destructive"
      size="lg"
      disabled={pending}
      onClick={() => {
        if (confirm(`Hapus artikel "${title}"? Tindakan ini tidak bisa dibatalkan.`)) start(() => deletePost(id));
      }}
    >
      <Trash2Icon />
      Hapus artikel
    </Button>
  );
}
