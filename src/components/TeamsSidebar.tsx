import { useState, useEffect, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockTeams } from "@/data/mockTeams";
import { TeamSection } from "./TeamSection";

interface TeamsSidebarProps {
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  collapseAll?: boolean;
  selectedTeamGroupId: string | null;
  onSelectTeamGroup: (teamId: string) => void;
  searchQuery?: string;
}

export const TeamsSidebar = ({ 
  selectedMemberId, 
  onSelectMember, 
  collapseAll,
  selectedTeamGroupId,
  onSelectTeamGroup,
  searchQuery = "",
}: TeamsSidebarProps) => {
  const [openTeamIds, setOpenTeamIds] = useState<Set<string>>(new Set([mockTeams[0]?.id]));

  // Filter teams based on search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return mockTeams;
    
    const query = searchQuery.toLowerCase();
    return mockTeams.filter(team => {
      // Check team name
      if (team.name.toLowerCase().includes(query)) return true;
      // Check manager name
      if (team.manager.name.toLowerCase().includes(query)) return true;
      // Check member names
      if (team.members.some(m => m.name.toLowerCase().includes(query))) return true;
      return false;
    });
  }, [searchQuery]);

  // Collapse all teams when collapseAll becomes true
  useEffect(() => {
    if (collapseAll) {
      setOpenTeamIds(new Set());
    }
  }, [collapseAll]);

  // Auto-expand teams when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      setOpenTeamIds(new Set(filteredTeams.map(t => t.id)));
    }
  }, [searchQuery, filteredTeams]);

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
        {filteredTeams.map((team) => (
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
        {filteredTeams.length === 0 && searchQuery.trim() && (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            No teams or agents found
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
