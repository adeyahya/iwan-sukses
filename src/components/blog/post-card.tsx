import Image from "next/image";
import Link from "next/link";

import { formatDate } from "@/lib/blog";
import type { PostSummary } from "@/lib/content";
import { cn } from "@/lib/utils";

export function PostCard({ post, featured }: { post: PostSummary; featured?: boolean }) {
  return (
    <Link href={`/blog/${post.slug}`} className={cn("group grid content-start gap-4", featured && "md:grid-cols-2 md:items-center md:gap-10")}>
      {post.coverImage && (
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-mist">
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className="object-cover transition-transform duration-250 ease-linear group-hover:scale-[1.03]"
          />
        </div>
      )}
      <div>
        <time dateTime={post.publishedAt?.toISOString()} className="text-sm text-muted-foreground">
          {formatDate(post.publishedAt)}
        </time>
        <h2 className={cn("mt-1 font-bold tracking-[-0.01em] group-hover:underline", featured ? "text-[clamp(24px,3vw,34px)] leading-[1.15]" : "text-xl leading-7")}>
          {post.title}
        </h2>
        {post.excerpt && <p className={cn("mt-2 text-muted-foreground", featured ? "text-lg leading-7" : "text-[15px] leading-6")}>{post.excerpt}</p>}
      </div>
    </Link>
  );
}
