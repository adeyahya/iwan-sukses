"use client";

import { CheckIcon, TriangleAlertIcon } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import type { FormState } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

// Form admin: kirim lewat server action, tampilkan status simpan di bawah tombol
export function AdminForm({
  action,
  children,
  submitLabel = "Simpan",
  className,
}: {
  action: (state: FormState, form: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  return (
    <form action={formAction} className={cn("grid gap-5", className)}>
      {children}
      <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="submit" size="xl" disabled={pending}>
          {pending ? "Menyimpan…" : submitLabel}
        </Button>
        {state && !pending && (
          <p role="status" className={cn("flex items-center gap-2 text-sm", state.ok ? "text-emerald-700" : "text-destructive")}>
            {state.ok ? <CheckIcon className="size-4" /> : <TriangleAlertIcon className="size-4" />}
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
