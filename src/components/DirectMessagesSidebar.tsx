import { mockTeams, TeamMember, Team } from "@/data/mockTeams";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { WaitlistDialog } from "./WaitlistDialog";
import { TeamMemberAvatar } from "./TeamMemberAvatar";

interface DirectMessagesSidebarProps {
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
  searchQuery?: string;
}

interface AgentWithTeam {
  member: TeamMember;
  team: Team;
}

// Mock unread counts for demo - some agents have unread messages
const mockAgentUnreads: Record<string, number> = {
  "marketing-1": 1,
  "marketing-3": 3,
  "dev-2": 2,
  "customer-2": 5,
};

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

  const handleAgentClick = () => {
    setShowWaitlist(true);
  };

  return (
    <>
      <div className="space-y-0.5 px-2 py-1">
        {agents.map(({ member }) => {
          const unreadCount = mockAgentUnreads[member.id] || 0;
          return (
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
              <TeamMemberAvatar
                memberId={member.id}
                size="sm"
                showStatus
              />
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
