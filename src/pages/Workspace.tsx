import { useState, useEffect, useRef } from "react";
import { Send, Settings, Loader2, Paperclip, Phone, X } from "lucide-react";
import { trackWorkspaceView, trackWorkspaceMessageSent } from '@/utils/analytics';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { VoiceCallDialog } from "@/components/VoiceCallDialog";
import { FileMessageCard } from "@/components/chat/FileMessageCard";
import { useToast } from "@/hooks/use-toast";
import { useBrianChat } from "@/hooks/useBrianChat";
import { ElixaLogo } from "@/components/ElixaLogo";
import { ToolExecutionCard } from "@/components/chat/ToolExecutionCard";
import { ConnectedServicesIndicator } from "@/components/chat/ConnectedServicesIndicator";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Workspace = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { workspaceId, loading: workspaceLoading } = useWorkspace();
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Chat hook
  const { 
    messages, 
    loading: chatLoading, 
    sending, 
    sendMessage,
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
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
    }
  }, [messages, sending]);

  const handleSendMessage = async () => {
    if (!workspaceId) {
      toast({
        variant: "destructive",
        title: "Workspace not ready",
        description: "Your workspace is still being set up. Please try again in a moment.",
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

      const messageContent = input.trim() || (selectedFiles.length > 0 ? `Sent ${selectedFiles.length} file(s)` : '');
      
      setInput("");
      setSelectedFiles([]);

      trackWorkspaceMessageSent('chat');
      await sendMessage(messageContent, fileAttachments.length > 0 ? { files: fileAttachments } : undefined);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Show loading state while checking auth
  if (authLoading || workspaceLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-3">
          <ElixaLogo size={32} />
          <div>
            <div className="font-semibold">Elixa</div>
            <div className="text-xs text-muted-foreground">AI Assistant</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ConnectedServicesIndicator userId={user.id} />
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowVoiceCall(true)}
            title="Voice call"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/connections')}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {chatLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <ElixaLogo size={64} />
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-1">Welcome to Elixa</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  I'm your AI assistant. Connect your services to unlock my full capabilities, or just start chatting!
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {["What can you help me with?", "Connect my services", "Tell me about yourself"].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              const msgTimestamp = (msg as any).timestamp ? new Date((msg as any).timestamp) : new Date();
              
              return (
                <div key={idx} className={`flex gap-3 ${isUser ? "justify-end" : ""}`}>
                  {!isUser && (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ElixaLogo size={20} />
                    </div>
                  )}
                  <div className={isUser ? "flex flex-col items-end max-w-[80%]" : "flex-1 max-w-[80%]"}>
                    <div className={`flex items-center gap-2 mb-1 ${isUser ? "flex-row-reverse" : ""}`}>
                      <span className="font-medium text-sm">{isUser ? "You" : "Elixa"}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(msgTimestamp, "h:mm a")}
                      </span>
                    </div>
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl shadow-sm ${
                        isUser ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className={`text-sm prose prose-sm max-w-none ${isUser ? '[&_*]:!text-primary-foreground' : 'dark:prose-invert'}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                    {(msg as any).metadata?.files && (
                      <div className="mt-2">
                        <FileMessageCard 
                          files={(msg as any).metadata.files} 
                          senderName={isUser ? "You" : "Elixa"}
                        />
                      </div>
                    )}
                    {(msg as any).metadata?.toolExecutions && (msg as any).metadata.toolExecutions.length > 0 && (
                      <div className="mt-2">
                        <ToolExecutionCard executions={(msg as any).metadata.toolExecutions} />
                      </div>
                    )}
                  </div>
                  {isUser && (
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })
          )}
          {sending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <ElixaLogo size={20} />
              </div>
              <div className="flex-1">
                <div className="inline-block px-4 py-2 rounded-2xl bg-muted">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className={`p-4 border-t bg-card/50 backdrop-blur-sm shrink-0 ${isMobile ? 'pb-20' : ''}`}>
        <div className="max-w-3xl mx-auto">
          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg text-sm">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || uploading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder={workspaceId ? "Message Elixa..." : "Setting up..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending || !workspaceId}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && input.trim() && !sending) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              disabled={sending || uploading || (!input.trim() && selectedFiles.length === 0)} 
              onClick={handleSendMessage}
            >
              {sending || uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Voice Call Dialog */}
      <VoiceCallDialog
        open={showVoiceCall}
        onClose={() => setShowVoiceCall(false)}
        agentName="Elixa"
      />
    </div>
  );
};

export default Workspace;
