import { useState, useEffect, useCallback } from "react";
import { Folder, FolderPlus, ChevronRight, ChevronDown, MoreHorizontal, Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatFolder {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

interface ChatFoldersProps {
  userId: string;
  folders: ChatFolder[];
  onFoldersChange: (folders: ChatFolder[]) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  renderFolderContents: (folderId: string) => React.ReactNode;
}

export const ChatFolders = ({
  userId,
  folders,
  onFoldersChange,
  expandedFolders,
  onToggleFolder,
  renderFolderContents,
}: ChatFoldersProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const createFolder = useCallback(async () => {
    if (!newFolderName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("chat_folders")
        .insert({
          user_id: userId,
          name: newFolderName.trim(),
          sort_order: folders.length,
        })
        .select()
        .single();

      if (error) throw error;

      onFoldersChange([...folders, data as ChatFolder]);
      setNewFolderName("");
      setIsCreating(false);
      toast.success("Folder created");
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    }
  }, [newFolderName, folders, userId, onFoldersChange]);

  const renameFolder = useCallback(async (folderId: string) => {
    if (!editName.trim()) return;

    try {
      const { error } = await supabase
        .from("chat_folders")
        .update({ name: editName.trim() })
        .eq("id", folderId)
        .eq("user_id", userId);

      if (error) throw error;

      onFoldersChange(
        folders.map(f => f.id === folderId ? { ...f, name: editName.trim() } : f)
      );
      setEditingId(null);
      setEditName("");
    } catch (error) {
      console.error("Error renaming folder:", error);
      toast.error("Failed to rename folder");
    }
  }, [editName, folders, userId, onFoldersChange]);

  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      // First, remove folder_id from all sessions in this folder
      await supabase
        .from("chat_sessions_v2")
        .update({ folder_id: null })
        .eq("folder_id", folderId);

      // Then delete the folder
      const { error } = await supabase
        .from("chat_folders")
        .delete()
        .eq("id", folderId)
        .eq("user_id", userId);

      if (error) throw error;

      onFoldersChange(folders.filter(f => f.id !== folderId));
      toast.success("Folder deleted");
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  }, [folders, userId, onFoldersChange]);

  const startEdit = (folder: ChatFolder) => {
    setEditingId(folder.id);
    setEditName(folder.name);
  };

  return (
    <div className="space-y-1">
      {/* Create folder button/input */}
      {isCreating ? (
        <div className="flex items-center gap-1 px-2 py-1">
          <Folder className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name"
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") createFolder();
              if (e.key === "Escape") {
                setIsCreating(false);
                setNewFolderName("");
              }
            }}
          />
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={createFolder}>
            <Check className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsCreating(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 h-8 text-muted-foreground hover:text-foreground"
          onClick={() => setIsCreating(true)}
        >
          <FolderPlus className="h-4 w-4" />
          New folder
        </Button>
      )}

      {/* Folder list */}
      {folders.map((folder) => (
        <Collapsible
          key={folder.id}
          open={expandedFolders.has(folder.id)}
          onOpenChange={() => onToggleFolder(folder.id)}
        >
          <div className="group flex items-center">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 justify-start gap-1 h-8 px-2"
              >
                {expandedFolders.has(folder.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Folder className="h-4 w-4 text-primary" />
                {editingId === folder.id ? (
                  <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-6 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") renameFolder(folder.id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditName("");
                        }
                      }}
                    />
                    <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => renameFolder(folder.id)}>
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <span className="truncate text-sm">{folder.name}</span>
                )}
              </Button>
            </CollapsibleTrigger>
            
            {editingId !== folder.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => startEdit(folder)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteFolder(folder.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <CollapsibleContent className="pl-6">
            {renderFolderContents(folder.id)}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
};
