import { useState } from "react";
import { MessageSquare, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { ChatMessage } from "@/hooks/useChat";

interface ThreadViewProps {
  parentMessage: ChatMessage | null;
  replies: ChatMessage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendReply: (content: string) => void;
  isLoading: boolean;
}

export const ThreadView = ({
  parentMessage,
  replies,
  open,
  onOpenChange,
  onSendReply,
  isLoading,
}: ThreadViewProps) => {
  const [replyContent, setReplyContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isLoading) return;
    onSendReply(replyContent);
    setReplyContent("");
  };

  if (!parentMessage) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Thread
            <Badge variant="secondary" className="ml-2">
              {replies.length} {replies.length === 1 ? "reply" : "replies"}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {/* Parent message */}
          <div className="py-4 border-b">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                {parentMessage.role === "user" ? "U" : "AI"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {parentMessage.role === "user" ? "You" : "Assistant"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(parentMessage.timestamp), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{parentMessage.content}</p>
              </div>
            </div>
          </div>

          {/* Replies */}
          <div className="py-4 space-y-4">
            {replies.map((reply) => (
              <div key={reply.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {reply.role === "user" ? "U" : "AI"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {reply.role === "user" ? "You" : "Assistant"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(reply.timestamp), "MMM d, h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Reply input */}
        <form onSubmit={handleSubmit} className="border-t pt-4 mt-auto">
          <div className="flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Reply to thread..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <Button type="submit" disabled={!replyContent.trim() || isLoading}>
              Reply
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

// Thread indicator button for messages
interface ThreadIndicatorProps {
  replyCount: number;
  onClick: () => void;
}

export const ThreadIndicator = ({ replyCount, onClick }: ThreadIndicatorProps) => {
  if (replyCount === 0) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-xs text-primary hover:underline mt-2"
    >
      <MessageSquare className="h-3 w-3" />
      {replyCount} {replyCount === 1 ? "reply" : "replies"}
      <ChevronRight className="h-3 w-3" />
    </button>
  );
};
