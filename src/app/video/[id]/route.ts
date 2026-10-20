import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { videoChunks, videos } from "@/db/schema";
import { VIDEO_CHUNK } from "@/lib/video";

// Video yang diunggah dari admin. Browser meminta video sepotong-sepotong (HTTP Range; Safari tidak
// mau memutar tanpanya), jadi hanya potongan 4 MB yang tercakup yang dibaca dari database.
export async function GET(request: Request, ctx: RouteContext<"/video/[id]">) {
  return serve(request, (await ctx.params).id, true);
}

export async function HEAD(request: Request, ctx: RouteContext<"/video/[id]">) {
  return serve(request, (await ctx.params).id, false);
}

async function serve(request: Request, id: string, withBody: boolean) {
  const [video] = await db.select({ mime: videos.mime, size: videos.size }).from(videos).where(and(eq(videos.id, id), eq(videos.done, true)));
  if (!video) return new Response("Not found", { status: 404 });
  const { size } = video;
  const headers = new Headers({
    "Content-Type": video.mime,
    "Accept-Ranges": "bytes",
    // Id acak dan isi video tidak pernah berubah
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  });

  const range = parseRange(request.headers.get("range"), size);
  if (range === "invalid") {
    headers.set("Content-Range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  const [start, end] = range ?? [0, size - 1];
  headers.set("Content-Length", String(end - start + 1));
  if (range) headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  const status = range ? 206 : 200;
  if (!withBody) return new Response(null, { status, headers });
  return new Response(chunkStream(id, start, end), { status, headers });
}

// "bytes=a-b", "bytes=a-", atau "bytes=-n" (n byte terakhir). Tanpa Range atau beberapa range
// sekaligus: kirim seluruh video (null). Range di luar ukuran video: "invalid" (416).
function parseRange(header: string | null, size: number): [number, number] | null | "invalid" {
  const m = header?.match(/^bytes=(\d*)-(\d*)$/);
  if (!m) return null;
  const [, a, b] = m;
  if (!a && !b) return "invalid";
  let start: number;
  let end: number;
  if (!a) {
    start = Math.max(0, size - Number(b));
    end = size - 1;
  } else {
    start = Number(a);
    end = b ? Math.min(Number(b), size - 1) : size - 1;
  }
  if (start >= size || start > end) return "invalid";
  return [start, end];
}

// Baca potongan satu per satu, hanya saat browser siap menerima data berikutnya
function chunkStream(id: string, start: number, end: number) {
  let idx = Math.floor(start / VIDEO_CHUNK);
  const last = Math.floor(end / VIDEO_CHUNK);
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      const [chunk] = await db
        .select({ data: videoChunks.data })
        .from(videoChunks)
        .where(and(eq(videoChunks.videoId, id), eq(videoChunks.idx, idx)));
      if (!chunk) return controller.error(new Error(`Potongan video ${id}#${idx} hilang`));
      const offset = idx * VIDEO_CHUNK;
      const from = Math.max(start - offset, 0);
      const to = Math.min(end - offset + 1, chunk.data.length);
      controller.enqueue(new Uint8Array(chunk.data.subarray(from, to)));
      if (idx++ === last) controller.close();
    },
  });
}
