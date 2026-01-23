import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatFolder } from "@/components/chat/ChatFolders";

export function useChatFolders(userId: string | undefined) {
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load folders
  useEffect(() => {
    if (!userId) {
      setFolders([]);
      setIsLoading(false);
      return;
    }

    const loadFolders = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_folders")
          .select("*")
          .eq("user_id", userId)
          .order("sort_order", { ascending: true });

        if (error) throw error;
        setFolders((data || []) as ChatFolder[]);
      } catch (error) {
        console.error("Error loading folders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFolders();
  }, [userId]);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const moveSessionToFolder = useCallback(async (
    sessionId: string,
    folderId: string | null
  ) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from("chat_sessions_v2")
        .update({ folder_id: folderId })
        .eq("id", sessionId)
        .eq("user_id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error moving session to folder:", error);
      return false;
    }
  }, [userId]);

  return {
    folders,
    setFolders,
    expandedFolders,
    toggleFolder,
    moveSessionToFolder,
    isLoading,
  };
}
