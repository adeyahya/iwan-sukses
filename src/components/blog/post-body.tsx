import { Fragment } from "react";

import { safeHref, safeSrc, type DocMark, type DocNode } from "@/lib/blog";
import imageLoader from "@/lib/image-loader";

// Merender dokumen Tiptap sebagai elemen React. Teks selalu di-escape oleh React dan
// link/foto diperiksa lagi, jadi isi dari editor tidak bisa menyisipkan HTML atau skrip.
export function PostBody({ doc }: { doc: DocNode }) {
  return <div className="prose-blog">{renderChildren(doc)}</div>;
}

const renderChildren = (node: DocNode) => (node.content ?? []).map((child, i) => <Fragment key={i}>{renderNode(child)}</Fragment>);

function renderNode(node: DocNode): React.ReactNode {
  const children = renderChildren(node);
  switch (node.type) {
    case "text":
      return (node.marks ?? []).reduce<React.ReactNode>((acc, mark) => wrapMark(mark, acc), node.text);
    case "paragraph":
      return <p>{children}</p>;
    case "heading":
      return node.attrs?.level === 3 ? <h3>{children}</h3> : node.attrs?.level === 4 ? <h4>{children}</h4> : <h2>{children}</h2>;
    case "bulletList":
      return <ul>{children}</ul>;
    case "orderedList":
      return <ol start={Number(node.attrs?.start) || undefined}>{children}</ol>;
    case "listItem":
      return <li>{children}</li>;
    case "blockquote":
      return <blockquote>{children}</blockquote>;
    case "codeBlock":
      return (
        <pre>
          <code>{children}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr />;
    case "hardBreak":
      return <br />;
    case "image": {
      const src = safeSrc(node.attrs?.src);
      if (!src) return null;
      const alt = String(node.attrs?.alt ?? "");
      return (
        // Ukuran foto artikel tidak disimpan, jadi pakai <img> biasa dengan lazy loading
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageLoader({ src, width: 1600 })} alt={alt} loading="lazy" decoding="async" />
      );
    }
    default:
      return children;
  }
}

function wrapMark(mark: DocMark, inner: React.ReactNode): React.ReactNode {
  switch (mark.type) {
    case "bold":
      return <strong>{inner}</strong>;
    case "italic":
      return <em>{inner}</em>;
    case "underline":
      return <u>{inner}</u>;
    case "strike":
      return <s>{inner}</s>;
    case "code":
      return <code>{inner}</code>;
    case "link": {
      const href = safeHref(mark.attrs?.href);
      if (!href) return inner;
      const external = /^https?:\/\//i.test(href);
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
          {inner}
        </a>
      );
    }
    default:
      return inner;
  }
}
