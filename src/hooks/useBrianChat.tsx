import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

interface ToolExecution {
  toolName: string;
  success: boolean;
  executionTimeMs?: number;
  inputSummary?: string;
  outputSummary?: string;
  errorMessage?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  metadata?: {
    files?: Array<{
      name: string;
      url: string;
      type: string;
      size: number;
    }>;
    toolExecutions?: ToolExecution[];
  };
}

export const useBrianChat = (userId: string | undefined, workspaceId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !workspaceId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    
    loadConversation();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`brian_conversation_${userId}_${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brian_conversations',
          filter: `user_id=eq.${userId},workspace_id=eq.${workspaceId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.new?.messages) {
            setMessages(payload.new.messages as Message[]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, workspaceId]);

  const loadConversation = async () => {
    if (!userId || !workspaceId) return;

    try {
      const { data, error } = await supabase
        .from("brian_conversations")
        .select("messages")
        .eq("user_id", userId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data?.messages) {
        setMessages(Array.isArray(data.messages) ? (data.messages as unknown as Message[]) : []);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, metadata?: Message['metadata']) => {
    if (!userId || !workspaceId || (!content.trim() && !metadata?.files?.length)) return;

    setSending(true);
    const userMessage: Message = { 
      role: "user", 
      content, 
      metadata,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const { data, error } = await supabase.functions.invoke("brian-universal", {
        body: {
          message: content,
          user_id: userId,
          workspace_id: workspaceId,
          chat_type: "direct",
          metadata,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.content,
        timestamp: new Date().toISOString(),
        metadata: data.toolExecutions ? { toolExecutions: data.toolExecutions } : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message. Please try again.",
      });
      
      // Remove the user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const clearConversation = async () => {
    if (!userId || !workspaceId) return;

    try {
      const { error } = await supabase
        .from("brian_conversations")
        .update({ messages: [] })
        .eq("user_id", userId)
        .eq("workspace_id", workspaceId);

      if (error) throw error;

      setMessages([]);
      toast({
        title: "Conversation cleared",
        description: "Your chat history has been cleared.",
      });
    } catch (error) {
      console.error("Error clearing conversation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear conversation.",
      });
    }
  };

  return {
    messages,
    loading,
    sending,
    sendMessage,
    clearConversation,
  };
};
