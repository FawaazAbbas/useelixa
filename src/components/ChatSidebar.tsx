import { Plus, MessageSquare, Trash2, MoreHorizontal, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { ChatSession } from "@/hooks/useMultiChat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface ChatSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, title: string) => void;
}

function groupSessionsByDate(sessions: ChatSession[]) {
  const groups: { label: string; sessions: ChatSession[] }[] = [];
  
  const today: ChatSession[] = [];
  const yesterday: ChatSession[] = [];
  const thisWeek: ChatSession[] = [];
  const thisMonth: ChatSession[] = [];
  const older: ChatSession[] = [];

  sessions.forEach(session => {
    const date = new Date(session.updated_at);
    if (isToday(date)) {
      today.push(session);
    } else if (isYesterday(date)) {
      yesterday.push(session);
    } else if (isThisWeek(date)) {
      thisWeek.push(session);
    } else if (isThisMonth(date)) {
      thisMonth.push(session);
    } else {
      older.push(session);
    }
  });

  if (today.length > 0) groups.push({ label: "Today", sessions: today });
  if (yesterday.length > 0) groups.push({ label: "Yesterday", sessions: yesterday });
  if (thisWeek.length > 0) groups.push({ label: "This Week", sessions: thisWeek });
  if (thisMonth.length > 0) groups.push({ label: "This Month", sessions: thisMonth });
  if (older.length > 0) groups.push({ label: "Older", sessions: older });

  return groups;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onRenameSession,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartRename = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const groups = groupSessionsByDate(sessions);

  return (
    <div className="h-full w-64 border-r border-border bg-card flex flex-col">
      {/* New Chat Button */}
      <div className="p-3 border-b border-border">
        <Button 
          onClick={onNewChat} 
          className="w-full justify-start gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-4">
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            groups.map(group => (
              <div key={group.label}>
                <h3 className="text-xs font-medium text-muted-foreground px-2 mb-1">
                  {group.label}
                </h3>
                <div className="space-y-0.5">
                  {group.sessions.map(session => (
                    <div
                      key={session.id}
                      className={cn(
                        "group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors",
                        activeSessionId === session.id
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => onSelectSession(session.id)}
                    >
                      <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      
                      {editingId === session.id ? (
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={handleSaveRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename();
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditTitle("");
                            }
                          }}
                          className="h-6 text-sm flex-1"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-sm truncate flex-1">{session.title}</span>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleStartRename(session)}>
                            <Edit2 className="h-3 w-3 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDeleteSession(session.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
