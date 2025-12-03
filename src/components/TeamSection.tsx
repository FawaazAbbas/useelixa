import { ChevronDown, MessageSquare, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Team, getTeamOnlineCount } from "@/data/mockTeams";
import { TeamMemberCard } from "./TeamMemberCard";

interface TeamMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isUser: boolean;
  isManager?: boolean;
}

interface TeamSectionProps {
  team: Team;
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  onChatWithTeam: (teamId: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  showGroupChat: boolean;
  groupChatMessages: TeamMessage[];
  groupChatInput: string;
  onGroupChatInputChange: (value: string) => void;
  onSendGroupMessage: () => void;
}

export const TeamSection = ({
  team,
  selectedMemberId,
  onSelectMember,
  onChatWithTeam,
  isOpen,
  onOpenChange,
  showGroupChat,
  groupChatMessages,
  groupChatInput,
  onGroupChatInputChange,
  onSendGroupMessage,
}: TeamSectionProps) => {
  const onlineCount = getTeamOnlineCount(team);

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <div className="space-y-0.5">
        {/* Team Header */}
        <div className="flex items-center gap-1 group">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 justify-start h-8 py-1 px-3 hover:bg-primary/80",
                isOpen && "bg-primary"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <ChevronDown className={cn(
                  "h-3 w-3 text-white transition-transform duration-200",
                  !isOpen && "-rotate-90"
                )} />
                <span className="text-[0.85rem] font-medium text-white">{team.name.replace(' Team', '')}</span>
                <span className="text-[10px] text-white/60 ml-auto">({onlineCount})</span>
              </div>
            </Button>
          </CollapsibleTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted/50"
            onClick={(e) => {
              e.stopPropagation();
              onChatWithTeam(team.id);
            }}
            title={`Chat with ${team.name}`}
          >
            <MessageSquare className="h-3 w-3" />
          </Button>
        </div>

        {/* Team Members */}
        <CollapsibleContent className="space-y-0.5">
          {/* Group Chat Section */}
          {showGroupChat && (
            <div className="mx-2 mb-2 mt-1 bg-muted/30 rounded-lg overflow-hidden">
              <div className="max-h-48 overflow-y-auto p-2 space-y-2">
                {groupChatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.isUser && "flex-row-reverse"
                    )}
                  >
                    {!msg.isUser && (
                      <Bot className={cn(
                        "h-4 w-4 flex-shrink-0",
                        msg.isManager ? "text-blue-500" : "text-orange-500"
                      )} />
                    )}
                    <div className={cn(
                      "max-w-[85%] rounded-lg px-2 py-1",
                      msg.isUser 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-background/50"
                    )}>
                      {!msg.isUser && (
                        <p className="text-[10px] font-medium text-muted-foreground">
                          {msg.sender}
                        </p>
                      )}
                      <p className="text-xs">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border/50 p-2 flex gap-1">
                <Input
                  value={groupChatInput}
                  onChange={(e) => onGroupChatInputChange(e.target.value)}
                  placeholder="Message team..."
                  onKeyDown={(e) => e.key === 'Enter' && onSendGroupMessage()}
                  className="flex-1 h-7 text-xs"
                />
                <Button onClick={onSendGroupMessage} size="icon" className="h-7 w-7">
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Manager */}
          <TeamMemberCard
            member={team.manager}
            team={team}
            isSelected={selectedMemberId === team.manager.id}
            onSelect={() => onSelectMember(team.manager.id)}
            isIndented={false}
          />

          {/* Workers */}
          {team.members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              team={team}
              isSelected={selectedMemberId === member.id}
              onSelect={() => onSelectMember(member.id)}
              isIndented={true}
            />
          ))}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
