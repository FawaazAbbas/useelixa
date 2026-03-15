import { useState, useMemo, useEffect } from "react";
import { FileText, Plus, Search, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotes, type Note } from "@/hooks/useNotes";
import { NotesList } from "@/components/notes/NotesList";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ElixaMascot } from "@/components/ElixaMascot";

const Notes = () => {
  const { notes, loading, saving, createNote, updateNote, deleteNote } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const handleCreateNote = async () => {
    const newNote = await createNote();
    if (newNote) {
      setSelectedNote(newNote);
    }
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };

  const handleDeleteNote = async (id: string) => {
    const success = await deleteNote(id);
    if (success && selectedNote?.id === id) {
      setSelectedNote(null);
    }
    return success;
  };

  // Only sync selectedNote if it was deleted from the array
  useEffect(() => {
    if (selectedNote && !notes.find(n => n.id === selectedNote.id)) {
      setSelectedNote(null);
    }
  }, [notes, selectedNote]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N = New note
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleCreateNote();
      }
      // Cmd/Ctrl + F = Focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "f" && !selectedNote) {
        e.preventDefault();
        document.getElementById("notes-search")?.focus();
      }
      // Escape = Deselect note
      if (e.key === "Escape" && selectedNote) {
        setSelectedNote(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedNote]);

  const Sidebar = () => (
    <>
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h2 className="font-semibold">Notes</h2>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" onClick={handleCreateNote}>
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </TooltipTrigger>
              <TooltipContent>New note (⌘N)</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="notes-search"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      <ScrollArea className="flex-1 p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredNotes.length > 0 ? (
          <NotesList
            notes={filteredNotes}
            selectedId={selectedNote?.id || null}
            onSelect={handleSelectNote}
            onDelete={handleDeleteNote}
          />
        ) : notes.length > 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes match your search</p>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Press ⌘N to create one</p>
          </div>
        )}
      </ScrollArea>
      {/* Keyboard shortcuts hint */}
      <div className="p-3 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Keyboard className="h-3 w-3" />
          <span>⌘N New • ⌘S Save • Esc Close</span>
        </div>
      </div>
    </>
  );

  return (
    <PageLayout
      title="Notes"
      icon={FileText}
      badge={notes.length || undefined}
      sidebar={<Sidebar />}
      noPadding
      fullWidth
    >
      {selectedNote ? (
        <NoteEditor
          key={selectedNote.id}
          note={selectedNote}
          onUpdate={updateNote}
          onDelete={handleDeleteNote}
          saving={saving}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center h-full">
          <ElixaMascot pose="sitting" size="lg" animation="float" className="mb-4" />
          <h3 className="text-lg font-medium mb-1">Select a note</h3>
          <p className="text-muted-foreground text-sm mb-4">Choose a note from the sidebar or create a new one</p>
          <Button onClick={handleCreateNote} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </div>
      )}
    </PageLayout>
  );
};

export default Notes;
