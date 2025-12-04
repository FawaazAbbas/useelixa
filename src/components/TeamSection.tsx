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
        <div className="space-y-0.5">
          {/* Team Header */}
          <div className="flex items-center gap-1 group">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex-1 justify-start h-9 py-1.5 px-3 hover:bg-slate-700/50",
                  isOpen && "bg-slate-800"
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 text-slate-400 transition-transform duration-200",
                    !isOpen && "-rotate-90"
                  )} />
                  <span className="text-[13px] font-medium text-slate-200">{team.name.replace(' Team', '')}</span>
                  <span className="text-[11px] text-slate-500 ml-auto">({totalMemberCount})</span>
                </div>
              </Button>
            </CollapsibleTrigger>
          </div>

          {/* Team Members */}
          <CollapsibleContent className="space-y-0.5">
            {/* Group Chat Option */}
            <button
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 h-9 transition-colors rounded-md mx-1",
                isGroupChatSelected ? "bg-slate-700/70" : "hover:bg-slate-800/70"
              )}
              style={{ width: 'calc(100% - 8px)' }}
              onClick={onSelectGroupChat}
            >
              <div className="relative">
                <MessageSquare className="h-4 w-4 text-primary" />
              </div>
              <span className="text-[13px] text-slate-300">{team.name.replace(' Team', '')} Team Chat</span>
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