import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useWorkspace } from "./useWorkspace";
import { toast } from "sonner";

export interface Note {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotes = () => {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchNotes = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setNotes((data as Note[]) || []);
    } catch (error) {
      console.error("Error fetching notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (title = "Untitled", content = "") => {
    if (!user || !workspaceId) {
      toast.error("Please log in first");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          workspace_id: workspaceId,
          user_id: user.id,
          title,
          content,
          is_pinned: false,
        })
        .select()
        .single();

      if (error) throw error;
      
      setNotes((prev) => [data as Note, ...prev]);
      return data as Note;
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
      return null;
    }
  };

  const updateNote = async (id: string, updates: Partial<Pick<Note, "title" | "content" | "is_pinned">>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("notes")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setNotes((prev) => {
        const updated = prev.map((note) =>
          note.id === id ? { ...note, ...updates, updated_at: new Date().toISOString() } : note
        );
        // Re-sort: pinned first, then by updated_at
        return updated.sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
      });
      return true;
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to save note");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setNotes((prev) => prev.filter((note) => note.id !== id));
      toast.success("Note deleted");
      return true;
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
      return false;
    }
  };

  return {
    notes,
    loading,
    saving,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  };
};
