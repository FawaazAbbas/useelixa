import { useMemo } from "react";
import { mockTeams, getTeamOnlineCount } from "@/data/mockTeams";
import { Users } from "lucide-react";
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
  selectedTeamGroupId,
  onSelectTeamGroup,
  searchQuery = "",
}: TeamsSidebarProps) => {
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
              "w-full flex items-center gap-2.5 px-3 py-2 h-9 transition-colors rounded-md group",
              selectedTeamGroupId === team.id
                ? "bg-emerald-500/20 border border-emerald-500/30"
                : "hover:bg-slate-800/70"
            )}
            onClick={() => onSelectTeamGroup(team.id)}
          >
            <div className="h-6 w-6 rounded bg-emerald-500/20 flex items-center justify-center">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
            </div>
            <span className={cn(
              "text-[13px] truncate",
              selectedTeamGroupId === team.id ? "text-emerald-200" : "text-slate-300"
            )}>
              {team.name.replace(' Team', '')}
            </span>
            <span className={cn(
              "text-[11px] ml-auto tabular-nums",
              selectedTeamGroupId === team.id ? "text-emerald-400" : "text-slate-500"
            )}>
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
