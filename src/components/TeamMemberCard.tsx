import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamMember, Team } from "@/data/mockTeams";

interface TeamMemberCardProps {
  member: TeamMember;
  team: Team;
  isSelected: boolean;
  onSelect: () => void;
}

export const TeamMemberCard = ({ 
  member, 
  isSelected, 
  onSelect,
}: TeamMemberCardProps) => {
  const statusColors = {
    online: "bg-green-500",
    busy: "bg-yellow-500",
    offline: "bg-gray-400"
  };

  // Blue for managers (HEAD), orange for workers
  const iconColor = member.isManager ? "text-blue-500" : "text-orange-500";
  const bgColor = member.isManager ? "bg-blue-500/20" : "bg-orange-500/20";

  return (
    <button
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors",
        isSelected && "bg-muted"
      )}
      onClick={onSelect}
    >
      <div className="relative">
        <div className={cn("h-6 w-6 rounded-full flex items-center justify-center", bgColor)}>
          <Bot className={cn("h-3.5 w-3.5", iconColor)} />
        </div>
        <div className={cn(
          "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background",
          statusColors[member.status]
        )} />
      </div>
      <span className="text-sm truncate text-foreground">{member.name}</span>
      {member.isManager && (
        <span className="text-[9px] px-1 py-0.5 rounded bg-blue-500/20 text-blue-500 font-medium ml-auto">
          HEAD
        </span>
      )}
    </button>
  );
};
