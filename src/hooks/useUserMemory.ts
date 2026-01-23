import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserMemory {
  id: string;
  memory_key: string;
  memory_value: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export function useUserMemory(userId: string | undefined) {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load user memories
  useEffect(() => {
    if (!userId) {
      setMemories([]);
      setIsLoading(false);
      return;
    }

    const loadMemories = async () => {
      try {
        const { data, error } = await supabase
          .from("user_memories")
          .select("*")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        setMemories((data || []) as UserMemory[]);
      } catch (error) {
        console.error("Error loading memories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemories();
  }, [userId]);

  const addMemory = useCallback(async (
    key: string,
    value: string,
    category: string = "preference"
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase
        .from("user_memories")
        .upsert({
          user_id: userId,
          memory_key: key,
          memory_value: value,
          category,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,memory_key"
        })
        .select()
        .single();

      if (error) throw error;

      setMemories(prev => {
        const existing = prev.findIndex(m => m.memory_key === key);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = data as UserMemory;
          return updated;
        }
        return [data as UserMemory, ...prev];
      });

      return true;
    } catch (error) {
      console.error("Error adding memory:", error);
      return false;
    }
  }, [userId]);

  const deleteMemory = useCallback(async (memoryId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("user_memories")
        .delete()
        .eq("id", memoryId)
        .eq("user_id", userId);

      if (error) throw error;

      setMemories(prev => prev.filter(m => m.id !== memoryId));
      return true;
    } catch (error) {
      console.error("Error deleting memory:", error);
      return false;
    }
  }, [userId]);

  const getMemoriesForContext = useCallback((): string => {
    if (memories.length === 0) return "";

    const grouped = memories.reduce((acc, mem) => {
      const cat = mem.category || "general";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(`${mem.memory_key}: ${mem.memory_value}`);
      return acc;
    }, {} as Record<string, string[]>);

    let context = "\n\nUser preferences and remembered information:";
    for (const [category, items] of Object.entries(grouped)) {
      context += `\n[${category}]: ${items.join("; ")}`;
    }

    return context;
  }, [memories]);

  return {
    memories,
    isLoading,
    addMemory,
    deleteMemory,
    getMemoriesForContext,
  };
}
