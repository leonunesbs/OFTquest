"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "./ui/button";

import {
  RxFontBold,
  RxFontItalic,
  RxHeading,
  RxImage,
  RxStrikethrough,
  RxTextAlignCenter,
  RxTextAlignJustify,
  RxTextAlignLeft,
  RxTextAlignRight,
  RxUnderline,
} from "react-icons/rx";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

function MenuBar({ editor }: { editor?: Editor }) {
  if (!editor) return null;
  return (
    <div className="flex gap-2 overflow-x-auto p-2">
      <div className="flex gap-2">
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={
            editor.isActive("heading", { level: 1 }) ? "outline" : "ghost"
          }
          aria-label="Título 1"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <div className="flex gap-2">
            <RxHeading size="1rem mx-1" />1
          </div>
        </Button>
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={
            editor.isActive("heading", { level: 2 }) ? "outline" : "ghost"
          }
          aria-label="Título 2"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <div className="flex gap-2">
            <RxHeading size="1rem mx-1" />2{" "}
          </div>
        </Button>
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={
            editor.isActive("heading", { level: 3 }) ? "outline" : "ghost"
          }
          aria-label="Título 3"
          onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
        >
          <div className="flex gap-2">
            <RxHeading size="1rem mx-1" />3{" "}
          </div>
        </Button>
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={editor.isActive("paragraph") ? "outline" : "ghost"}
          aria-label="Paragrafo"
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          P
        </Button>
      </div>
      <div className="flex gap-2">
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={editor.isActive("bold") ? "outline" : "ghost"}
          aria-label="Negrito"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
        >
          <RxFontBold size="1rem mx-1" />
        </Button>
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={editor.isActive("italic") ? "outline" : "ghost"}
          aria-label="Itálico"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
        >
          <RxFontItalic size="1rem mx-1" />
        </Button>
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={editor.isActive("underline") ? "outline" : "ghost"}
          aria-label="Sublinhado"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={!editor.can().chain().focus().toggleUnderline().run()}
        >
          <RxUnderline size="1rem mx-1" />
        </Button>
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={editor.isActive("strike") ? "outline" : "ghost"}
          aria-label="Riscado"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
        >
          <RxStrikethrough size="1rem mx-1" />
        </Button>
      </div>
      <Separator orientation={"vertical"} />
      <div className="flex gap-2">
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={
            editor.isActive("textAlign", { textAlign: "left" })
              ? "outline"
              : "ghost"
          }
          aria-label="Alinhar à esquerda"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          disabled={!editor.can().chain().focus().setTextAlign("left").run()}
        >
          <RxTextAlignLeft size="1rem mx-1" />
        </Button>
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={
            editor.isActive("textAlign", { textAlign: "center" })
              ? "outline"
              : "ghost"
          }
          aria-label="Centralizar"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          disabled={!editor.can().chain().focus().setTextAlign("center").run()}
        >
          <RxTextAlignCenter size="1rem mx-1" />
        </Button>
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={
            editor.isActive("textAlign", { textAlign: "right" })
              ? "outline"
              : "ghost"
          }
          aria-label="Alinhar à direita"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          disabled={!editor.can().chain().focus().setTextAlign("right").run()}
        >
          <RxTextAlignRight size="1rem mx-1" />
        </Button>
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant={
            editor.isActive("textAlign", { textAlign: "justify" })
              ? "outline"
              : "ghost"
          }
          aria-label="Alinhar à direita"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          disabled={!editor.can().chain().focus().setTextAlign("justify").run()}
        >
          <RxTextAlignJustify size="1rem mx-1" />
        </Button>
      </div>
      <Separator orientation={"vertical"} />
      <div className="flex gap-2">
        <Button
          tabIndex={1}
          type="button"
          size="icon"
          variant="ghost"
          aria-label="Inserir imagem"
          onClick={() => {
            const url = window.prompt("URL da imagem:");
            if (url) {
              const alt = window.prompt("Texto alternativo (alt):");
              const title = window.prompt("Título da imagem (opcional):");

              editor
                .chain()
                .focus()
                .setImage({
                  src: url,
                  alt: alt ?? undefined,
                  title: title ?? undefined,
                })
                .run();
            }
          }}
        >
          <RxImage size="1rem mx-1" />
        </Button>
      </div>
    </div>
  );
}

interface TiptapProps {
  content?: string;
  onChange: (event: string) => void;
  placeholder?: string;
}

export function TiptapEditor({ content, onChange, placeholder }: TiptapProps) {
  const editor = useEditor({
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "custom-paragraph-class",
          },
        },
        heading: {
          HTMLAttributes: {
            class: "custom-heading-class",
          },
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    editorProps: {
      attributes: {
        class:
          "prose min-h-[200px] round border p-2 focus:ring-0 focus:outline-none",
        tabindex: "1",
      },
    },
  });
  return (
    <div>
      <MenuBar editor={editor!} />
      {editor ? (
        <EditorContent editor={editor} />
      ) : (
        <Skeleton className="min-h-[250px]" />
      )}
    </div>
  );
}
