import { mockTeams, TeamMember, Team } from "@/data/mockTeams";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface DirectorsSidebarProps {
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  searchQuery?: string;
}

interface DirectorWithTeam {
  member: TeamMember;
  team: Team;
}

// Mock unread counts for demo - using actual director IDs from mockTeams managers
const mockDirectorUnreads: Record<string, number> = {
  "marketing-director": 2,
  "finance-director": 1,
  "creative-director": 4,
};

export const DirectorsSidebar = ({
  selectedMemberId,
  onSelectMember,
  searchQuery = "",
}: DirectorsSidebarProps) => {
  const directors: DirectorWithTeam[] = useMemo(() => {
    const allDirectors = mockTeams.map((team) => ({
      member: team.manager,
      team,
    }));

    if (!searchQuery.trim()) return allDirectors;

    const query = searchQuery.toLowerCase();
    return allDirectors.filter((d) =>
      d.member.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const statusColors = {
    online: "bg-green-500",
    busy: "bg-yellow-500",
    offline: "bg-gray-400",
  };

  return (
    <div className="space-y-0.5 px-2 py-1">
      {directors.map(({ member }) => {
        const unreadCount = mockDirectorUnreads[member.id] || 0;
        return (
          <button
            key={member.id}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 h-9 transition-colors rounded-md",
              selectedMemberId === member.id
                ? "bg-slate-700/70"
                : "hover:bg-slate-800/70"
            )}
            onClick={() => onSelectMember(member.id)}
          >
            <div className="relative">
              <Bot className="h-4 w-4 text-blue-400" />
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-slate-900",
                  statusColors[member.status]
                )}
              />
            </div>
            <span className="text-[13px] truncate text-slate-300 flex-1 text-left">
              {member.name}
            </span>
            {unreadCount > 0 && selectedMemberId !== member.id && (
              <span className="min-w-[18px] h-[18px] px-1.5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
        );
      })}
      {directors.length === 0 && searchQuery.trim() && (
        <div className="px-4 py-4 text-center text-sm text-slate-500">
          No directors found
        </div>
      )}
    </div>
  );
};
