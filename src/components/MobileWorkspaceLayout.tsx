import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Phone, Settings, MoreVertical, Send, Paperclip, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BrianAvatar } from "@/components/BrianAvatar";
import { TeamMemberAvatar } from "@/components/TeamMemberAvatar";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  senderName?: string;
  senderAvatar?: string;
}

interface MobileChatViewProps {
  chatName: string;
  chatSubtitle?: string;
  messages: Message[];
  onBack: () => void;
  onSend: (message: string) => void;
  isTyping?: boolean;
  disabled?: boolean;
  disabledPlaceholder?: string;
  isBrian?: boolean;
  memberId?: string;
  isManager?: boolean;
  onSettingsClick?: () => void;
  onCallClick?: () => void;
  showWaitlistButton?: boolean;
  onWaitlistClick?: () => void;
}

export const MobileChatView = ({
  chatName,
  chatSubtitle,
  messages,
  onBack,
  onSend,
  isTyping = false,
  disabled = false,
  disabledPlaceholder = "Chat disabled",
  isBrian = false,
  memberId,
  isManager,
  onSettingsClick,
  onCallClick,
  showWaitlistButton,
  onWaitlistClick
}: MobileChatViewProps) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex flex-col z-50">
      {/* Mobile Chat Header */}
      <div className="h-16 bg-card border-b border-border flex items-center px-2 gap-2 shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isBrian ? (
            <BrianAvatar size="md" />
          ) : (
            <TeamMemberAvatar
              memberId={memberId}
              name={chatName}
              isManager={isManager}
              size="md"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground truncate">{chatName}</div>
            {chatSubtitle && (
              <div className="text-xs text-muted-foreground truncate">{chatSubtitle}</div>
            )}
          </div>
        </div>

        <div className="flex items-center shrink-0">
          {onCallClick && (
            <Button variant="ghost" size="icon" onClick={onCallClick}>
              <Phone className="h-5 w-5" />
            </Button>
          )}
          {onSettingsClick && (
            <Button variant="ghost" size="icon" onClick={onSettingsClick}>
              <MoreVertical className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1">
        <div className="p-4 pb-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2",
                msg.isUser ? "justify-end" : "justify-start"
              )}
            >
              {!msg.isUser && (
                <div className="shrink-0">
                  {isBrian ? (
                    <BrianAvatar size="sm" />
                  ) : (
                    <TeamMemberAvatar
                      memberId={memberId}
                      name={msg.senderName || chatName}
                      isManager={isManager}
                      size="sm"
                    />
                  )}
                </div>
              )}
              
              <div
                className={cn(
                  "max-w-[80%] px-4 py-2.5 rounded-2xl shadow-sm",
                  msg.isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {!msg.isUser && msg.senderName && (
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    {msg.senderName}
                  </div>
                )}
                <div 
                  className="text-[15px] leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
                <div className={cn(
                  "text-[10px] mt-1",
                  msg.isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                )}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {msg.isUser && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-start">
              {isBrian ? (
                <BrianAvatar size="sm" />
              ) : (
                <TeamMemberAvatar
                  memberId={memberId}
                  name={chatName}
                  isManager={isManager}
                  size="sm"
                />
              )}
              <div className="px-4 py-3 rounded-2xl bg-muted">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {showWaitlistButton && onWaitlistClick && (
            <div className="flex justify-center py-4">
              <Button
                onClick={onWaitlistClick}
                className="bg-gradient-to-r from-primary to-accent text-white font-semibold px-6 py-3 rounded-xl shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Join the waitlist
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Mobile Input Area - Fixed at bottom with safe area */}
      <div className="border-t border-border bg-card p-3 pb-safe shrink-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}>
        <div className="flex gap-2 items-end">
          <Button variant="ghost" size="icon" className="shrink-0 h-11 w-11">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </Button>
          <Input
            ref={inputRef}
            placeholder={disabled ? disabledPlaceholder : `Message ${chatName}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            className="flex-1 h-11 text-base rounded-full bg-muted border-0 px-4"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            size="icon"
            className="shrink-0 h-11 w-11 rounded-full"
            disabled={disabled || !input.trim()}
            onClick={handleSend}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Mobile chat list item component
interface MobileChatListItemProps {
  name: string;
  subtitle?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
  onClick: () => void;
  isBrian?: boolean;
  memberId?: string;
  isManager?: boolean;
  isSelected?: boolean;
}

export const MobileChatListItem = ({
  name,
  subtitle,
  lastMessage,
  timestamp,
  unreadCount,
  isOnline,
  onClick,
  isBrian,
  memberId,
  isManager,
  isSelected
}: MobileChatListItemProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-4 transition-colors active:bg-muted/80",
        isSelected ? "bg-muted" : "hover:bg-muted/50"
      )}
    >
      <div className="relative shrink-0">
        {isBrian ? (
          <BrianAvatar size="lg" />
        ) : (
          <TeamMemberAvatar
            memberId={memberId}
            name={name}
            isManager={isManager}
            size="lg"
          />
        )}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-foreground truncate">{name}</span>
          {timestamp && (
            <span className="text-xs text-muted-foreground shrink-0">{timestamp}</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground truncate">
            {lastMessage || subtitle || ""}
          </span>
          {unreadCount && unreadCount > 0 && (
            <span className="shrink-0 min-w-[20px] h-5 px-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
