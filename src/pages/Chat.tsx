import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Plus, Send, Loader2, Bot, User, Menu, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { useChat, ChatMessage } from "@/hooks/useChat";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>(() => crypto.randomUUID());
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, isLoading, isStreaming, sendMessage, clearMessages } = useChat({
    sessionId: activeSessionId,
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(() => {
    if (!input.trim() || isLoading) return;
    
    // Create session on first message
    if (messages.length === 0) {
      const newSession: ChatSession = {
        id: activeSessionId,
        title: input.slice(0, 50) + (input.length > 50 ? "..." : ""),
        createdAt: new Date().toISOString(),
      };
      setSessions(prev => [newSession, ...prev]);
    }
    
    sendMessage(input);
    setInput("");
  }, [input, isLoading, sendMessage, messages.length, activeSessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    setActiveSessionId(newId);
    clearMessages();
    setInput("");
    setSidebarOpen(false);
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    clearMessages(); // In a real app, we'd load messages from DB
    setSidebarOpen(false);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (sessionId === activeSessionId) {
      handleNewChat();
    }
  };

  const SessionList = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Button onClick={handleNewChat} className="w-full" variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sessions.map(session => (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-2 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors",
                session.id === activeSessionId && "bg-accent"
              )}
              onClick={() => handleSelectSession(session.id)}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate text-sm">{session.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSession(session.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No chat history yet
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      <MainNavSidebar />
      
      {/* Desktop sidebar */}
      <div className="hidden md:flex w-64 border-r flex-col bg-card">
        <SessionList />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b bg-card/80 px-4 py-3 flex items-center gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Chat Sessions</SheetTitle>
              </SheetHeader>
              <SessionList />
            </SheetContent>
          </Sheet>
          <Bot className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Elixa AI</span>
        </div>

        {/* Messages area */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                <Bot className="h-16 w-16 text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Welcome to Elixa AI</h2>
                <p className="text-muted-foreground max-w-md">
                  I'm your intelligent assistant. I can help you manage emails, calendar events, and tasks.
                  What would you like to do today?
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble key={message.id} message={message} isStreaming={isStreaming && message === messages[messages.length - 1] && message.role === "assistant"} />
              ))
            )}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="border-t bg-card p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[44px] max-h-[200px] resize-none"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-11 w-11 flex-shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

const MessageBubble = ({ message, isStreaming }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div className={cn(
        "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser ? "bg-secondary" : "bg-primary"
      )}>
        {isUser ? (
          <User className="h-5 w-5 text-secondary-foreground" />
        ) : (
          <Bot className="h-5 w-5 text-primary-foreground" />
        )}
      </div>
      <div className={cn(
        "flex-1 rounded-2xl px-4 py-3 max-w-[80%]",
        isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
      )}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || " "}
            </ReactMarkdown>
          </div>
        )}
        {isStreaming && (
          <span className="inline-block w-1.5 h-5 ml-0.5 bg-current animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default Chat;
