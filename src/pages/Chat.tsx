import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Plus, Send, Loader2, User, Menu, Trash2, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import ElixaThinking from "@/assets/Elixa-Thinking.png";
import ElixaResponded from "@/assets/Elixa-Responded.png";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { MainNavSidebar } from "@/components/MainNavSidebar";
import { useChat, ChatMessage, ChatFile } from "@/hooks/useChat";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { PendingActionButtons } from "@/components/chat/PendingActionButtons";
import { ChatDeleteDialog } from "@/components/chat/ChatDeleteDialog";
import { ChatActionsMenu } from "@/components/chat/ChatActionsMenu";
import { ChatAnalysisDialog } from "@/components/chat/ChatAnalysisDialog";

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
}

const Chat = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<ChatSession | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { messages, isLoading, isStreaming, isUploading, sendMessage, clearMessages, setMessages, loadSessionMessages } = useChat({
    sessionId: activeSessionId || "",
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("chat_sessions_v2")
          .select("id, title, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (error) throw error;
        
        setSessions(data || []);
        if (data && data.length > 0) {
          setActiveSessionId(data[0].id);
        } else {
          setActiveSessionId(crypto.randomUUID());
        }
      } catch (error) {
        console.error("Error loading sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessions();
  }, [user]);

  useEffect(() => {
    if (activeSessionId && !loadingSessions) {
      const existingSession = sessions.find(s => s.id === activeSessionId);
      if (existingSession) {
        loadSessionMessages(activeSessionId);
      } else {
        clearMessages();
      }
    }
  }, [activeSessionId, loadingSessions]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createSession = async (title: string): Promise<string> => {
    const sessionId = crypto.randomUUID();
    
    if (user) {
      const { error } = await supabase
        .from("chat_sessions_v2")
        .insert({ id: sessionId, user_id: user.id, title: title.slice(0, 100) });

      if (!error) {
        setSessions(prev => [{
          id: sessionId,
          title: title.slice(0, 100),
          updated_at: new Date().toISOString(),
        }, ...prev]);
      }
    }
    
    return sessionId;
  };

  const handleSend = useCallback(async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;
    
    let sessionId = activeSessionId;
    
    if (!sessionId || !sessions.find(s => s.id === sessionId)) {
      const titleText = input.trim() || `File upload - ${selectedFiles[0]?.name || 'attachment'}`;
      sessionId = await createSession(titleText.slice(0, 50) + (titleText.length > 50 ? "..." : ""));
      setActiveSessionId(sessionId);
    }
    
    sendMessage(input, sessionId, selectedFiles.length > 0 ? selectedFiles : undefined);
    setInput("");
    setSelectedFiles([]);
  }, [input, isLoading, sendMessage, activeSessionId, sessions, selectedFiles]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(crypto.randomUUID());
    clearMessages();
    setInput("");
    setSelectedFiles([]);
    setSidebarOpen(false);
  };

  const handleSelectSession = (sessionId: string) => {
    if (sessionId === activeSessionId) return;
    setActiveSessionId(sessionId);
    setSidebarOpen(false);
  };

  const handleDeleteClick = (session: ChatSession, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSessionToDelete(session);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete || !user) return;
    
    // Delete messages first
    await supabase.from("chat_messages_v2").delete().eq("session_id", sessionToDelete.id);
    // Then delete session
    await supabase.from("chat_sessions_v2").delete().eq("id", sessionToDelete.id).eq("user_id", user.id);
    
    setSessions(prev => prev.filter(s => s.id !== sessionToDelete.id));
    if (sessionToDelete.id === activeSessionId) handleNewChat();
    
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
    toast.success("Chat deleted");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleExportChat = () => {
    const currentSession = sessions.find(s => s.id === activeSessionId);
    const content = messages.map(m => {
      const role = m.role === "user" ? "You" : "Elixa";
      const time = new Date(m.timestamp).toLocaleString();
      return `[${time}] ${role}:\n${m.content}\n`;
    }).join("\n---\n\n");

    const blob = new Blob([`# ${currentSession?.title || "Chat Export"}\n\n${content}`], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${currentSession?.title?.slice(0, 30) || "export"}-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported");
  };

  const groupedSessions = sessions.reduce((groups, session) => {
    const date = new Date(session.updated_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    let group: string;
    if (date.toDateString() === today.toDateString()) group = "Today";
    else if (date.toDateString() === yesterday.toDateString()) group = "Yesterday";
    else if (date > weekAgo) group = "This Week";
    else group = "Older";

    if (!groups[group]) groups[group] = [];
    groups[group].push(session);
    return groups;
  }, {} as Record<string, ChatSession[]>);

  const currentSession = sessions.find(s => s.id === activeSessionId);

  const SessionList = () => (
    <div className="flex flex-col h-full bg-card/50">
      <div className="p-4 border-b">
        <Button onClick={handleNewChat} className="w-full" variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {Object.entries(groupedSessions).map(([group, groupSessions]) => (
            <div key={group}>
              <p className="text-xs font-medium text-muted-foreground px-3 py-1 uppercase tracking-wide">{group}</p>
              <div className="space-y-0.5">
                {groupSessions.map(session => (
                  <div
                    key={session.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                      session.id === activeSessionId ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-60" />
                    <span className="flex-1 truncate text-sm">{session.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleDeleteClick(session, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {sessions.length === 0 && !loadingSessions && (
            <p className="text-sm text-muted-foreground text-center py-8">No chat history yet</p>
          )}
          {loadingSessions && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      <MainNavSidebar />
      
      <div className="hidden md:flex w-72 border-r flex-col">
        <SessionList />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex-shrink-0 h-16 border-b bg-card/80 backdrop-blur-sm px-4 flex items-center gap-3">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only"><SheetTitle>Chat Sessions</SheetTitle></SheetHeader>
              <SessionList />
            </SheetContent>
          </Sheet>
          <img src={ElixaResponded} alt="Elixa" className="h-9 w-9 rounded-full object-cover border-2 border-border" />
          <span className="font-semibold text-lg flex-1">Elixa AI</span>
          
          {currentSession && (
            <ChatActionsMenu
              sessionTitle={currentSession.title}
              messages={messages}
              onDelete={() => handleDeleteClick(currentSession)}
              onExport={handleExportChat}
              onAnalyze={() => setAnalysisOpen(true)}
            />
          )}
        </header>

        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center py-12">
                <img 
                  src={ElixaResponded} 
                  alt="Elixa" 
                  className="h-20 w-20 rounded-full object-cover mb-4 border-2 border-border"
                />
                <h2 className="text-2xl font-semibold mb-2">Welcome to Elixa AI</h2>
                <p className="text-muted-foreground max-w-md">
                  I'm your intelligent assistant. I can help you manage emails, calendar events, tasks, notes, and connect with your Stripe and Shopify data. You can also share files with me!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  isStreaming={isStreaming && message === messages[messages.length - 1] && message.role === "assistant"} 
                />
              ))
            )}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-start gap-3">
                <img 
                  src={ElixaThinking} 
                  alt="Elixa thinking" 
                  className="h-9 w-9 rounded-full object-cover flex-shrink-0 border-2 border-border"
                />
                <div className="flex items-center gap-2 text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isUploading ? "Uploading files..." : "Thinking..."}</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-card/80 backdrop-blur-sm p-4">
          <div className="max-w-3xl mx-auto">
            {/* File previews */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm"
                  >
                    {file.type.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5 hover:bg-destructive/10"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-3 items-end">
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || selectedFiles.length >= 5}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[48px] max-h-[200px] resize-none rounded-xl"
                rows={1}
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && selectedFiles.length === 0) || isLoading}
                size="icon"
                className="h-12 w-12 rounded-xl flex-shrink-0"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line • Max 5 files, 10MB each
            </p>
          </div>
        </div>
      </div>

      <ChatDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        chatTitle={sessionToDelete?.title || ""}
      />

      <ChatAnalysisDialog
        open={analysisOpen}
        onOpenChange={setAnalysisOpen}
        messages={messages}
        sessionTitle={currentSession?.title || "Chat"}
      />
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

const MessageBubble = ({ message, isStreaming }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const [actionResolved, setActionResolved] = useState(false);

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      {isUser ? (
        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-secondary-foreground" />
        </div>
      ) : (
        <img 
          src={isStreaming ? ElixaThinking : ElixaResponded} 
          alt={isStreaming ? "Elixa thinking" : "Elixa"} 
          className="h-9 w-9 rounded-full object-cover flex-shrink-0 border-2 border-border"
        />
      )}
      <div className={cn(
        "flex-1 max-w-[85%]",
        isUser && "ml-auto"
      )}>
        <div className={cn(
          "rounded-2xl px-4 py-3",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
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
        
        {/* File attachments */}
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.files.map((file) => (
              <FileAttachment key={file.id} file={file} />
            ))}
          </div>
        )}
        
        {message.pendingAction && !actionResolved && (
          <PendingActionButtons
            action={message.pendingAction}
            onResolved={() => setActionResolved(true)}
          />
        )}
      </div>
    </div>
  );
};

const FileAttachment = ({ file }: { file: ChatFile }) => {
  const isImage = file.type.startsWith("image/");
  
  if (isImage) {
    return (
      <a 
        href={file.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block max-w-[200px] rounded-lg overflow-hidden border hover:opacity-80 transition-opacity"
      >
        <img src={file.url} alt={file.name} className="w-full h-auto" />
      </a>
    );
  }
  
  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
    >
      <FileText className="h-4 w-4 text-muted-foreground" />
      <span className="truncate max-w-[150px]">{file.name}</span>
    </a>
  );
};

export default Chat;
