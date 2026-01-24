import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Plus, Send, Loader2, User, Menu, Trash2, Paperclip, X, FileText, Image as ImageIcon, Copy, Check, RefreshCw, Pin, PinOff, Search, Share2, FolderOpen, MessageCircle } from "lucide-react";
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
import { ModelSelector, AI_MODELS } from "@/components/chat/ModelSelector";
import { CreditPurchaseDialog } from "@/components/chat/CreditPurchaseDialog";
import { StopButton } from "@/components/chat/StopButton";
import { ChatSearch } from "@/components/chat/ChatSearch";
import { CodeBlock } from "@/components/chat/CodeBlock";
import { EditableMessage, EditButton } from "@/components/chat/EditableMessage";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { VoiceButton } from "@/components/chat/VoiceButton";
import { SuggestedPrompts } from "@/components/chat/SuggestedPrompts";
import { MessageFeedback } from "@/components/chat/MessageFeedback";
import { ShareChatDialog } from "@/components/chat/ShareChatDialog";
import { ChatFolders, ChatFolder } from "@/components/chat/ChatFolders";
import { useChatFolders } from "@/hooks/useChatFolders";
import { GeneratedImage } from "@/components/chat/GeneratedImage";
import { ThreadView, ThreadIndicator } from "@/components/chat/ThreadView";
import { useMentionAutocomplete, MentionPopover } from "@/components/chat/MentionAutocomplete";
import { fetchTeamMembers, parseMentions, notifyMentionedUsers, type TeamMember } from "@/utils/mentions";
import { ChatWelcome } from "@/components/chat/ChatWelcome";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
  is_pinned: boolean;
  selected_model?: string;
  folder_id?: string | null;
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
  const [selectedModel, setSelectedModel] = useState(AI_MODELS.find(m => m.default)?.id || "google/gemini-2.5-flash");
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Thread state
  const [threadOpen, setThreadOpen] = useState(false);
  const [threadParentMessage, setThreadParentMessage] = useState<ChatMessage | null>(null);
  const [threadReplies, setThreadReplies] = useState<ChatMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);

  // Team members for mentions
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // AI Paused state
  const [aiPausedError, setAiPausedError] = useState(false);

  // Chat folders hook
  const { folders, setFolders, expandedFolders, toggleFolder, moveSessionToFolder } = useChatFolders(user?.id);

  const { messages, isLoading, isStreaming, isUploading, sendMessage, clearMessages, setMessages, loadSessionMessages, deleteMessage, stopGeneration, editAndResendMessage, loadThreadReplies, sendThreadReply } = useChat({
    sessionId: activeSessionId || "",
    onError: (error) => toast.error(error.message),
  });

  // Mentions autocomplete hook
  const {
    showMentions,
    setShowMentions,
    handleInputChange: handleMentionInputChange,
    insertMention,
    filteredMembers,
  } = useMentionAutocomplete(teamMembers);

  // Load team members for mentions
  useEffect(() => {
    if (user) {
      fetchTeamMembers(user.id).then(setTeamMembers);
    }
  }, [user]);


  const handleRetry = useCallback(async (messageIndex: number) => {
    // Find the user message before this assistant message
    const assistantMessage = messages[messageIndex];
    if (assistantMessage.role !== "assistant") return;

    // Find the preceding user message
    let userMessageIndex = messageIndex - 1;
    while (userMessageIndex >= 0 && messages[userMessageIndex].role !== "user") {
      userMessageIndex--;
    }
    
    if (userMessageIndex < 0) return;
    
    const userMessage = messages[userMessageIndex];
    
    try {
      // Delete the assistant message
      await deleteMessage(assistantMessage.id);
      
      // Resend the user's message
      sendMessage(userMessage.content, activeSessionId || undefined, undefined);
    } catch (error) {
      toast.error("Failed to retry");
    }
  }, [messages, deleteMessage, sendMessage, activeSessionId]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      toast.success("Message deleted");
    } catch {
      toast.error("Failed to delete message");
    }
  }, [deleteMessage]);

  useEffect(() => {
    const loadSessions = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("chat_sessions_v2")
          .select("id, title, updated_at, is_pinned, selected_model, folder_id")
          .eq("user_id", user.id)
          .order("is_pinned", { ascending: false })
          .order("updated_at", { ascending: false });

        if (error) throw error;
        
        setSessions((data || []).map(d => ({ 
          ...d, 
          is_pinned: d.is_pinned ?? false,
          selected_model: d.selected_model ?? undefined,
          folder_id: d.folder_id ?? null
        })));
        if (data && data.length > 0) {
          setActiveSessionId(data[0].id);
          // Restore model selection from session
          if (data[0].selected_model) {
            setSelectedModel(data[0].selected_model);
          }
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
        // Restore model from session
        if (existingSession.selected_model) {
          setSelectedModel(existingSession.selected_model);
        }
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
    // Use setTimeout to ensure DOM is updated before scrolling
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    }, 50);
    return () => clearTimeout(timer);
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
          is_pinned: false,
        }, ...prev]);
      }
    }
    
    return sessionId;
  };

  const handleTogglePin = async (session: ChatSession, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) return;

    const newPinnedState = !session.is_pinned;
    
    const { error } = await supabase
      .from("chat_sessions_v2")
      .update({ is_pinned: newPinnedState })
      .eq("id", session.id)
      .eq("user_id", user.id);

    if (!error) {
      setSessions(prev => {
        const updated = prev.map(s => 
          s.id === session.id ? { ...s, is_pinned: newPinnedState } : s
        );
        // Re-sort: pinned first, then by updated_at
        return updated.sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });
      });
      toast.success(newPinnedState ? "Chat pinned" : "Chat unpinned");
    }
  };

  const handleModelChange = useCallback(async (modelId: string) => {
    setSelectedModel(modelId);
    
    // Persist to session if exists
    if (activeSessionId && user) {
      await supabase
        .from("chat_sessions_v2")
        .update({ selected_model: modelId })
        .eq("id", activeSessionId)
        .eq("user_id", user.id);
    }
  }, [activeSessionId, user]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && selectedFiles.length === 0) || isLoading) return;
    
    // Reset AI paused error when user tries to send
    setAiPausedError(false);
    
    let sessionId = activeSessionId;
    
    if (!sessionId || !sessions.find(s => s.id === sessionId)) {
      const titleText = input.trim() || `File upload - ${selectedFiles[0]?.name || 'attachment'}`;
      sessionId = await createSession(titleText.slice(0, 50) + (titleText.length > 50 ? "..." : ""));
      setActiveSessionId(sessionId);
    }

    // Parse mentions from input
    const mentionedUserIds = parseMentions(input, teamMembers);
    
    const result = await sendMessage(input, sessionId, selectedFiles.length > 0 ? selectedFiles : undefined, selectedModel);
    
    // Check for insufficient credits error
    if (result && typeof result === 'object' && 'error' in result) {
      if (result.error === "insufficient_credits") {
        setCreditDialogOpen(true);
      } else if (result.error === "ai_paused") {
        setAiPausedError(true);
        toast.error("AI Paused", {
          description: "The AI assistant has been temporarily paused by your organization admin.",
          duration: 5000,
        });
      }
    } else if (mentionedUserIds.length > 0 && sessionId && user) {
      // Notify mentioned users after successful send
      await notifyMentionedUsers(mentionedUserIds, input, user.email || "", sessionId);
    }
    
    setInput("");
    setSelectedFiles([]);
  }, [input, isLoading, sendMessage, activeSessionId, sessions, selectedFiles, selectedModel, teamMembers, user]);

  // Thread handlers
  const handleOpenThread = useCallback(async (message: ChatMessage) => {
    setThreadParentMessage(message);
    setThreadLoading(true);
    setThreadOpen(true);
    
    const replies = await loadThreadReplies(message.id);
    setThreadReplies(replies);
    setThreadLoading(false);
  }, [loadThreadReplies]);

  const handleSendThreadReply = useCallback(async (content: string) => {
    if (!threadParentMessage || !activeSessionId) return;
    
    const mentionedUserIds = parseMentions(content, teamMembers);
    const reply = await sendThreadReply(threadParentMessage.id, activeSessionId, content, mentionedUserIds);
    
    if (reply) {
      setThreadReplies(prev => [...prev, reply]);
      
      // Notify mentioned users
      if (mentionedUserIds.length > 0 && user) {
        await notifyMentionedUsers(mentionedUserIds, content, user.email || "", activeSessionId);
      }
    }
  }, [threadParentMessage, activeSessionId, sendThreadReply, teamMembers, user]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = useCallback(() => {
    setActiveSessionId(crypto.randomUUID());
    clearMessages();
    setInput("");
    setSelectedFiles([]);
    setSidebarOpen(false);
    setSearchOpen(false);
    setEditingMessageId(null);
  }, [clearMessages]);

  // Handle edit and resend
  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    try {
      await editAndResendMessage(messageId, newContent, activeSessionId || undefined, selectedModel);
      setEditingMessageId(null);
    } catch (error) {
      toast.error("Failed to edit message");
    }
  }, [editAndResendMessage, activeSessionId, selectedModel]);

  // Keyboard shortcuts - must be after handleNewChat is defined
  useKeyboardShortcuts({
    onNewChat: handleNewChat,
    onSearch: () => setSearchOpen(prev => !prev),
    onFocusInput: () => textareaRef.current?.focus(),
    onEscape: () => {
      if (searchOpen) setSearchOpen(false);
      else if (editingMessageId) setEditingMessageId(null);
      else if (isStreaming) stopGeneration();
    },
  });

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

  // Separate pinned and unpinned sessions
  const pinnedSessions = sessions.filter(s => s.is_pinned);
  const unpinnedSessions = sessions.filter(s => !s.is_pinned);

  const groupedSessions = unpinnedSessions.reduce((groups, session) => {
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
      <div className="p-4 border-b space-y-2">
        <Button onClick={handleNewChat} className="w-full" variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Chat
        </Button>
        <Button 
          onClick={() => setSearchOpen(true)} 
          className="w-full justify-start" 
          variant="ghost" 
          size="sm"
        >
          <Search className="h-4 w-4 mr-2" />
          Search chats
          <span className="ml-auto text-xs text-muted-foreground">⌘K</span>
        </Button>
      </div>
      
      {/* Search Panel */}
      {searchOpen && user && (
        <ChatSearch
          userId={user.id}
          onSelectSession={handleSelectSession}
          onClose={() => setSearchOpen(false)}
        />
      )}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {/* Pinned chats section */}
          {pinnedSessions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground px-3 py-1 uppercase tracking-wide flex items-center gap-1">
                <Pin className="h-3 w-3" /> Pinned
              </p>
              <div className="space-y-0.5">
                {pinnedSessions.map(session => (
                  <div
                    key={session.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors min-w-0",
                      session.id === activeSessionId ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <Pin className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="flex-1 truncate text-sm min-w-0">{session.title}</span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleTogglePin(session, e)}
                        title="Unpin"
                      >
                        <PinOff className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleDeleteClick(session, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Regular chats grouped by date */}
          {Object.entries(groupedSessions).map(([group, groupSessions]) => (
            <div key={group}>
              <p className="text-xs font-medium text-muted-foreground px-3 py-1 uppercase tracking-wide">{group}</p>
              <div className="space-y-0.5">
                {groupSessions.map(session => (
                  <div
                    key={session.id}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors min-w-0",
                      session.id === activeSessionId ? "bg-primary/10 text-primary" : "hover:bg-muted"
                    )}
                    onClick={() => handleSelectSession(session.id)}
                  >
                    <MessageSquare className="h-4 w-4 flex-shrink-0 opacity-60" />
                    <span className="flex-1 truncate text-sm min-w-0">{session.title}</span>
                    <div className="flex items-center gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleTogglePin(session, e)}
                        title="Pin"
                      >
                        <Pin className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100"
                        onClick={(e) => handleDeleteClick(session, e)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
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
          <div className="p-1 bg-muted rounded-full flex-shrink-0">
            <img src={ElixaResponded} alt="Elixa" className="h-8 w-8 rounded-full object-cover border-2 border-muted" />
          </div>
          <div className="flex-1" />
          
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
            className="hidden sm:flex"
          />
          
          {currentSession && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setShareDialogOpen(true)}
                title="Share chat"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <ChatActionsMenu
                sessionTitle={currentSession.title}
                messages={messages}
                onDelete={() => handleDeleteClick(currentSession)}
                onExport={handleExportChat}
                onAnalyze={() => setAnalysisOpen(true)}
              />
            </>
          )}
        </header>

        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-6 px-4">
            {/* AI Paused Banner */}
            {aiPausedError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>AI Paused</AlertTitle>
                <AlertDescription>
                  The AI assistant has been temporarily disabled by your organization administrator.
                </AlertDescription>
              </Alert>
            )}
            
            {messages.length === 0 ? (
              <ChatWelcome 
                onQuickAction={(prompt) => {
                  setInput(prompt);
                  textareaRef.current?.focus();
                }}
              />
            ) : (
              messages.map((message, index) => {
                // Check if we should show a time divider
                const showTimeDivider = index > 0 && (() => {
                  const prevMessage = messages[index - 1];
                  const prevTime = new Date(prevMessage.timestamp);
                  const currentTime = new Date(message.timestamp);
                  const diffMinutes = (currentTime.getTime() - prevTime.getTime()) / (1000 * 60);
                  return diffMinutes > 30; // Show divider if more than 30 minutes apart
                })();

                const formatDividerTime = (timestamp: string) => {
                  const date = new Date(timestamp);
                  const today = new Date();
                  const yesterday = new Date(today);
                  yesterday.setDate(yesterday.getDate() - 1);

                  if (date.toDateString() === today.toDateString()) {
                    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                  } else if (date.toDateString() === yesterday.toDateString()) {
                    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
                  } else {
                    return date.toLocaleDateString([], { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  }
                };

                return (
                  <div key={message.id}>
                    {showTimeDivider && (
                      <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground px-2">
                          {formatDividerTime(message.timestamp)}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                    )}
                    <MessageBubble 
                      message={message} 
                      isStreaming={isStreaming && message === messages[messages.length - 1] && message.role === "assistant"}
                      onDelete={() => handleDeleteMessage(message.id)}
                      onRetry={message.role === "assistant" ? () => handleRetry(index) : undefined}
                      onEdit={message.role === "user" ? (newContent) => handleEditMessage(message.id, newContent) : undefined}
                      isEditing={editingMessageId === message.id}
                      onStartEdit={() => setEditingMessageId(message.id)}
                      onCancelEdit={() => setEditingMessageId(null)}
                      isLoading={isLoading}
                      onOpenThread={() => handleOpenThread(message)}
                      threadCount={(message as any).thread_count || 0}
                    />
                  </div>
                );
              })
            )}
            
            {/* Loading indicator or Stop button */}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-start gap-3">
                <img 
                  src={ElixaThinking} 
                  alt="Elixa thinking" 
                  className="h-9 w-9 rounded-full object-cover flex-shrink-0 border-2 border-muted bg-muted"
                />
                <div className="flex items-center gap-2 text-muted-foreground py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isUploading ? "Uploading files..." : "Thinking..."}</span>
                </div>
              </div>
            )}
            
            {/* Stop generation button */}
            {isStreaming && (
              <div className="flex justify-center py-2">
                <StopButton onStop={stopGeneration} />
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="border-t bg-card/80 backdrop-blur-sm p-4">
          <div className="w-full px-4">
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
              
              {/* Voice button */}
              <VoiceButton
                disabled={isLoading}
                onTranscript={(text) => setInput(prev => prev + " " + text)}
              />
              
              <MentionPopover
                open={showMentions}
                onOpenChange={setShowMentions}
                members={filteredMembers}
                onSelect={(member) => insertMention(member, input, setInput)}
                position={{ top: 0, left: 0 }}
              >
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    handleMentionInputChange(e.target.value, e.target.selectionStart || 0, textareaRef.current);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message... (@ to mention, ⌘/ to focus)"
                  className="min-h-[48px] max-h-[200px] resize-none rounded-xl"
                  rows={1}
                  disabled={isLoading}
                />
              </MentionPopover>
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

      <CreditPurchaseDialog
        open={creditDialogOpen}
        onOpenChange={setCreditDialogOpen}
      />

      {currentSession && (
        <ShareChatDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          sessionId={currentSession.id}
          sessionTitle={currentSession.title}
        />
      )}

      {/* Thread View */}
      <ThreadView
        open={threadOpen}
        onOpenChange={setThreadOpen}
        parentMessage={threadParentMessage}
        replies={threadReplies}
        onSendReply={handleSendThreadReply}
        isLoading={threadLoading}
      />
    </div>
  );
};

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  onDelete?: () => void;
  onRetry?: () => void;
  onEdit?: (newContent: string) => void;
  isEditing?: boolean;
  onStartEdit?: () => void;
  onCancelEdit?: () => void;
  isLoading?: boolean;
  onOpenThread?: () => void;
  threadCount?: number;
}

const MessageBubble = ({ 
  message, 
  isStreaming, 
  onDelete, 
  onRetry, 
  onEdit,
  isEditing,
  onStartEdit,
  onCancelEdit,
  isLoading,
  onOpenThread,
  threadCount = 0
}: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const [actionResolved, setActionResolved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Custom components for ReactMarkdown to render code blocks with syntax highlighting
  const markdownComponents = {
    code({ className, children, ...props }: { className?: string; children?: React.ReactNode }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeContent = String(children).replace(/\n$/, '');
      
      // Check if this is a code block (has language) or inline code
      const isBlock = match || codeContent.includes('\n');
      
      if (isBlock) {
        return (
          <CodeBlock language={match?.[1] || 'text'}>
            {codeContent}
          </CodeBlock>
        );
      }
      
      // Inline code
      return (
        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
  };

  return (
    <div className={cn("group flex items-start gap-3 w-full", isUser && "flex-row-reverse")}>
      {isUser ? (
        <div className="h-9 w-9 rounded-full bg-muted border-2 border-muted flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-muted-foreground" />
        </div>
      ) : (
        <img 
          src={isStreaming ? ElixaThinking : ElixaResponded} 
          alt={isStreaming ? "Elixa thinking" : "Elixa"} 
          className="h-9 w-9 rounded-full object-cover flex-shrink-0 border-2 border-muted bg-muted"
        />
      )}
      <div className={cn(
        "max-w-[85%]",
        isUser ? "ml-auto" : "mr-auto"
      )}>
        {/* Message content or edit form */}
        {isEditing && onEdit && onCancelEdit ? (
          <EditableMessage
            content={message.content}
            onSave={onEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <div className={cn(
            "rounded-2xl px-4 py-3",
            isUser ? "bg-muted text-foreground" : "bg-muted"
          )}>
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none [&_pre]:p-0 [&_pre]:m-0 [&_pre]:bg-transparent">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {message.content || " "}
                </ReactMarkdown>
              </div>
            )}
            {isStreaming && (
              <span className="inline-block w-1.5 h-5 ml-0.5 bg-current animate-pulse" />
            )}
          </div>
        )}
        
        {/* Timestamp and actions */}
        {!isEditing && (
          <div className={cn(
            "flex items-center gap-2 mt-1 text-xs text-muted-foreground",
            isUser ? "flex-row-reverse justify-start" : "justify-start"
          )}>
            <span>{formatTime(message.timestamp)}</span>
            
            {/* Action buttons - show on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleCopy}
                title="Copy message"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-primary" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
              
              {/* Edit button for user messages */}
              {isUser && onStartEdit && !isLoading && (
                <EditButton onClick={onStartEdit} />
              )}
              
              {/* Feedback buttons for assistant messages */}
              {!isUser && !isStreaming && (
                <MessageFeedback messageId={message.id} />
              )}
              
              {!isUser && onRetry && !isStreaming && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onRetry}
                  disabled={isLoading}
                  title="Regenerate response"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
              
              {onOpenThread && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={onOpenThread}
                  title="Reply in thread"
                >
                  <MessageCircle className="h-3 w-3" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:text-destructive"
                onClick={onDelete}
                title="Delete message"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Thread indicator */}
        {threadCount > 0 && onOpenThread && (
          <ThreadIndicator replyCount={threadCount} onClick={onOpenThread} />
        )}
        
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
