import { memo } from "react";
import { FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Note } from "@/hooks/useNotes";

interface NotesListProps {
  notes: Note[];
  selectedId: string | null;
  onSelect: (note: Note) => void;
  onDelete: (id: string) => void;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getPreview = (content: string) => {
  // Strip HTML tags for preview
  const text = content.replace(/<[^>]*>/g, "").trim();
  if (!text) return "No content";
  return text.length > 60 ? text.substring(0, 60) + "..." : text;
};

export const NotesList = memo(({ notes, selectedId, onSelect, onDelete }: NotesListProps) => {
  return (
    <div className="space-y-1">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => onSelect(note)}
          className={cn(
            "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
            selectedId === note.id
              ? "bg-primary/10 border border-primary/20"
              : "hover:bg-muted"
          )}
        >
          <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-medium text-sm truncate">{note.title || "Untitled"}</h3>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDate(note.updated_at)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {getPreview(note.content)}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      ))}
    </div>
  );
});

NotesList.displayName = "NotesList";
