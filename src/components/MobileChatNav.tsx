import { useState } from "react";
import { Menu, X, Hash, Users, Store, Calendar, LayoutList, Bell, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

interface Agent {
  id: string;
  name: string;
  status: string;
  type: string;
}

interface GroupChat {
  id: string;
  name: string;
  members: string[];
  memberCount: number;
  type: string;
  lastActivity: string;
}

interface MobileChatNavProps {
  agents: Agent[];
  groupChats: GroupChat[];
  selectedChat: string | null;
  onSelectChat: (chatId: string, type: 'agent' | 'group') => void;
}

export const MobileChatNav = ({ agents, groupChats, selectedChat, onSelectChat }: MobileChatNavProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleChatSelect = (chatId: string, type: 'agent' | 'group') => {
    onSelectChat(chatId, type);
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center justify-between px-4 z-40">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <img src="/elixa-logo.png" alt="ELIXA" className="h-8 w-auto transition-all duration-300 hover:scale-110 hover:rotate-6 drop-shadow-lg hover:drop-shadow-2xl" />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate('/marketplace')}>
            <Store className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[85vw] p-0">
          <SheetHeader className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/elixa-logo.png" alt="ELIXA" className="h-8 w-auto transition-all duration-300 hover:scale-110 hover:rotate-6 drop-shadow-lg hover:drop-shadow-2xl" />
                <SheetTitle>Workspace</SheetTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-80px)]">
            <div className="p-4 space-y-4">
              {/* Quick Actions */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Menu
                </h3>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/tasks');
                      setOpen(false);
                    }}
                  >
                    <LayoutList className="h-4 w-4 mr-2" />
                    Tasks
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/calendar');
                      setOpen(false);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/connections');
                      setOpen(false);
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Connections
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate('/marketplace');
                      setOpen(false);
                    }}
                  >
                    <Store className="h-4 w-4 mr-2" />
                    Marketplace
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Agents */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  AI Agents
                </h3>
                <div className="space-y-1">
                  {agents.map((agent) => (
                    <Button
                      key={agent.id}
                      variant={selectedChat === agent.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleChatSelect(agent.id, 'agent')}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary/10">
                            {agent.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <Hash className="h-3 w-3" />
                            <span className="text-sm truncate">{agent.name}</span>
                          </div>
                        </div>
                        <div className={`h-2 w-2 rounded-full ${
                          agent.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Group Chats */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Team Chats
                </h3>
                <div className="space-y-1">
                  {groupChats.map((group) => (
                    <Button
                      key={group.id}
                      variant={selectedChat === group.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleChatSelect(group.id, 'group')}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-accent/10">
                            <Users className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium truncate">{group.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {group.memberCount} members
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};
