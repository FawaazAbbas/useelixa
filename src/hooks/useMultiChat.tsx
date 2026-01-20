import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

// Helper to convert DB row to ChatMessage
function toMessage(row: {
  id: string;
  role: string;
  content: string;
  metadata: Json;
  created_at: string;
}): ChatMessage {
  return {
    id: row.id,
    role: row.role as "user" | "assistant",
    content: row.content,
    metadata: typeof row.metadata === 'object' && row.metadata !== null ? row.metadata as Record<string, any> : undefined,
    created_at: row.created_at,
  };
}

export function useMultiChat(userId: string | undefined, workspaceId: string | null) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch all chat sessions
  const fetchSessions = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("chat_sessions_v2")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching sessions:", error);
    } else {
      setSessions(data || []);
      // Auto-select the first session if none selected
      if (data && data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    }
    setLoading(false);
  }, [userId, activeSessionId]);

  // Fetch messages for active session
  const fetchMessages = useCallback(async () => {
    if (!activeSessionId) {
      setMessages([]);
      return;
    }

    setMessagesLoading(true);
    const { data, error } = await supabase
      .from("chat_messages_v2")
      .select("*")
      .eq("session_id", activeSessionId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages((data || []).map(toMessage));
    }
    setMessagesLoading(false);
  }, [activeSessionId]);

  // Create a new chat session
  const createSession = useCallback(async (title: string = "New Chat") => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("chat_sessions_v2")
      .insert({
        user_id: userId,
        workspace_id: workspaceId,
        title,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      return null;
    }

    setSessions(prev => [data, ...prev]);
    setActiveSessionId(data.id);
    setMessages([]);
    return data;
  }, [userId, workspaceId]);

  // Delete a chat session
  const deleteSession = useCallback(async (sessionId: string) => {
    const { error } = await supabase
      .from("chat_sessions_v2")
      .delete()
      .eq("id", sessionId);

    if (error) {
      console.error("Error deleting session:", error);
      return false;
    }

    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setActiveSessionId(remaining[0]?.id || null);
    }
    return true;
  }, [activeSessionId, sessions]);

  // Update session title
  const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
    const { error } = await supabase
      .from("chat_sessions_v2")
      .update({ title })
      .eq("id", sessionId);

    if (error) {
      console.error("Error updating session title:", error);
      return false;
    }

    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, title } : s
    ));
    return true;
  }, []);

  // Send a message
  const sendMessage = useCallback(async (content: string, metadata?: Record<string, any>) => {
    if (!userId || !content.trim()) return;

    let sessionId = activeSessionId;

    // Create a new session if none exists
    if (!sessionId) {
      const session = await createSession(content.slice(0, 50) + (content.length > 50 ? "..." : ""));
      if (!session) return;
      sessionId = session.id;
    }

    setSending(true);

    // Add user message
    const userMessage: Omit<ChatMessage, 'id'> = {
      role: "user",
      content,
      metadata,
      created_at: new Date().toISOString(),
    };

    const { data: savedUserMsg, error: userError } = await supabase
      .from("chat_messages_v2")
      .insert({
        session_id: sessionId,
        role: "user",
        content,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (userError) {
      console.error("Error saving user message:", userError);
      setSending(false);
      return;
    }

    setMessages(prev => [...prev, toMessage(savedUserMsg)]);

    // Update session title if it's the first message
    if (messages.length === 0) {
      await updateSessionTitle(sessionId, content.slice(0, 50) + (content.length > 50 ? "..." : ""));
    }

    // Call brian-universal for AI response
    try {
      const { data: response, error: fnError } = await supabase.functions.invoke("brian-universal", {
        body: {
          message: content,
          userId,
          workspaceId,
          sessionId,
          metadata,
        },
      });

      if (fnError) throw fnError;

      const assistantContent = response?.response || "I'm sorry, I couldn't process that request.";
      const toolExecutions = response?.toolExecutions || [];

      const { data: savedAssistantMsg, error: assistantError } = await supabase
        .from("chat_messages_v2")
        .insert({
          session_id: sessionId,
          role: "assistant",
          content: assistantContent,
          metadata: { toolExecutions },
        })
        .select()
        .single();

      if (assistantError) {
        console.error("Error saving assistant message:", assistantError);
      } else {
        setMessages(prev => [...prev, toMessage(savedAssistantMsg)]);
      }

      // Update session's updated_at
      await supabase
        .from("chat_sessions_v2")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", sessionId);

    } catch (error) {
      console.error("Error calling AI:", error);
      
      // Add error message
      const { data: errorMsg } = await supabase
        .from("chat_messages_v2")
        .insert({
          session_id: sessionId,
          role: "assistant",
          content: "I'm sorry, I encountered an error processing your request. Please try again.",
          metadata: { error: true },
        })
        .select()
        .single();

      if (errorMsg) {
        setMessages(prev => [...prev, toMessage(errorMsg)]);
      }
    } finally {
      setSending(false);
    }
  }, [userId, workspaceId, activeSessionId, messages.length, createSession, updateSessionTitle]);

  // Select a session
  const selectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchSessions();
    }
  }, [userId, fetchSessions]);

  // Fetch messages when active session changes
  useEffect(() => {
    fetchMessages();
  }, [activeSessionId, fetchMessages]);

  // Real-time subscription for sessions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`chat_sessions_${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_sessions_v2",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchSessions]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!activeSessionId) return;

    const channel = supabase
      .channel(`chat_messages_${activeSessionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages_v2",
          filter: `session_id=eq.${activeSessionId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSessionId]);

  return {
    sessions,
    activeSessionId,
    messages,
    loading,
    messagesLoading,
    sending,
    createSession,
    deleteSession,
    updateSessionTitle,
    sendMessage,
    selectSession,
  };
}
