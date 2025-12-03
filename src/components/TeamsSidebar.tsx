import { ScrollArea } from "@/components/ui/scroll-area";
import { mockTeams } from "@/data/mockTeams";
import { TeamSection } from "./TeamSection";
import { useToast } from "@/hooks/use-toast";

interface TeamsSidebarProps {
  selectedMemberId: string | null;
  onSelectMember: (memberId: string) => void;
}

export const TeamsSidebar = ({ selectedMemberId, onSelectMember }: TeamsSidebarProps) => {
  const { toast } = useToast();

  const handleChatWithTeam = (teamId: string) => {
    const team = mockTeams.find(t => t.id === teamId);
    toast({
      title: "Demo Mode",
      description: `Team chat with ${team?.name || 'team'} would open here. This feature is available in the full version.`,
    });
  };

  return (
    <ScrollArea className="flex-1">
      <div className="p-2 space-y-1">
        {mockTeams.map((team, index) => (
          <TeamSection
            key={team.id}
            team={team}
            selectedMemberId={selectedMemberId}
            onSelectMember={onSelectMember}
            onChatWithTeam={handleChatWithTeam}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
