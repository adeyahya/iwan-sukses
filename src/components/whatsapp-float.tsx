import { MessageCircleIcon } from "lucide-react";

import { getContent } from "@/lib/content";
import { waLink } from "@/lib/data";

export async function WhatsAppFloat() {
  const store = (await getContent()).stores[0];
  if (!store) return null;
  return (
    <a
      href={waLink(store.number)}
      target="_blank"
      rel="noopener"
      aria-label="Chat WhatsApp"
      className="fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-md border border-steel bg-ink px-4 py-3 text-sm font-semibold text-paper hover:bg-steel"
    >
      <MessageCircleIcon className="size-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
