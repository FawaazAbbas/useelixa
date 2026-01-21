import { useState, useCallback } from "react";
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
      
      const messagesToSend = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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

      if (!response.body) {
        throw new Error("No response body");
      }

      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      let toolCalls: ToolCall[] = [];
      let textBuffer = "";

      const assistantMessageId = crypto.randomUUID();

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
                  // Append to existing tool call arguments
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
            // Incomplete JSON, put it back
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
