import { eq } from "drizzle-orm";

import { db } from "@/db";
import { media } from "@/db/schema";

// Foto yang diunggah dari admin. Id acak dan isi file tidak pernah berubah, jadi boleh di-cache selamanya.
export async function GET(_: Request, ctx: RouteContext<"/media/[id]">) {
  const { id } = await ctx.params;
  const [file] = await db.select({ mime: media.mime, data: media.data }).from(media).where(eq(media.id, id));
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
