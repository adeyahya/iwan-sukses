"use client";

import { CheckIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react";
import { useActionState, useTransition } from "react";

import { inputClass } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteInvite, deleteUser, inviteAdmin } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteAdmin, null);
  return (
    <div className="grid gap-4">
      <form action={action} className="flex flex-wrap items-end gap-3">
        <div className="grid min-w-[240px] flex-1 gap-2">
          <Label htmlFor="invite-email" className="font-semibold">
            Email Google
          </Label>
          <Input id="invite-email" name="email" type="email" required placeholder="nama@gmail.com" className={inputClass} />
        </div>
        <Button type="submit" size="xl" disabled={pending}>
          {pending ? "Mengundang…" : "Undang"}
        </Button>
      </form>
      {state && !pending && (
        <p role="status" className={cn("flex items-center gap-2 text-sm", state.ok ? "text-emerald-700" : "text-destructive")}>
          {state.ok ? <CheckIcon className="size-4 shrink-0" /> : <TriangleAlertIcon className="size-4 shrink-0" />}
          {state.message}
        </p>
      )}
    </div>
  );
}

export function DeleteUserButton({ id, name }: { id: number; name: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Hapus ${name}`}
      disabled={pending}
      onClick={() => {
        if (confirm(`Hapus akun "${name}"? Orang ini tidak bisa masuk lagi.`)) start(() => deleteUser(id));
      }}
    >
      <Trash2Icon />
    </Button>
  );
}

export function DeleteInviteButton({ id, email }: { id: number; email: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Batalkan undangan ${email}`}
      title="Batalkan undangan"
      disabled={pending}
      onClick={() => {
        if (confirm(`Batalkan undangan untuk ${email}? Email ini tidak bisa masuk lagi.`)) start(() => deleteInvite(id));
      }}
    >
      <Trash2Icon />
    </Button>
  );
}
