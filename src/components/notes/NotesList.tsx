import { memo, useMemo } from "react";
import { FileText, Trash2, Pin } from "lucide-react";
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
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getPreview = (content: string) => {
  const text = content.replace(/<[^>]*>/g, "").trim();
  if (!text) return "No content";
  return text.length > 80 ? text.substring(0, 80) + "..." : text;
};

const NoteItem = memo(({ 
  note, 
  isSelected, 
  onSelect, 
  onDelete 
}: { 
  note: Note; 
  isSelected: boolean; 
  onSelect: () => void; 
  onDelete: () => void;
}) => (
  <div
    onClick={onSelect}
    className={cn(
      "group relative flex flex-col gap-1 p-3 rounded-lg cursor-pointer transition-all",
      isSelected
        ? "bg-primary/10 border border-primary/20 shadow-sm"
        : "hover:bg-muted/80 border border-transparent"
    )}
  >
    {note.is_pinned && (
      <Pin className="absolute top-2 right-2 h-3 w-3 text-primary fill-primary" />
    )}
    <div className="flex items-start gap-2.5 min-w-0">
      <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0 overflow-hidden">
        <h3 className={cn(
          "font-medium text-sm truncate",
          !note.title && "text-muted-foreground italic"
        )}>
          {note.title || "Untitled"}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {getPreview(note.content)}
        </p>
        <span className="text-[10px] text-muted-foreground/70 mt-1.5 block">
          {formatDate(note.updated_at)}
        </span>
      </div>
    </div>
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "absolute bottom-2 right-2 h-6 w-6 opacity-0 transition-opacity",
        "group-hover:opacity-100 hover:bg-destructive/10"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
    >
      <Trash2 className="h-3 w-3 text-destructive" />
    </Button>
  </div>
));

NoteItem.displayName = "NoteItem";

export const NotesList = memo(({ notes, selectedId, onSelect, onDelete }: NotesListProps) => {
  // Separate pinned and unpinned notes
  const { pinnedNotes, unpinnedNotes } = useMemo(() => {
    const pinned = notes.filter(n => n.is_pinned);
    const unpinned = notes.filter(n => !n.is_pinned);
    return { pinnedNotes: pinned, unpinnedNotes: unpinned };
  }, [notes]);

  return (
    <div className="space-y-1">
      {pinnedNotes.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Pinned
          </div>
          {pinnedNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={selectedId === note.id}
              onSelect={() => onSelect(note)}
              onDelete={() => onDelete(note.id)}
            />
          ))}
          {unpinnedNotes.length > 0 && (
            <div className="px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-2">
              Notes
            </div>
          )}
        </>
      )}
      {unpinnedNotes.map((note) => (
        <NoteItem
          key={note.id}
          note={note}
          isSelected={selectedId === note.id}
          onSelect={() => onSelect(note)}
          onDelete={() => onDelete(note.id)}
        />
      ))}
    </div>
  );
});

NotesList.displayName = "NotesList";
