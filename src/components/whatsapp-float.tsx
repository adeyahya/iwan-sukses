import { MessageCircleIcon } from "lucide-react";

import { getDict } from "@/i18n/server";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/data";

export async function WhatsAppFloat() {
  const [{ stores }, t] = await Promise.all([getContent(), getDict()]);
  const store = stores[0];
  if (!store) return null;
  return (
    <a
      href={waLink(store.number)}
      target="_blank"
      rel="noopener"
      aria-label={t.whatsapp}
      className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-md border border-steel bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-steel"
    >
      <MessageCircleIcon className="size-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
