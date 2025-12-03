import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockTeams } from "@/data/mockTeams";
import { TeamSection } from "./TeamSection";

interface TeamsSidebarProps {
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  collapseAll?: boolean;
  selectedTeamGroupId: string | null;
  onSelectTeamGroup: (teamId: string) => void;
}

export const TeamsSidebar = ({ 
  selectedMemberId, 
  onSelectMember, 
  collapseAll,
  selectedTeamGroupId,
  onSelectTeamGroup,
}: TeamsSidebarProps) => {
  const [openTeamIds, setOpenTeamIds] = useState<Set<string>>(new Set([mockTeams[0]?.id]));

  // Collapse all teams when collapseAll becomes true
  useEffect(() => {
    if (collapseAll) {
      setOpenTeamIds(new Set());
    }
  }, [collapseAll]);

  const handleToggleTeam = (teamId: string, isOpen: boolean) => {
    setOpenTeamIds(prev => {
      const newSet = new Set(prev);
      if (isOpen) {
        newSet.add(teamId);
      } else {
        newSet.delete(teamId);
      }
      return newSet;
    });
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {mockTeams.map((team) => (
          <TeamSection
            key={team.id}
            team={team}
            selectedMemberId={selectedMemberId}
            onSelectMember={onSelectMember}
            isOpen={openTeamIds.has(team.id)}
            onOpenChange={(isOpen) => handleToggleTeam(team.id, isOpen)}
            isGroupChatSelected={selectedTeamGroupId === team.id}
            onSelectGroupChat={() => onSelectTeamGroup(team.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
