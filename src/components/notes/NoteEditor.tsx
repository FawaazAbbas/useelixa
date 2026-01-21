import { useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Link as LinkIcon, Heading1, Heading2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Note } from "@/hooks/useNotes";

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, updates: { title?: string; content?: string }) => Promise<boolean>;
  saving: boolean;
}

export const NoteEditor = ({ note, onUpdate, saving }: NoteEditorProps) => {
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      Underline,
      Link.configure({
        openOnClick: true,
      }),
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onUpdate(note.id, { content });
      }, 500);
    },
  });

  // Update editor content when note changes
  useEffect(() => {
    if (editor && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
    }
  }, [note.id, note.content, editor]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onUpdate(note.id, { title });
      }, 500);
    },
    [note.id, onUpdate]
  );

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="border-b px-4 py-3">
        <Input
          ref={titleRef}
          defaultValue={note.title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent"
        />
        {saving && (
          <span className="text-xs text-muted-foreground mt-1">Saving...</span>
        )}
      </div>

      {/* Toolbar */}
      <div className="border-b px-2 py-1 flex items-center gap-0.5 overflow-x-auto">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("bold") && "bg-muted")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("italic") && "bg-muted")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("underline") && "bg-muted")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("heading", { level: 1 }) && "bg-muted")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("heading", { level: 2 }) && "bg-muted")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("bulletList") && "bg-muted")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("orderedList") && "bg-muted")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", editor.isActive("link") && "bg-muted")}
          onClick={addLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto p-4">
        <EditorContent 
          editor={editor} 
          className="prose prose-sm dark:prose-invert max-w-none min-h-[200px] focus:outline-none"
        />
      </div>
    </div>
  );
};
