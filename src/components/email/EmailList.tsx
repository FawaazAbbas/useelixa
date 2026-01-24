import { format, isToday, isYesterday, parseISO } from "date-fns";
import { Star, Mail, MailOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { EmailMessage } from "@/hooks/useEmail";

interface EmailListProps {
  messages: EmailMessage[];
  selectedId: string | null;
  onSelect: (message: EmailMessage) => void;
  onToggleStar: (messageId: string, starred: boolean) => void;
  isLoading: boolean;
}

const formatEmailDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    
    if (isToday(date)) {
      return format(date, "h:mm a");
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, "MMM d");
    }
  } catch {
    return dateStr;
  }
};

const extractSenderName = (from: string) => {
  // Parse "Name <email@domain.com>" format
  const match = from.match(/^(.+?)\s*<.+?>$/);
  if (match) return match[1].replace(/"/g, "");
  
  // If no name, use email prefix
  const emailMatch = from.match(/<(.+?)>/);
  if (emailMatch) return emailMatch[1].split("@")[0];
  
  return from.split("@")[0];
};

export const EmailList = ({
  messages,
  selectedId,
  onSelect,
  onToggleStar,
  isLoading,
}: EmailListProps) => {
  if (isLoading) {
    return (
      <div className="divide-y">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center">
        <div className="p-4 bg-muted rounded-full mb-4">
          <Mail className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No emails in this folder</p>
      </div>
    );
  }

  return (
    <div className="divide-y overflow-auto">
      {messages.map((message) => {
        const isStarred = message.labelIds.includes("STARRED");
        const isSelected = selectedId === message.id;

        return (
          <div
            key={message.id}
            onClick={() => onSelect(message)}
            className={cn(
              "p-4 cursor-pointer transition-colors hover:bg-muted/50",
              isSelected && "bg-primary/5 border-l-2 border-primary",
              message.isUnread && "bg-muted/30"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Unread indicator */}
              <div className="pt-1 flex-shrink-0">
                {message.isUnread ? (
                  <Mail className="h-4 w-4 text-primary" />
                ) : (
                  <MailOpen className="h-4 w-4 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    className={cn(
                      "text-sm truncate",
                      message.isUnread ? "font-semibold" : "font-medium"
                    )}
                  >
                    {extractSenderName(message.from)}
                  </span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatEmailDate(message.date)}
                  </span>
                </div>

                <p
                  className={cn(
                    "text-sm truncate mb-1",
                    message.isUnread ? "font-medium text-foreground" : "text-foreground/80"
                  )}
                >
                  {message.subject}
                </p>

                <p className="text-xs text-muted-foreground truncate">
                  {message.snippet}
                </p>
              </div>

              {/* Star button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(message.id, !isStarred);
                }}
                className={cn(
                  "p-1 rounded-full hover:bg-muted transition-colors flex-shrink-0",
                  isStarred ? "text-star" : "text-muted-foreground hover:text-star"
                )}
              >
                <Star className={cn("h-4 w-4", isStarred && "fill-star")} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
