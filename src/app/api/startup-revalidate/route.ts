import { revalidateTag } from "next/cache";

import { contentTag, postsTag } from "@/lib/content";
import { takeStartupToken } from "@/lib/startup";

// Dipanggil sekali oleh server sendiri saat start (src/lib/startup.ts), tidak untuk publik
export async function POST(req: Request) {
  if (!takeStartupToken(req.headers.get("x-startup-token"))) return new Response(null, { status: 404 });
  revalidateTag(contentTag, { expire: 0 });
  revalidateTag(postsTag, { expire: 0 });
  return new Response(null, { status: 204 });
}
