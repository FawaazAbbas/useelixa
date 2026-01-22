import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  pendingAction?: PendingAction;
  files?: ChatFile[];
}

export interface ChatFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: "pending" | "executing" | "completed" | "failed";
}

export interface PendingAction {
  id: string;
  toolName: string;
  displayName: string;
  parameters: Record<string, unknown>;
  status: "pending" | "approved" | "denied";
}

interface UseChatOptions {
  sessionId: string;
  onError?: (error: Error) => void;
}

// Threshold for triggering conversation summarization
const SUMMARIZE_MESSAGE_THRESHOLD = 10;

export function useChat({ sessionId, onError }: UseChatOptions) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const lastSummarizedCount = useRef<number>(0);
  
  // Track message IDs we've added locally to prevent realtime duplicates
  const localMessageIds = useRef<Set<string>>(new Set());

  // Trigger conversation summarization when threshold is reached
  const triggerSummarization = useCallback(async (targetSessionId: string, messageCount: number) => {
    // Only summarize every SUMMARIZE_MESSAGE_THRESHOLD messages
    if (messageCount < SUMMARIZE_MESSAGE_THRESHOLD) return;
    if (messageCount - lastSummarizedCount.current < SUMMARIZE_MESSAGE_THRESHOLD) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      console.log(`[Memory] Triggering summarization for session ${targetSessionId} (${messageCount} messages)`);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/conversation-memory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: "summarize_session",
            sessionId: targetSessionId,
          }),
        }
      );

      if (response.ok) {
        lastSummarizedCount.current = messageCount;
        console.log(`[Memory] Session summarized successfully`);
      }
    } catch (error) {
      console.error("[Memory] Failed to summarize session:", error);
    }
  }, []);

  // Real-time subscription for live message updates - only for messages from OTHER sources
  useEffect(() => {
    if (!sessionId) return;

    const channel = supabase
      .channel(`chat-messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages_v2',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('Chat realtime update:', payload);
          const newMsg = payload.new as {
            id: string;
            role: string;
            content: string;
            created_at: string;
            tool_calls?: unknown[];
            metadata?: { pendingAction?: PendingAction; files?: ChatFile[] };
          };
          
          // Skip if we added this message locally
          if (localMessageIds.current.has(newMsg.id)) {
            console.log('Skipping duplicate message from realtime:', newMsg.id);
            return;
          }
          
          // Only add if not already in messages
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id,
              role: newMsg.role as "user" | "assistant",
              content: newMsg.content,
              timestamp: newMsg.created_at,
              toolCalls: newMsg.tool_calls as ToolCall[] | undefined,
              pendingAction: newMsg.metadata?.pendingAction,
              files: newMsg.metadata?.files,
            }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Clear local message IDs when session changes
  useEffect(() => {
    localMessageIds.current.clear();
  }, [sessionId]);

  // Load messages for a session from the database
  const loadSessionMessages = useCallback(async (targetSessionId: string) => {
    if (!user || !targetSessionId) return;

    try {
      const { data, error } = await supabase
        .from("chat_messages_v2")
        .select("*")
        .eq("session_id", targetSessionId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const loadedMessages: ChatMessage[] = (data || []).map((m: any) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: m.created_at,
        toolCalls: m.tool_calls as ToolCall[] | undefined,
        pendingAction: m.metadata?.pendingAction,
        files: m.metadata?.files,
      }));

      // Track all loaded message IDs to prevent realtime duplicates
      loadedMessages.forEach(m => localMessageIds.current.add(m.id));
      setMessages(loadedMessages);
    } catch (error) {
      console.error("Error loading session messages:", error);
      onError?.(error instanceof Error ? error : new Error("Failed to load messages"));
    }
  }, [user, onError]);

  // Upload files to storage and return their metadata
  const uploadFiles = useCallback(async (files: File[]): Promise<ChatFile[]> => {
    if (!user || files.length === 0) return [];
    
    setIsUploading(true);
    const uploadedFiles: ChatFile[] = [];

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, file);

        if (error) {
          console.error('File upload error:', error);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(data.path);

        uploadedFiles.push({
          id: crypto.randomUUID(),
          name: file.name,
          url: publicUrl,
          type: file.type,
          size: file.size,
        });
      }
    } catch (error) {
      console.error('File upload error:', error);
    } finally {
      setIsUploading(false);
    }

    return uploadedFiles;
  }, [user]);

  const sendMessage = useCallback(async (content: string, targetSessionId?: string, files?: File[]) => {
    if ((!content.trim() && (!files || files.length === 0)) || isLoading) return;

    const effectiveSessionId = targetSessionId || sessionId;
    const userMessageId = crypto.randomUUID();

    // Upload files first if provided
    let uploadedFiles: ChatFile[] = [];
    if (files && files.length > 0) {
      uploadedFiles = await uploadFiles(files);
    }

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
      files: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    };

    // Track this message ID to prevent realtime duplicate
    localMessageIds.current.add(userMessageId);
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);

    try {
      // Persist user message to database
      if (user && effectiveSessionId) {
        const insertData = {
          id: userMessageId, // Use the same ID we generated
          session_id: effectiveSessionId,
          role: "user",
          content: content.trim(),
          metadata: uploadedFiles.length > 0 ? { files: uploadedFiles } : null,
        };
        await supabase.from("chat_messages_v2").insert(insertData as any);

        // Update session timestamp
        await supabase
          .from("chat_sessions_v2")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", effectiveSessionId);
      }

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      // Include file information for AI to process
      const messagesToSend = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
        files: m.files?.map(f => ({
          name: f.name,
          url: f.url,
          type: f.type,
          size: f.size,
        })),
      }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: session?.access_token 
            ? `Bearer ${session.access_token}`
            : `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: messagesToSend,
          sessionId: effectiveSessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const assistantMessageId = crypto.randomUUID();
      
      // Track assistant message ID
      localMessageIds.current.add(assistantMessageId);

      // Handle JSON response (non-streaming with tool execution)
      if (contentType.includes("application/json")) {
        const data = await response.json();
        
        let pendingAction: PendingAction | undefined;

        if (data.pending_action) {
          const pending = data.pending_action;
          pendingAction = {
            id: pending.id || crypto.randomUUID(),
            toolName: pending.name,
            displayName: pending.display_name || pending.name?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            parameters: pending.parameters || {},
            status: pending.status || "pending",
          };
        } else if (data.requiresConfirmation) {
          // Fetch the actual pending action from database
          const { data: pendingActionData } = await supabase
            .from("pending_actions")
            .select("id")
            .eq("session_id", effectiveSessionId)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          pendingAction = {
            id: pendingActionData?.id || crypto.randomUUID(),
            toolName: data.toolName,
            displayName: data.toolName?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            parameters: data.toolArgs,
            status: "pending",
          };
        }

        const assistantMessage: ChatMessage = {
          id: assistantMessageId,
          role: "assistant",
          content: data.content || data.error || "I encountered an issue.",
          timestamp: new Date().toISOString(),
          pendingAction,
          toolCalls: Array.isArray(data.tool_calls)
            ? data.tool_calls.map((toolCall: any, index: number) => ({
                id: toolCall.id || `${assistantMessageId}-tool-${index}`,
                name: toolCall.name || "",
                arguments: toolCall.arguments || {},
                result: toolCall.result,
                status: toolCall.result?.error ? "failed" : "completed",
              }))
            : undefined,
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Persist assistant message to database
        if (user && effectiveSessionId) {
          const insertData = {
            id: assistantMessageId, // Use the same ID
            session_id: effectiveSessionId,
            role: "assistant",
            content: assistantMessage.content,
            metadata: pendingAction
              ? { pendingAction }
              : assistantMessage.toolCalls
                ? { toolCalls: assistantMessage.toolCalls }
                : null,
          };
          await supabase.from("chat_messages_v2").insert(insertData as any);
        }
        
        return;
      }

      // Handle SSE streaming response
      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let toolCalls: ToolCall[] = [];
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta;
            
            if (delta?.content) {
              assistantContent += delta.content;
              
              // Update the assistant message progressively
              setMessages(prev => {
                const existing = prev.find(m => m.id === assistantMessageId);
                if (existing) {
                  return prev.map(m => 
                    m.id === assistantMessageId 
                      ? { ...m, content: assistantContent }
                      : m
                  );
                }
                return [...prev, {
                  id: assistantMessageId,
                  role: "assistant" as const,
                  content: assistantContent,
                  timestamp: new Date().toISOString(),
                  toolCalls,
                }];
              });
            }

            // Handle tool calls
            if (delta?.tool_calls) {
              for (const toolCall of delta.tool_calls) {
                const existingTool = toolCalls.find(t => t.id === toolCall.id);
                if (existingTool) {
                  if (toolCall.function?.arguments) {
                    existingTool.arguments = {
                      ...existingTool.arguments,
                      ...JSON.parse(toolCall.function.arguments || "{}"),
                    };
                  }
                } else if (toolCall.id) {
                  toolCalls.push({
                    id: toolCall.id,
                    name: toolCall.function?.name || "",
                    arguments: JSON.parse(toolCall.function?.arguments || "{}"),
                    status: "pending",
                  });
                }
              }
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final message update and persist
      if (assistantContent || toolCalls.length > 0) {
        const finalMessage: ChatMessage = {
          id: assistantMessageId,
          role: "assistant",
          content: assistantContent,
          timestamp: new Date().toISOString(),
          toolCalls,
        };

        setMessages(prev => {
          const existing = prev.find(m => m.id === assistantMessageId);
          if (existing) {
            return prev.map(m => 
              m.id === assistantMessageId ? finalMessage : m
            );
          }
          return [...prev, finalMessage];
        });

        // Persist to database
        if (user && effectiveSessionId) {
          const insertData = {
            id: assistantMessageId, // Use the same ID
            session_id: effectiveSessionId,
            role: "assistant",
            content: assistantContent,
            metadata: toolCalls.length > 0 ? { toolCalls } : null,
          };
          await supabase.from("chat_messages_v2").insert(insertData as any);
        }
      }

    } catch (error) {
      console.error("Chat error:", error);
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);

      // Trigger summarization in background after successful message exchange
      const currentMessageCount = messages.length + 2; // +2 for user + assistant
      if (effectiveSessionId) {
        triggerSummarization(effectiveSessionId, currentMessageCount);
      }
    }
  }, [messages, isLoading, sessionId, user, onError, triggerSummarization, uploadFiles]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localMessageIds.current.clear();
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    isUploading,
    sendMessage,
    clearMessages,
    setMessages,
    loadSessionMessages,
    uploadFiles,
  };
}
