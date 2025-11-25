import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBrianChat } from "@/hooks/useBrianChat";

interface BrianChatProps {
  userId: string;
  workspaceId: string;
}

export const BrianChat = ({ userId, workspaceId }: BrianChatProps) => {
  const { messages, loading, sending, sendMessage } = useBrianChat(userId, workspaceId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const messageText = input;
    setInput("");
    await sendMessage(messageText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-500">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Hey there! I'm Brian, your AI COO.</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  I know everything about your workspace and can help you install agents, 
                  create tasks, search files, or delegate work to your AI team. What can I help you with?
                </p>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-500 flex-shrink-0">
                  <AvatarFallback className="text-white text-sm font-bold">B</AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>

              {msg.role === "user" && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">You</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 bg-gradient-to-br from-purple-600 to-blue-500 flex-shrink-0">
                <AvatarFallback className="text-white text-sm font-bold">B</AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-4 py-2 bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Brian anything about your workspace..."
            disabled={sending}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={sending || !input.trim()}
            size="icon"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
