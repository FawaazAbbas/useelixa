import { useEffect, useRef, useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Link as LinkIcon, Heading1, Heading2, Pin, PinOff, MoreHorizontal,
  Download, Copy, Trash2, Undo, Redo, Quote, Code
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Note } from "@/hooks/useNotes";

interface NoteEditorProps {
  note: Note;
  onUpdate: (id: string, updates: { title?: string; content?: string; is_pinned?: boolean }) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  saving: boolean;
}

const ToolbarButton = ({ 
  onClick, 
  isActive = false, 
  icon: Icon, 
  tooltip 
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  icon: React.ElementType; 
  tooltip: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", isActive && "bg-muted")}
        onClick={onClick}
      >
        <Icon className="h-4 w-4" />
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom" className="text-xs">
      {tooltip}
    </TooltipContent>
  </Tooltip>
);

const ToolbarDivider = () => <div className="w-px h-5 bg-border mx-1" />;

export const NoteEditor = ({ note, onUpdate, onDelete, saving }: NoteEditorProps) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [localTitle, setLocalTitle] = useState(note.title);
  const [isPinned, setIsPinned] = useState(note.is_pinned || false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Placeholder.configure({
        placeholder: "Start writing your thoughts...",
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { class: "text-primary underline" },
      }),
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      const text = editor.getText();
      
      // Update counts
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      setCharCount(text.length);
      
      // Debounced save
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate(note.id, { content });
      }, 500);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[300px] focus:outline-none",
      },
    },
  });

  // Only reset editor content when switching to a different note
  const prevNoteIdRef = useRef(note.id);
  useEffect(() => {
    if (editor && prevNoteIdRef.current !== note.id) {
      editor.commands.setContent(note.content);
      prevNoteIdRef.current = note.id;
    }
    setLocalTitle(note.title);
    setIsPinned(note.is_pinned || false);
  }, [note.id, note.is_pinned, editor]);

  // Calculate initial counts
  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(text.length);
    }
  }, [editor]);

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const title = e.target.value;
      setLocalTitle(title);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdate(note.id, { title });
      }, 500);
    },
    [note.id, onUpdate]
  );

  const togglePin = useCallback(async () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    await onUpdate(note.id, { is_pinned: newPinned });
    toast.success(newPinned ? "Note pinned" : "Note unpinned");
  }, [isPinned, note.id, onUpdate]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const copyContent = useCallback(() => {
    if (!editor) return;
    const text = editor.getText();
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }, [editor]);

  const exportAsMarkdown = useCallback(() => {
    if (!editor) return;
    const content = editor.getText();
    const markdown = `# ${localTitle}\n\n${content}`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${localTitle || "note"}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Note exported");
  }, [editor, localTitle]);

  const handleDelete = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      await onDelete(note.id);
    }
  }, [note.id, onDelete]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        // Force immediate save
        if (editor) {
          onUpdate(note.id, { title: localTitle, content: editor.getHTML() });
          toast.success("Note saved");
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor, note.id, localTitle, onUpdate]);

  if (!editor) return null;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header with title and actions */}
      <div className="border-b px-4 py-3 flex items-center gap-3">
        <Input
          ref={titleRef}
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="Untitled note..."
          className="text-xl font-semibold border-0 p-0 h-auto focus-visible:ring-0 bg-transparent flex-1"
        />
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={togglePin}>
                {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isPinned ? "Unpin note" : "Pin note"}</TooltipContent>
          </Tooltip>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyContent}>
                <Copy className="h-4 w-4 mr-2" />
                Copy text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsMarkdown}>
                <Download className="h-4 w-4 mr-2" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b px-2 py-1 flex items-center gap-0.5 overflow-x-auto">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          tooltip="Undo (⌘Z)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          tooltip="Redo (⌘⇧Z)"
        />
        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          icon={Bold}
          tooltip="Bold (⌘B)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          icon={Italic}
          tooltip="Italic (⌘I)"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          icon={UnderlineIcon}
          tooltip="Underline (⌘U)"
        />
        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          icon={Heading1}
          tooltip="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          icon={Heading2}
          tooltip="Heading 2"
        />
        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          icon={List}
          tooltip="Bullet list"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          icon={ListOrdered}
          tooltip="Numbered list"
        />
        <ToolbarDivider />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          icon={Quote}
          tooltip="Quote"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          icon={Code}
          tooltip="Code block"
        />
        <ToolbarButton
          onClick={addLink}
          isActive={editor.isActive("link")}
          icon={LinkIcon}
          tooltip="Add link"
        />
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-auto p-4">
        <EditorContent editor={editor} />
      </div>

      {/* Footer with stats */}
      <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="animate-pulse">Saving...</span>}
          <span>⌘S to save</span>
        </div>
      </div>
    </div>
  );
};
