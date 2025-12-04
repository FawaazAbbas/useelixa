import { useState } from "react";
import { ChevronDown, MessageSquare, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Team, getTeamOnlineCount } from "@/data/mockTeams";
import { TeamMemberCard } from "./TeamMemberCard";
import { WaitlistDialog } from "./WaitlistDialog";

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
  const totalMemberCount = team.members.length + 1; // +1 for manager
  const [showWaitlist, setShowWaitlist] = useState(false);

  const handleMemberClick = (memberId: string, isManager: boolean) => {
    if (isManager) {
      // Allow managers to be clicked - open their chat
      onSelectMember(memberId);
    } else {
      // Show waitlist dialog for workers
      setShowWaitlist(true);
    }
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <div className="space-y-1 px-2">
          {/* Team Header */}
          <div className="flex items-center gap-1 group">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex-1 justify-start h-10 py-2 px-3 rounded-xl transition-all duration-200",
                  isOpen 
                    ? "bg-white/[0.06] border border-white/[0.08]" 
                    : "hover:bg-white/[0.04] border border-transparent"
                )}
              >
                <div className="flex items-center gap-2.5 w-full">
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 text-white/40 transition-transform duration-200",
                    !isOpen && "-rotate-90"
                  )} />
                  <span className="text-[13px] font-medium text-white/80">{team.name.replace(' Team', '')}</span>
                  <span className="text-[11px] text-white/30 ml-auto font-medium">({totalMemberCount})</span>
                </div>
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* Team Members */}
          <CollapsibleContent className="space-y-1 pl-2">
            {/* Group Chat Option */}
            <button
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 h-10 transition-all duration-200 rounded-lg group",
                isGroupChatSelected 
                  ? "bg-primary/20 border border-primary/30" 
                  : "hover:bg-white/[0.04] border border-transparent"
              )}
              onClick={onSelectGroupChat}
            >
              <div className={cn(
                "h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
                isGroupChatSelected ? "bg-primary/30" : "bg-white/[0.06]"
              )}>
                <MessageSquare className={cn(
                  "h-3.5 w-3.5",
                  isGroupChatSelected ? "text-primary" : "text-white/50"
                )} />
              </div>
              <span className={cn(
                "text-[13px] transition-colors",
                isGroupChatSelected ? "text-white/90" : "text-white/60 group-hover:text-white/80"
              )}>{team.name.replace(' Team', '')} Chat</span>
            </button>

            {/* Manager */}
            <TeamMemberCard
              member={team.manager}
              team={team}
              isSelected={selectedMemberId === team.manager.id}
              onSelect={() => handleMemberClick(team.manager.id, true)}
              isIndented={false}
            />

            {/* Workers */}
            {team.members.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                team={team}
                isSelected={selectedMemberId === member.id}
                onSelect={() => handleMemberClick(member.id, false)}
                isIndented={true}
              />
            ))}
          </CollapsibleContent>
        </div>
      </Collapsible>

      <WaitlistDialog open={showWaitlist} onOpenChange={setShowWaitlist} />
    </>
  );
};