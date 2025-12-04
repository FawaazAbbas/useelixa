import { mockTeams, TeamMember, Team } from "@/data/mockTeams";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { WaitlistDialog } from "./WaitlistDialog";

interface DirectMessagesSidebarProps {
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  searchQuery?: string;
}

interface AgentWithTeam {
  member: TeamMember;
  team: Team;
}

export const DirectMessagesSidebar = ({
  selectedMemberId,
  onSelectMember,
  searchQuery = "",
}: DirectMessagesSidebarProps) => {
  const [showWaitlist, setShowWaitlist] = useState(false);

  const agents: AgentWithTeam[] = useMemo(() => {
    const allAgents = mockTeams.flatMap((team) =>
      team.members.map((member) => ({
        member,
        team,
      }))
    );

    if (!searchQuery.trim()) return allAgents;

    const query = searchQuery.toLowerCase();
    return allAgents.filter((a) =>
      a.member.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const statusColors = {
    online: "bg-green-500",
    busy: "bg-yellow-500",
    offline: "bg-gray-400",
  };

  const handleAgentClick = () => {
    setShowWaitlist(true);
  };

  return (
    <>
      <div className="space-y-0.5 px-2 py-1">
        {agents.map(({ member }) => (
          <button
            key={member.id}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 h-9 transition-colors rounded-md",
              selectedMemberId === member.id
                ? "bg-slate-700/70"
                : "hover:bg-slate-800/70"
            )}
            onClick={handleAgentClick}
          >
            <div className="relative">
              <Bot className="h-4 w-4 text-orange-400" />
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-slate-900",
                  statusColors[member.status]
                )}
              />
            </div>
            <span className="text-[13px] truncate text-slate-300">
              {member.name}
            </span>
          </button>
        ))}
        {agents.length === 0 && searchQuery.trim() && (
          <div className="px-4 py-4 text-center text-sm text-slate-500">
            No agents found
          </div>
        )}
      </div>
      <WaitlistDialog open={showWaitlist} onOpenChange={setShowWaitlist} />
    </>
  );
};
