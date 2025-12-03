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
  const totalMembers = team.members.length + 1; // +1 for manager

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-1">
        {/* Team Header */}
        <div className="flex items-center gap-1 group">
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 justify-start h-auto py-2.5 px-3 hover:bg-white/5",
                isOpen && "bg-white/5"
              )}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  `bg-gradient-to-br ${team.gradient}`
                )}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold">{team.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {totalMembers} members · {onlineCount} online
                  </div>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180"
                )} />
              </div>
            </Button>
          </CollapsibleTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              onChatWithTeam(team.id);
            }}
            title={`Chat with ${team.name}`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Team Members */}
        <CollapsibleContent className="space-y-0.5 pl-2">
          {/* Manager (prominent) */}
          <div className="mb-1">
            <TeamMemberCard
              member={team.manager}
              team={team}
              isSelected={selectedMemberId === team.manager.id}
              onSelect={() => onSelectMember(team.manager.id)}
            />
          </div>

          {/* Workers (compact list) */}
          <div className="border-l-2 border-white/10 ml-4 pl-2 space-y-0.5">
            {team.members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                team={team}
                isSelected={selectedMemberId === member.id}
                onSelect={() => onSelectMember(member.id)}
                compact
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
