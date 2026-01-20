import { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBrianChat } from "@/hooks/useBrianChat";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ConnectedServicesIndicator } from "@/components/chat/ConnectedServicesIndicator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BrianChatProps {
  userId: string;
  workspaceId: string;
}

export const BrianChat = ({ userId, workspaceId }: BrianChatProps) => {
  const { messages, loading, sending, sendMessage } = useBrianChat(userId, workspaceId);
  const [uploading, setUploading] = useState(false);
  const [connectedServicesCount, setConnectedServicesCount] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Scroll to bottom on new messages
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, sending]);

  // Fetch connected services count for empty state
  useEffect(() => {
    const fetchConnectionsCount = async () => {
      if (!userId) return;
      
      const { count } = await supabase
        .from("user_credentials")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      
      setConnectedServicesCount(count ?? 0);
    };
    
    fetchConnectionsCount();
    
    // Re-fetch on window focus
    const handleFocus = () => fetchConnectionsCount();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [userId]);

  const handleSend = async (content: string, files?: File[]) => {
    if ((!content && !files?.length) || sending || uploading) return;

    setUploading(true);
    let fileAttachments: any[] = [];

    try {
      // Upload files if any
      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const fileExt = file.name.split(".").pop();
          const filePath = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

          const { error } = await supabase.storage
            .from("chat-files")
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) throw error;

          const {
            data: { publicUrl },
          } = supabase.storage.from("chat-files").getPublicUrl(filePath);

          return {
            name: file.name,
            url: publicUrl,
            type: file.type,
            size: file.size,
          };
        });

        fileAttachments = await Promise.all(uploadPromises);
      }

      const messageText = content || (files?.length ? `Sent ${files.length} file(s)` : "");
      await sendMessage(messageText, fileAttachments.length > 0 ? { files: fileAttachments } : undefined);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send message",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSuggestionClick = (message: string) => {
    handleSend(message);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Connected Services Indicator */}
      <div className="border-b border-border/50 px-4 py-2">
        <ConnectedServicesIndicator userId={userId} />
      </div>
      
      {messages.length === 0 ? (
        <ChatEmptyState 
          onSuggestionClick={handleSuggestionClick} 
          hasConnectedServices={(connectedServicesCount ?? 0) > 0}
        />
      ) : (
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="pb-4">
            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                metadata={msg.metadata}
                recommendedAgent={msg.recommendedAgent}
              />
            ))}

            {sending && (
              <ChatMessage
                role="assistant"
                content=""
                isStreaming
              />
            )}
          </div>
        </ScrollArea>
      )}

      <ChatInput
        onSend={handleSend}
        disabled={sending || uploading}
        placeholder="Message Elixa..."
      />
    </div>
  );
};
