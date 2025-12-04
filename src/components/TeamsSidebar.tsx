import { useState, useEffect, useMemo } from "react";
import { mockTeams, getTeamOnlineCount } from "@/data/mockTeams";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

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
  // Filter teams based on search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return mockTeams;
    
    const query = searchQuery.toLowerCase();
    return mockTeams.filter(team => {
      if (team.name.toLowerCase().includes(query)) return true;
      return false;
    });
  }, [searchQuery]);

  return (
    <div className="space-y-0.5 px-2 py-1">
      {filteredTeams.map((team) => {
        const onlineCount = getTeamOnlineCount(team);
        const totalCount = team.members.length + 1;
        
        return (
          <button
            key={team.id}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 h-9 transition-colors rounded-md",
              selectedTeamGroupId === team.id
                ? "bg-slate-700/70"
                : "hover:bg-slate-800/70"
            )}
            onClick={() => onSelectTeamGroup(team.id)}
          >
            <div className="relative">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <span className="text-[13px] truncate text-slate-300">
              {team.name.replace(' Team', '')}
            </span>
            <span className="text-[11px] text-slate-500 ml-auto">
              {onlineCount}/{totalCount}
            </span>
          </button>
        );
      })}
      {filteredTeams.length === 0 && searchQuery.trim() && (
        <div className="px-4 py-4 text-center text-sm text-slate-500">
          No teams found
        </div>
      )}
    </div>
  );
};
