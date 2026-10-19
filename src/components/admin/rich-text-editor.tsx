"use client";

import { Image } from "@tiptap/extension-image";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import {
  BoldIcon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  LoaderIcon,
  MinusIcon,
  QuoteIcon,
  Redo2Icon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
  UnlinkIcon,
} from "lucide-react";
import { useRef, useState } from "react";

import { uploadPhoto } from "@/components/admin/image-input";
import { type DocNode } from "@/lib/blog";
import { cn } from "@/lib/utils";

// Editor artikel (Tiptap). Isi dikirim ke server sebagai JSON di input tersembunyi;
// server membersihkannya lagi sebelum disimpan (cleanDoc di src/lib/blog.ts).
export function RichTextEditor({ name, defaultValue }: { name: string; defaultValue: DocNode }) {
  const [json, setJson] = useState(() => JSON.stringify(defaultValue));
  const editor = useEditor({
    // Dirender di browser saja, supaya tidak ada selisih hidrasi
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder: "Mulai menulis artikel… Ketik di sini, lalu pakai tombol di atas untuk judul, daftar, atau foto." }),
      CharacterCount,
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: "prose-blog min-h-[420px] px-4 py-4 outline-none sm:px-6", "aria-label": "Isi artikel" },
    },
    onUpdate: ({ editor }) => setJson(JSON.stringify(editor.getJSON())),
  });

  return (
    <div className="overflow-hidden rounded-md border border-input bg-background focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
      <input type="hidden" name={name} value={json} />
      {editor ? <Toolbar editor={editor} /> : <div className="h-[49px] border-b bg-secondary" />}
      <EditorContent editor={editor} />
      {editor && <WordCount editor={editor} />}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  // Hanya render ulang toolbar saat status tombol berubah
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  function setLink() {
    const current = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Alamat link (mis. https://… atau /konfigurator)", current ?? "https://");
    if (url === null) return;
    if (!url.trim() || url.trim() === "https://") chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }

  async function addImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await uploadPhoto(file);
      if ("error" in res) setError(res.error);
      else chain().setImage({ src: res.src, alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") }).run();
    } catch {
      setError("Gagal mengunggah foto.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="sticky top-0 z-10 border-b bg-secondary">
      <div role="toolbar" aria-label="Format teks" className="flex flex-wrap items-center gap-0.5 p-1.5">
        <Tool label="Judul bagian" active={s.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}>
          <Heading2Icon />
        </Tool>
        <Tool label="Sub-judul" active={s.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}>
          <Heading3Icon />
        </Tool>
        <Sep />
        <Tool label="Tebal" shortcut="Ctrl+B" active={s.bold} onClick={() => chain().toggleBold().run()}>
          <BoldIcon />
        </Tool>
        <Tool label="Miring" shortcut="Ctrl+I" active={s.italic} onClick={() => chain().toggleItalic().run()}>
          <ItalicIcon />
        </Tool>
        <Tool label="Garis bawah" shortcut="Ctrl+U" active={s.underline} onClick={() => chain().toggleUnderline().run()}>
          <UnderlineIcon />
        </Tool>
        <Tool label="Coret" active={s.strike} onClick={() => chain().toggleStrike().run()}>
          <StrikethroughIcon />
        </Tool>
        <Sep />
        <Tool label="Daftar berpoin" active={s.bullet} onClick={() => chain().toggleBulletList().run()}>
          <ListIcon />
        </Tool>
        <Tool label="Daftar bernomor" active={s.ordered} onClick={() => chain().toggleOrderedList().run()}>
          <ListOrderedIcon />
        </Tool>
        <Tool label="Kutipan" active={s.quote} onClick={() => chain().toggleBlockquote().run()}>
          <QuoteIcon />
        </Tool>
        <Tool label="Garis pemisah" onClick={() => chain().setHorizontalRule().run()}>
          <MinusIcon />
        </Tool>
        <Sep />
        <Tool label={s.link ? "Ubah link" : "Tambah link"} active={s.link} onClick={setLink}>
          <LinkIcon />
        </Tool>
        {s.link && (
          <Tool label="Hapus link" onClick={() => chain().extendMarkRange("link").unsetLink().run()}>
            <UnlinkIcon />
          </Tool>
        )}
        <Tool label="Sisipkan foto" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <LoaderIcon className="animate-spin" /> : <ImageIcon />}
        </Tool>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => addImage(e.target.files?.[0])} />
        <span className="flex-1" />
        <Tool label="Batalkan" shortcut="Ctrl+Z" disabled={!s.canUndo} onClick={() => chain().undo().run()}>
          <Undo2Icon />
        </Tool>
        <Tool label="Ulangi" shortcut="Ctrl+Shift+Z" disabled={!s.canRedo} onClick={() => chain().redo().run()}>
          <Redo2Icon />
        </Tool>
      </div>
      {error && <p className="px-3 pb-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Tool({
  label,
  shortcut,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={shortcut ? `${label} (${shortcut})` : label}
      disabled={disabled}
      // Jangan ambil fokus dari editor saat tombol diklik
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground disabled:pointer-events-none disabled:opacity-40 [&_svg]:size-[18px]",
        active && "bg-ink text-paper hover:bg-ink hover:text-paper",
      )}
    >
      {children}
    </button>
  );
}

const Sep = () => <span aria-hidden className="mx-1 h-6 w-px bg-border" />;

function WordCount({ editor }: { editor: Editor }) {
  const words = useEditorState({ editor, selector: ({ editor: e }) => e.storage.characterCount.words() as number });
  return (
    <div className="border-t px-4 py-2 text-xs text-muted-foreground sm:px-6">
      {words} kata · ±{Math.max(1, Math.round(words / 200))} menit baca
    </div>
  );
}
