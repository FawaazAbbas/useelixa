import { useState } from "react";
import { Menu, X, Users, Store, Calendar, LayoutList, Bell, Settings, ChevronDown, Bot, MessageSquare, Sparkles, Megaphone, Package, Headphones, DollarSign, Code, Palette, Shield } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useNavigate } from "react-router-dom";
import { mockTeams, getTeamOnlineCount } from "@/data/mockTeams";
import { cn } from "@/lib/utils";

interface MobileChatNavProps {
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  showBrian: boolean;
  onSelectBrian: () => void;
}

const iconMap: Record<string, any> = {
  Megaphone,
  Package,
  Headphones,
  DollarSign,
  Code,
  Palette,
  Shield
};

export const MobileChatNav = ({ selectedMemberId, onSelectMember, showBrian, onSelectBrian }: MobileChatNavProps) => {
  const [open, setOpen] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set(["team-marketing"]));
  const navigate = useNavigate();

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

  const handleSelectMember = (memberId: string) => {
    onSelectMember(memberId);
    setOpen(false);
  };

  const handleSelectBrian = () => {
    onSelectBrian();
    setOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex items-center justify-between px-4 z-40">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <img src="/elixa-logo.png" alt="ELIXA" className="h-8 w-auto" />
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate('/talent-pool')}>
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
                <img src="/elixa-logo.png" alt="ELIXA" className="h-8 w-auto" />
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
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</h3>
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/tasks'); setOpen(false); }}>
                    <LayoutList className="h-4 w-4 mr-2" />Tasks
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/calendar'); setOpen(false); }}>
                    <Calendar className="h-4 w-4 mr-2" />Calendar
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/connections'); setOpen(false); }}>
                    <Settings className="h-4 w-4 mr-2" />Connections
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { navigate('/talent-pool'); setOpen(false); }}>
                    <Store className="h-4 w-4 mr-2" />AI Talent Pool
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Brian */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />Brian
                </h3>
                <Button
                  variant={showBrian ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={handleSelectBrian}
                >
                  <Avatar className="h-6 w-6 bg-gradient-to-br from-purple-600 to-blue-500 mr-2">
                    <AvatarFallback className="text-white text-xs font-bold">B</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">Brian</div>
                    <div className="text-xs text-muted-foreground">Your AI COO</div>
                  </div>
                </Button>
              </div>

              <Separator />

              {/* Teams */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teams</h3>
                {mockTeams.map((team) => {
                  const Icon = iconMap[team.icon] || Users;
                  const isExpanded = expandedTeams.has(team.id);
                  const onlineCount = getTeamOnlineCount(team);
                  
                  return (
                    <Collapsible key={team.id} open={isExpanded} onOpenChange={() => toggleTeam(team.id)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start h-auto py-2">
                          <div className="flex items-center gap-2 w-full">
                            <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center", `bg-gradient-to-br ${team.gradient}`)}>
                              <Icon className="h-3.5 w-3.5 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium">{team.name}</div>
                              <div className="text-xs text-muted-foreground">{onlineCount} online</div>
                            </div>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="pl-4 space-y-1">
                        {/* Manager */}
                        <Button
                          variant={selectedMemberId === team.manager.id ? "secondary" : "ghost"}
                          className="w-full justify-start h-auto py-2"
                          onClick={() => handleSelectMember(team.manager.id)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center", `bg-gradient-to-br ${team.gradient}`)}>
                              <Bot className="h-3 w-3 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <div className="text-sm font-medium">{team.manager.name}</div>
                              <div className="text-xs text-muted-foreground">Head</div>
                            </div>
                            <div className={cn("h-2 w-2 rounded-full", team.manager.status === 'online' ? "bg-green-500" : team.manager.status === 'busy' ? "bg-yellow-500" : "bg-gray-400")} />
                          </div>
                        </Button>
                        {/* Members */}
                        {team.members.map((member) => (
                          <Button
                            key={member.id}
                            variant={selectedMemberId === member.id ? "secondary" : "ghost"}
                            className="w-full justify-start h-auto py-1.5 pl-6"
                            onClick={() => handleSelectMember(member.id)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm truncate flex-1 text-left">{member.name}</span>
                              <div className={cn("h-2 w-2 rounded-full", member.status === 'online' ? "bg-green-500" : member.status === 'busy' ? "bg-yellow-500" : "bg-gray-400")} />
                            </div>
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
};
