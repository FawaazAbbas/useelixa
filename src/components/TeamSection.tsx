import { ChevronDown, MessageSquare, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Team, getTeamOnlineCount } from "@/data/mockTeams";
import { TeamMemberCard } from "./TeamMemberCard";

interface TeamSectionProps {
  team: Team;
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  isGroupChatSelected: boolean;
  onSelectGroupChat: () => void;
}

export const TeamSection = ({
  team,
  selectedMemberId,
  onSelectMember,
  isOpen,
  onOpenChange,
  isGroupChatSelected,
  onSelectGroupChat,
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
        </div>

        {/* Team Members */}
        <CollapsibleContent className="space-y-0.5">
          {/* Group Chat Option */}
          <button
            className={cn(
              "w-full flex items-center gap-2 px-3 py-1 h-8 rounded transition-colors",
              isGroupChatSelected ? "bg-[hsl(210_17%_96%/0.3)]" : "hover:bg-[hsl(210_17%_96%/0.5)]"
            )}
            onClick={onSelectGroupChat}
          >
            <div className="relative">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[0.75rem] truncate text-white">{team.name.replace(' Team', '')} Team Chat</span>
          </button>

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
