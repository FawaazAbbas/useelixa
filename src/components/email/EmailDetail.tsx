import { format } from "date-fns";
import { Reply, ReplyAll, Forward, Trash2, Archive, Star, MoreHorizontal, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { EmailMessage } from "@/hooks/useEmail";

interface EmailDetailProps {
  message: EmailMessage | null;
  isLoading: boolean;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
  onTrash: () => void;
  onArchive: () => void;
  onToggleStar: () => void;
  onBack?: () => void;
  isMobile?: boolean;
}

const formatFullDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return format(date, "EEEE, MMMM d, yyyy 'at' h:mm a");
  } catch {
    return dateStr;
  }
};

const extractEmail = (from: string) => {
  const match = from.match(/<(.+?)>/);
  return match ? match[1] : from;
};

const extractName = (from: string) => {
  const match = from.match(/^(.+?)\s*<.+?>$/);
  if (match) return match[1].replace(/"/g, "");
  return from.split("@")[0];
};

const getInitials = (name: string) => {
  return name.slice(0, 2).toUpperCase();
};

export const EmailDetail = ({
  message,
  isLoading,
  onReply,
  onReplyAll,
  onForward,
  onTrash,
  onArchive,
  onToggleStar,
  onBack,
  isMobile = false,
}: EmailDetailProps) => {
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="p-4 bg-muted rounded-full mb-4">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-1">Select an email</h3>
        <p className="text-sm text-muted-foreground">
          Choose an email from the list to view its contents
        </p>
      </div>
    );
  }

  const isStarred = message.labelIds.includes("STARRED");
  const senderName = extractName(message.from);
  const senderEmail = extractEmail(message.from);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b p-4">
        <div className="flex items-center justify-between gap-2 mb-4">
          {isMobile && onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold flex-1 truncate">{message.subject}</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleStar}
              className={cn(isStarred && "text-star")}
            >
              <Star className={cn("h-5 w-5", isStarred && "fill-star")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTrash} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Sender info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(senderName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{senderName}</p>
              <p className="text-xs text-muted-foreground">{senderEmail}</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatFullDate(message.date)}
          </span>
        </div>

        {message.to && (
          <p className="text-xs text-muted-foreground mt-2">
            To: {message.to}
          </p>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
            {message.body || message.snippet}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onReply} className="flex-1 sm:flex-none">
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button variant="outline" onClick={onReplyAll} className="hidden sm:flex">
            <ReplyAll className="h-4 w-4 mr-2" />
            Reply All
          </Button>
          <Button variant="outline" onClick={onForward} className="hidden sm:flex">
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>
    </div>
  );
};
