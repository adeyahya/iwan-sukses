import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PostBody } from "@/components/blog/post-body";
import { PostCard } from "@/components/blog/post-card";
import { Container } from "@/components/section";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { buttonVariants } from "@/components/ui/button";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { defaultLang, hasLang, localePath, ogLocales } from "@/i18n/config";
import { getDict, getLang } from "@/i18n/server";
import { formatDate, readingMinutes } from "@/lib/blog";
import { getContent, getPost, getPublishedPosts } from "@/lib/content";
import imageLoader from "@/lib/image-loader";
import { siteName, siteUrl } from "@/lib/site";

// Artikel yang terbit setelah build dirender saat pertama dibuka lalu disimpan.
// Cache Components butuh minimal satu param; tanpa artikel pakai placeholder yang menghasilkan 404.
// Per bahasa hanya artikel yang tampil di daftarnya, jadi artikel English tidak dirender di /blog/...
export async function generateStaticParams({ params }: { params: { lang: string } }) {
  const posts = await getPublishedPosts(hasLang(params.lang) ? params.lang : undefined);
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__kosong__" }];
}

const absolute = (src: string) => (src.startsWith("http") ? src : `${siteUrl}${imageLoader({ src, width: 1600 })}`);

export async function generateMetadata({ params }: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = await getPost(slug);
  if (!post || !hasLang(lang)) return {};
  // Artikel hanya ada dalam satu bahasa (post.locale): canonical selalu URL bahasa itu, jadi artikel
  // Indonesia yang dibuka lewat /en menunjuk ke /blog/..., dan tidak ada hreflang ke bahasa lain
  const url = localePath(post.locale, `/blog/${post.slug}`);
  const images = post.coverImage ? [{ url: absolute(post.coverImage), alt: post.coverAlt }] : undefined;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: { type: "article", url, locale: ogLocales[post.locale], title: post.title, description: post.excerpt, publishedTime: post.publishedAt?.toISOString(), images },
    twitter: { title: post.title, description: post.excerpt, images },
  };
}

export default async function PostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();
  const lang = await getLang();
  // Artikel English tidak tampil di versi Indonesia
  if (lang === defaultLang && post.locale !== defaultLang) redirect(localePath(post.locale, `/blog/${post.slug}`));
  const [others, { settings }, { blog: t }] = await Promise.all([getPublishedPosts(lang), getContent(lang), getDict()]);
  const more = others.filter((p) => p.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverImage ? absolute(post.coverImage) : undefined,
    url: `${siteUrl}${localePath(post.locale, `/blog/${post.slug}`)}`,
    inLanguage: post.locale,
    publisher: { "@type": "Organization", name: settings.company.legalName, alternateName: siteName, "@id": `${siteUrl}/#organization` },
  };

  return (
    <>
      <SiteHeader />
      <main className="pt-8 pb-16 sm:pt-12 sm:pb-24">
        <article>
          <Container className="max-w-[820px]">
            <Link href={localePath(lang, "/blog")} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
              <ArrowLeftIcon className="size-4" />
              {t.all}
            </Link>
            <h1 lang={post.locale} className="text-[clamp(30px,4.6vw,48px)] leading-[1.1] font-bold tracking-[-0.02em]">
              {post.title}
            </h1>
            <p className="mt-4 text-sm text-muted-foreground">
              <time dateTime={post.publishedAt?.toISOString()}>{formatDate(post.publishedAt, lang)}</time> · {t.minutes(readingMinutes(post.content))}
              {post.locale !== lang && t.articleLanguageNote && <> · {t.articleLanguageNote}</>}
            </p>
          </Container>
          {post.coverImage && (
            <Container className="mt-8 max-w-[1080px] sm:mt-10">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-mist">
                <Image src={post.coverImage} alt={post.coverAlt} fill priority sizes="(min-width: 1080px) 1080px, 100vw" className="object-cover" />
              </div>
            </Container>
          )}
          <Container className="mt-10 max-w-[720px] sm:mt-12">
            <div lang={post.locale}>
              <PostBody doc={post.content} />
            </div>
            <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-secondary p-6">
              <p className="font-heading text-lg font-bold">{t.ctaTitle}</p>
              <Link href={localePath(lang, "/#kontak")} className={buttonVariants({ variant: "spark", size: "xl" })}>
                {t.cta}
              </Link>
            </div>
          </Container>
        </article>
        {more.length > 0 && (
          <Container className="mt-16 border-t pt-12 sm:mt-20">
            <h2 className="mb-8 text-2xl font-bold">{t.more}</h2>
            <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {more.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </Container>
        )}
      </main>
      <SiteFooter />
      <WhatsAppFloat />
      <script
        type="application/ld+json"
        // Escape "<" agar isi JSON tidak bisa menutup tag script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
