import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Paperclip, X, LogOut, Trash2, Link } from "lucide-react";
import { trackWorkspaceView, trackWorkspaceMessageSent } from '@/utils/analytics';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { FileMessageCard } from "@/components/chat/FileMessageCard";
import { useToast } from "@/hooks/use-toast";
import { useBrianChat } from "@/hooks/useBrianChat";
import { ElixaLogo } from "@/components/ElixaLogo";
import { ToolExecutionCard } from "@/components/chat/ToolExecutionCard";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Workspace = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { workspaceId, loading: workspaceLoading } = useWorkspace();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const { 
    messages, 
    loading: chatLoading, 
    sending, 
    sendMessage,
    clearConversation,
  } = useBrianChat(user?.id, workspaceId);
  const [input, setInput] = useState("");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Track workspace view on mount
  useEffect(() => {
    if (user) {
      trackWorkspaceView('main');
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, sending]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSendMessage = async () => {
    if (!workspaceId) {
      toast({
        variant: "destructive",
        title: "Workspace not ready",
        description: "Please wait a moment while we set up your workspace.",
      });
      return;
    }

    if ((!input.trim() && selectedFiles.length === 0) || sending) return;

    setUploading(true);
    let fileAttachments: any[] = [];

    try {
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const filePath = `${user?.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { error } = await supabase.storage
            .from('chat-files')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) throw error;

          const { data: { publicUrl } } = supabase.storage
            .from('chat-files')
            .getPublicUrl(filePath);

          return {
            name: file.name,
            url: publicUrl,
            type: file.type,
            size: file.size
          };
        });

        fileAttachments = await Promise.all(uploadPromises);
      }

      const messageContent = input.trim() || (selectedFiles.length > 0 ? `Attached ${selectedFiles.length} file(s)` : '');
      
      setInput("");
      setSelectedFiles([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }

      trackWorkspaceMessageSent('chat');
      await sendMessage(messageContent, fileAttachments.length > 0 ? { files: fileAttachments } : undefined);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedFiles.length > 10) {
      toast({
        variant: "destructive",
        title: "Too many files",
        description: "You can attach up to 10 files at a time.",
      });
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim() && !sending) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Loading state
  if (authLoading || workspaceLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
        <div className="flex items-center gap-3">
          <ElixaLogo size={28} />
          <span className="font-semibold text-foreground">Elixa</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/connections')}
            className="text-muted-foreground hover:text-foreground"
          >
            <Link className="h-4 w-4 mr-2" />
            Connections
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={clearConversation}
                className="text-muted-foreground"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear chat
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/auth');
                }}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {chatLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ElixaLogo size={40} />
              </div>
              <div className="text-center max-w-md">
                <h2 className="text-xl font-semibold text-foreground mb-2">Welcome to Elixa</h2>
                <p className="text-muted-foreground text-sm">
                  I'm your AI assistant. Ask me anything, or connect your services to unlock my full capabilities.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {["What can you help me with?", "Connect my services", "Tell me about yourself"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(suggestion)}
                    className="text-sm"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => {
                const isUser = msg.role === "user";
                const msgTimestamp = msg.timestamp ? new Date(msg.timestamp) : new Date();
                
                return (
                  <div key={idx} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
                    {!isUser && (
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <ElixaLogo size={18} />
                      </div>
                    )}
                    
                    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[85%] md:max-w-[75%]`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">
                          {isUser ? "You" : "Elixa"} • {format(msgTimestamp, "h:mm a")}
                        </span>
                      </div>
                      
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          isUser 
                            ? "bg-primary text-primary-foreground rounded-br-md" 
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        <div className={`text-sm prose prose-sm max-w-none ${
                          isUser 
                            ? '[&_*]:!text-primary-foreground [&_a]:!text-primary-foreground/80' 
                            : 'dark:prose-invert'
                        }`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      
                      {msg.metadata?.files && msg.metadata.files.length > 0 && (
                        <div className="mt-2">
                          <FileMessageCard 
                            files={msg.metadata.files} 
                            senderName={isUser ? "You" : "Elixa"}
                          />
                        </div>
                      )}
                      
                      {msg.metadata?.toolExecutions && msg.metadata.toolExecutions.length > 0 && (
                        <div className="mt-2">
                          <ToolExecutionCard executions={msg.metadata.toolExecutions} />
                        </div>
                      )}
                    </div>
                    
                    {isUser && (
                      <Avatar className="h-8 w-8 flex-shrink-0 mt-1">
                        <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              
              {sending && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <ElixaLogo size={18} />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-muted-foreground mb-1">Elixa</span>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className={`border-t border-border bg-card p-4 shrink-0 ${isMobile ? 'pb-6' : ''}`}>
        <div className="max-w-3xl mx-auto">
          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-sm"
                >
                  <span className="truncate max-w-[150px] text-foreground">{file.name}</span>
                  <button 
                    onClick={() => removeFile(index)} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2 items-end">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
            />
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || uploading}
              className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <Textarea
              ref={textareaRef}
              placeholder={workspaceId ? "Message Elixa..." : "Setting up workspace..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              className="flex-1 min-h-[44px] max-h-[200px] resize-none py-3 text-sm"
              rows={1}
            />
            
            <Button 
              onClick={handleSendMessage}
              disabled={sending || uploading || (!input.trim() && selectedFiles.length === 0)} 
              size="icon"
              className="shrink-0 h-10 w-10"
            >
              {sending || uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center mt-3">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default Workspace;
