import { desc } from "drizzle-orm";
import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHead } from "@/app/admin/(panel)/page-head";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { localePath } from "@/i18n/config";
import { previewSrc } from "@/lib/admin/preview";
import { requireAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/blog";

// Halaman admin selalu dirender per permintaan (sesi + database)
export const instant = false;

export const metadata: Metadata = { title: "Blog" };

export default async function BlogAdmin() {
  await requireAdmin();
  const rows = await db
    .select({ id: posts.id, title: posts.title, slug: posts.slug, locale: posts.locale, status: posts.status, publishedAt: posts.publishedAt, updatedAt: posts.updatedAt, coverImage: posts.coverImage })
    .from(posts)
    .orderBy(desc(posts.updatedAt));
  return (
    <>
      <PageHead
        title="Blog"
        description="Artikel di /blog. Draf hanya terlihat di sini sampai diterbitkan."
        action={
          <Link href="/admin/blog/baru" className={buttonVariants({ size: "xl" })}>
            <PlusIcon />
            Tulis artikel
          </Link>
        }
      />
      {rows.length === 0 ? (
        <p className="rounded-lg border bg-background p-6 text-sm text-muted-foreground">Belum ada artikel.</p>
      ) : (
        <ul className="divide-y rounded-lg border bg-background">
          {rows.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/blog/${p.id}`} className="flex items-center gap-3 p-3 hover:bg-secondary/60">
                {p.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewSrc(p.coverImage)} alt="" className="size-14 shrink-0 rounded-md bg-mist object-cover" />
                ) : (
                  <span className="size-14 shrink-0 rounded-md bg-mist" />
                )}
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-sm">{p.title}</b>
                  <span className="block truncate text-xs text-muted-foreground">
                    {localePath(p.locale, `/blog/${p.slug}`)} · {p.status === "published" ? `terbit ${formatDate(p.publishedAt)}` : `diubah ${formatDate(p.updatedAt)}`}
                  </span>
                </span>
                <Badge variant={p.status === "published" ? "default" : "secondary"} className="rounded-sm">
                  {p.status === "published" ? "Terbit" : "Draf"}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
