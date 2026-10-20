// Utilitas blog yang aman dipakai di server maupun browser: tipe dokumen Tiptap, slug, dan pembersih isi.

import type { Lang } from "@/i18n/config";

// Bentuk dokumen Tiptap (ProseMirror JSON)
export type DocMark = { type: string; attrs?: Record<string, unknown> };
export type DocNode = { type: string; attrs?: Record<string, unknown>; content?: DocNode[]; marks?: DocMark[]; text?: string };

export const emptyDoc: DocNode = { type: "doc", content: [{ type: "paragraph" }] };

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const NODES = new Set([
  "doc",
  "paragraph",
  "text",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "hardBreak",
  "image",
]);
const MARKS = new Set(["bold", "italic", "underline", "strike", "code", "link"]);

// Hanya link http(s), mailto, tel, wa.me, atau tautan di situs sendiri
export const safeHref = (href: unknown) => {
  const h = String(href ?? "").trim();
  return /^(https?:\/\/|mailto:|tel:|\/|#)/i.test(h) ? h : "";
};

export const safeSrc = (src: unknown) => {
  const s = String(src ?? "").trim();
  return /^(https:\/\/|\/)/i.test(s) && !s.startsWith("//") ? s : "";
};

// Buang node/mark yang tidak dikenal dan atribut berbahaya sebelum disimpan
export function cleanDoc(node: DocNode): DocNode | null {
  if (!node || typeof node !== "object" || !NODES.has(node.type)) return null;
  const out: DocNode = { type: node.type };
  if (node.type === "text") {
    if (typeof node.text !== "string" || !node.text) return null;
    out.text = node.text;
    const marks = (node.marks ?? []).flatMap((m): DocMark[] => {
      if (!MARKS.has(m?.type)) return [];
      if (m.type !== "link") return [{ type: m.type }];
      const href = safeHref(m.attrs?.href);
      return href ? [{ type: "link", attrs: { href } }] : [];
    });
    if (marks.length) out.marks = marks;
    return out;
  }
  if (node.type === "heading") out.attrs = { level: [2, 3, 4].includes(Number(node.attrs?.level)) ? Number(node.attrs?.level) : 2 };
  if (node.type === "orderedList" && Number(node.attrs?.start) > 1) out.attrs = { start: Number(node.attrs?.start) };
  if (node.type === "image") {
    const src = safeSrc(node.attrs?.src);
    if (!src) return null;
    out.attrs = { src, alt: String(node.attrs?.alt ?? ""), title: String(node.attrs?.title ?? "") };
    return out;
  }
  if (Array.isArray(node.content)) {
    const children = node.content.map(cleanDoc).filter((c): c is DocNode => c !== null);
    // Paragraf kosong di akhir artikel (sisa editor) tidak perlu disimpan
    if (node.type === "doc") while (children.length && children.at(-1)!.type === "paragraph" && !children.at(-1)!.content) children.pop();
    if (children.length) out.content = children;
  }
  return out;
}

// Ringkasan otomatis: kalimat dari paragraf-paragraf awal, maksimal ±160 karakter
export function autoExcerpt(doc: DocNode) {
  const text = (doc.content ?? [])
    .filter((n) => n.type === "paragraph")
    .map((n) => docText(n).trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");
  return text.length > 160 ? `${text.slice(0, 157).replace(/\s+\S*$/, "")}…` : text;
}

// Teks polos dari dokumen, untuk ringkasan otomatis dan perkiraan waktu baca
export function docText(node: DocNode): string {
  if (node.type === "text") return node.text ?? "";
  const inner = (node.content ?? []).map(docText).join(node.type === "doc" ? "\n" : "");
  return ["paragraph", "heading", "listItem", "blockquote"].includes(node.type) ? `${inner} ` : inner;
}

export const readingMinutes = (doc: DocNode) => Math.max(1, Math.round(docText(doc).split(/\s+/).filter(Boolean).length / 200));

export const formatDate = (d: Date | null, lang: Lang = "id") =>
  d ? new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(d) : "";
