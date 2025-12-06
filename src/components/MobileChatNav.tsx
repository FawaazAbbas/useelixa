import { useState } from "react";
import { Users, ChevronDown, Bot, Sparkles, Megaphone, Package, Headphones, DollarSign, Code, Palette, Shield, Search, MessageSquarePlus } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { mockTeams, getTeamOnlineCount } from "@/data/mockTeams";
import { cn } from "@/lib/utils";
import { BrianAvatar } from "@/components/BrianAvatar";
import { TeamMemberAvatar } from "@/components/TeamMemberAvatar";

interface MobileChatNavProps {
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  showBrian: boolean;
  onSelectBrian: () => void;
  onSelectTeamGroup?: (teamId: string) => void;
  selectedTeamGroupId?: string | null;
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

export const MobileChatNav = ({ 
  selectedMemberId, 
  onSelectMember, 
  showBrian, 
  onSelectBrian,
  onSelectTeamGroup,
  selectedTeamGroupId
}: MobileChatNavProps) => {
  const [open, setOpen] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set(["team-marketing"]));
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSelectTeamGroup = (teamId: string) => {
    if (onSelectTeamGroup) {
      onSelectTeamGroup(teamId);
    }
    setOpen(false);
  };

  // Filter teams and members based on search
  const filteredTeams = mockTeams.filter(team => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return team.name.toLowerCase().includes(query) ||
      team.manager.name.toLowerCase().includes(query) ||
      team.members.some(m => m.name.toLowerCase().includes(query));
  });

  // Get current chat name for display
  const getCurrentChatName = () => {
    if (showBrian) return "Brian";
    if (selectedTeamGroupId) {
      const team = mockTeams.find(t => t.id === selectedTeamGroupId);
      return team?.name || "Team Chat";
    }
    if (selectedMemberId) {
      for (const team of mockTeams) {
        if (team.manager.id === selectedMemberId) return team.manager.name;
        const member = team.members.find(m => m.id === selectedMemberId);
        if (member) return member.name;
      }
    }
    return "Select Chat";
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Floating Chat Selector Button - Only visible on mobile */}
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden fixed bottom-4 right-4 z-40 h-12 px-4 rounded-full shadow-lg bg-card border-border gap-2"
        >
          <MessageSquarePlus className="h-5 w-5" />
          <span className="font-medium">{getCurrentChatName()}</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl p-0 flex flex-col">
        <SheetHeader className="p-4 border-b border-border shrink-0">
          <SheetTitle className="text-left">Chats</SheetTitle>
        </SheetHeader>

        {/* Search */}
        <div className="p-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-muted border-0 rounded-full"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-4">
            {/* Brian - Primary CTA */}
            <div>
              <button
                onClick={handleSelectBrian}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98]",
                  showBrian 
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30" 
                    : "bg-muted hover:bg-muted/80"
                )}
              >
                <BrianAvatar size="lg" />
                <div className="flex-1 text-left">
                  <div className={cn(
                    "font-semibold",
                    showBrian ? "text-white" : "text-foreground"
                  )}>Brian</div>
                  <div className={cn(
                    "text-sm",
                    showBrian ? "text-white/80" : "text-muted-foreground"
                  )}>Your AI COO</div>
                </div>
                <Sparkles className={cn(
                  "h-5 w-5",
                  showBrian ? "text-white" : "text-primary"
                )} />
              </button>
            </div>

            <Separator />

            {/* Teams */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Teams</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {filteredTeams.length}
                </span>
              </div>
              
              {filteredTeams.map((team) => {
                const Icon = iconMap[team.icon] || Users;
                const isExpanded = expandedTeams.has(team.id);
                const onlineCount = getTeamOnlineCount(team);
                const isTeamGroupSelected = selectedTeamGroupId === team.id;
                
                return (
                  <Collapsible key={team.id} open={isExpanded} onOpenChange={() => toggleTeam(team.id)}>
                    <div className="flex items-center gap-1">
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className={cn(
                            "flex-1 justify-start h-12 rounded-xl px-3",
                            isTeamGroupSelected && "bg-muted"
                          )}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <div className={cn(
                              "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
                              `bg-gradient-to-br ${team.gradient}`
                            )}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <div className="font-medium truncate">{team.name}</div>
                              <div className="text-xs text-muted-foreground">{onlineCount} online</div>
                            </div>
                            <ChevronDown className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                              isExpanded && "rotate-180"
                            )} />
                          </div>
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    
                    <CollapsibleContent className="space-y-0.5 mt-1">
                      {/* Team Group Chat */}
                      {onSelectTeamGroup && (
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-11 pl-14 rounded-xl",
                            isTeamGroupSelected && "bg-primary/10 text-primary"
                          )}
                          onClick={() => handleSelectTeamGroup(team.id)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          <span className="text-sm">Team Chat</span>
                        </Button>
                      )}
                      
                      {/* Manager */}
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-11 pl-14 rounded-xl",
                          selectedMemberId === team.manager.id && "bg-muted"
                        )}
                        onClick={() => handleSelectMember(team.manager.id)}
                      >
                        <TeamMemberAvatar
                          memberId={team.manager.id}
                          name={team.manager.name}
                          isManager={true}
                          size="sm"
                        />
                        <div className="flex-1 text-left ml-2 min-w-0">
                          <span className="text-sm font-medium truncate block">{team.manager.name}</span>
                        </div>
                        <div className={cn(
                          "h-2 w-2 rounded-full shrink-0",
                          team.manager.status === 'online' ? "bg-green-500" : 
                          team.manager.status === 'busy' ? "bg-yellow-500" : "bg-muted-foreground/30"
                        )} />
                      </Button>
                      
                      {/* Members */}
                      {team.members.map((member) => (
                        <Button
                          key={member.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start h-11 pl-14 rounded-xl",
                            selectedMemberId === member.id && "bg-muted"
                          )}
                          onClick={() => handleSelectMember(member.id)}
                        >
                          <TeamMemberAvatar
                            memberId={member.id}
                            name={member.name}
                            isManager={false}
                            size="sm"
                          />
                          <div className="flex-1 text-left ml-2 min-w-0">
                            <span className="text-sm truncate block">{member.name}</span>
                          </div>
                          <div className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            member.status === 'online' ? "bg-green-500" : 
                            member.status === 'busy' ? "bg-yellow-500" : "bg-muted-foreground/30"
                          )} />
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
  );
};
