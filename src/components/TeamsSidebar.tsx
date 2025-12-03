import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/10">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Teams
        </h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {mockTeams.map((team, index) => (
            <div key={team.id}>
              <TeamSection
                team={team}
                selectedMemberId={selectedMemberId}
                onSelectMember={onSelectMember}
                onChatWithTeam={handleChatWithTeam}
                defaultOpen={index === 0} // First team expanded by default
              />
              {index < mockTeams.length - 1 && (
                <Separator className="my-2 bg-white/5" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
