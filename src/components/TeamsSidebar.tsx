import { useMemo } from "react";
import { mockTeams } from "@/data/mockTeams";
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

// Mock unread counts for demo
const mockUnreadCounts: Record<string, number> = {
  "marketing": 3,
  "development": 5,
  "customer-service": 2,
};

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
        const unreadCount = mockUnreadCounts[team.id] || 0;
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
            <Users className="h-4 w-4 text-slate-400" />
            <span className="text-[13px] truncate text-slate-300 flex-1 text-left">
              {team.name.replace(' Team', '')}
            </span>
            {unreadCount > 0 && selectedTeamGroupId !== team.id && (
              <span className="min-w-[18px] h-[18px] px-1.5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
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
