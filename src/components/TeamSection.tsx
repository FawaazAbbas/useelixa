import { useState } from "react";
import { ChevronDown, Users, MessageSquare, Megaphone, Package, Headphones, DollarSign, Code, Palette, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Team, getTeamOnlineCount } from "@/data/mockTeams";
import { TeamMemberCard } from "./TeamMemberCard";

interface TeamSectionProps {
  team: Team;
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  onChatWithTeam: (teamId: string) => void;
  defaultOpen?: boolean;
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

export const TeamSection = ({
  team,
  selectedMemberId,
  onSelectMember,
  onChatWithTeam,
  defaultOpen = false
}: TeamSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const Icon = iconMap[team.icon] || Users;
  const onlineCount = getTeamOnlineCount(team);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-0.5">
        {/* Team Header */}
        <div className="flex items-center gap-1 group">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 justify-start h-8 py-1 px-3 hover:bg-muted/50",
                isOpen && "bg-muted/30"
              )}
            >
              <div className="flex items-center gap-2 w-full">
                <ChevronDown className={cn(
                  "h-3 w-3 text-white transition-transform duration-200",
                  !isOpen && "-rotate-90"
                )} />
                <Icon className="h-3.5 w-3.5 text-white" />
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
