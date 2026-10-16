import { MessageCircleIcon } from "lucide-react";

import { waLink, whatsapp } from "@/lib/data";

export function WhatsAppFloat() {
  return (
    <a
      href={waLink(whatsapp.probolinggo.number)}
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
