import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Paperclip, X, Phone, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBrianChat } from "@/hooks/useBrianChat";
import { WaitlistDialog } from "@/components/WaitlistDialog";
import { FileMessageCard } from "@/components/chat/FileMessageCard";
import { BrianAvatar } from "@/components/BrianAvatar";
import { AgentRecommendationCard } from "@/components/chat/AgentRecommendationCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BrianChatProps {
  userId: string;
  workspaceId: string;
}

export const BrianChat = ({ userId, workspaceId }: BrianChatProps) => {
  const { messages, loading, sending, sendMessage } = useBrianChat(userId, workspaceId);
  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showWaitlistDialog, setShowWaitlistDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.length === 0) || sending || uploading) return;
    
    setUploading(true);
    let fileAttachments: any[] = [];

    try {
      // Upload files if any
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const filePath = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          
          const { data, error } = await supabase.storage
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

      const messageText = input.trim() || (selectedFiles.length > 0 ? `Sent ${selectedFiles.length} file(s)` : '');
      setInput("");
      setSelectedFiles([]);
      
      await sendMessage(messageText, fileAttachments.length > 0 ? { files: fileAttachments } : undefined);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to send message with files'
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
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4 max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <BrianAvatar size="xl" className="mx-auto" />
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
                  <BrianAvatar size="md" rounded="full" />
                )}
                
                <div className="flex-1 max-w-[80%]">
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div 
                        className="prose prose-sm dark:prose-invert max-w-none 
                          [&>p]:mb-2 [&>p]:leading-relaxed
                          [&_ul]:my-2 [&_ul]:pl-4 [&_ul]:list-disc
                          [&_ol]:my-2 [&_ol]:pl-4 [&_ol]:list-decimal
                          [&_li]:mb-1
                          [&_strong]:font-semibold
                          [&_br]:block"
                        dangerouslySetInnerHTML={{ __html: msg.content }}
                      />
                    ) : (
                      <div 
                        className="text-sm [&_*]:!text-primary-foreground"
                        dangerouslySetInnerHTML={{ __html: msg.content }}
                      />
                    )}
                  </div>
                  
                  {/* Show timestamp if available */}
                  {msg.timestamp && (
                    <div className={`text-xs text-muted-foreground mt-1 ${msg.role === "user" ? "text-right" : ""}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  
                  {msg.metadata?.files && (
                    <div className="mt-2">
                      <FileMessageCard 
                        files={msg.metadata.files}
                        senderName={msg.role === "user" ? "You" : "Brian"}
                      />
                    </div>
                  )}
                  
                  {/* Agent Recommendation Card */}
                  {msg.recommendedAgent && (
                    <AgentRecommendationCard
                      agentId={msg.recommendedAgent.id}
                      agentName={msg.recommendedAgent.name}
                      description={msg.recommendedAgent.description}
                      category={msg.recommendedAgent.category}
                      rating={msg.recommendedAgent.rating}
                    />
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
                <BrianAvatar size="md" rounded="full" />
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-4 pb-20 md:pb-4">
          <div className="space-y-2 max-w-3xl mx-auto">
            {/* File Preview */}
            {selectedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg text-sm"
                  >
                    <Paperclip className="h-4 w-4" />
                    <span className="max-w-[150px] truncate">{file.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-5 w-5"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="flex gap-2">
              <input
                type="file"
                id="brian-file-upload"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading || sending}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={() => setShowWaitlistDialog(true)}
                disabled={uploading || sending}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setShowWaitlistDialog(true)}
                title="Start voice call"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Brian anything about your workspace..."
                disabled={sending || uploading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={sending || uploading || (!input.trim() && selectedFiles.length === 0)}
                size="icon"
              >
                {(sending || uploading) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Waitlist Dialog */}
      <WaitlistDialog
        open={showWaitlistDialog}
        onOpenChange={setShowWaitlistDialog}
      />
    </>
  );
};
