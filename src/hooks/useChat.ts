import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolCalls?: ToolCall[];
  pendingAction?: PendingAction;
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

export function useChat({ sessionId, onError }: UseChatOptions) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Real-time subscription for live message updates
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
          };
          
          // Only add if not already in messages (avoid duplicates from our own sends)
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id,
              role: newMsg.role as "user" | "assistant",
              content: newMsg.content,
              timestamp: newMsg.created_at,
              toolCalls: newMsg.tool_calls as ToolCall[] | undefined,
            }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      // Get session for auth
      const { data: { session } } = await supabase.auth.getSession();
      
      const messagesToSend = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
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
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed: ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      const assistantMessageId = crypto.randomUUID();

      // Handle JSON response (non-streaming with tool execution)
      if (contentType.includes("application/json")) {
        const data = await response.json();
        
        let pendingAction: PendingAction | undefined;
        
        if (data.requiresConfirmation) {
          pendingAction = {
            id: crypto.randomUUID(),
            toolName: data.toolName,
            displayName: data.toolName?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            parameters: data.toolArgs,
            status: "pending",
          };
        }

        setMessages(prev => [...prev, {
          id: assistantMessageId,
          role: "assistant",
          content: data.content || data.error || "I encountered an issue.",
          timestamp: new Date().toISOString(),
          pendingAction,
        }]);
        
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

      // Final message update
      if (assistantContent || toolCalls.length > 0) {
        setMessages(prev => {
          const existing = prev.find(m => m.id === assistantMessageId);
          if (existing) {
            return prev.map(m => 
              m.id === assistantMessageId 
                ? { ...m, content: assistantContent, toolCalls }
                : m
            );
          }
          return [...prev, {
            id: assistantMessageId,
            role: "assistant",
            content: assistantContent,
            timestamp: new Date().toISOString(),
            toolCalls,
          }];
        });
      }

    } catch (error) {
      console.error("Chat error:", error);
      onError?.(error instanceof Error ? error : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [messages, isLoading, sessionId, onError]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isStreaming,
    sendMessage,
    clearMessages,
    setMessages,
  };
}
