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
      {directors.map(({ member, team }) => (
        <button
          key={member.id}
          className={cn(
            "w-full flex items-center gap-2.5 px-3 py-2 h-9 transition-colors rounded-md group",
            selectedMemberId === member.id
              ? "bg-blue-500/20 border border-blue-500/30"
              : "hover:bg-slate-800/70"
          )}
          onClick={() => onSelectMember(member.id)}
        >
          <div className="relative">
            <div className="h-6 w-6 rounded bg-blue-500/20 flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-blue-400" />
            </div>
            <div
              className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-900",
                statusColors[member.status]
              )}
            />
          </div>
          <span className={cn(
            "text-[13px] truncate",
            selectedMemberId === member.id ? "text-blue-200" : "text-slate-300"
          )}>
            {member.name}
          </span>
        </button>
      ))}
      {directors.length === 0 && searchQuery.trim() && (
        <div className="px-4 py-4 text-center text-sm text-slate-500">
          No directors found
        </div>
      )}
    </div>
  );
};
