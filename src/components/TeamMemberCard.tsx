import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { TeamMember, Team } from "@/data/mockTeams";

interface TeamMemberCardProps {
  member: TeamMember;
  team: Team;
  isSelected: boolean;
  onSelect: () => void;
  isIndented?: boolean;
}

export const TeamMemberCard = ({ 
  member, 
  isSelected, 
  onSelect,
  isIndented = false,
}: TeamMemberCardProps) => {
  const statusColors = {
    online: "bg-green-500",
    busy: "bg-yellow-500",
    offline: "bg-gray-400"
  };

  // Blue for managers (HEAD), orange for workers
  const iconColor = member.isManager ? "text-blue-500" : "text-orange-500";

  return (
    <button
      className={cn(
        "w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-muted/50 transition-colors",
        isSelected && "bg-muted/30",
        isIndented && "pl-6",
        member.isManager && "border-l-2 border-blue-500",
        !member.isManager && isIndented && "border-l-2 border-orange-500"
      )}
      onClick={onSelect}
    >
      <div className="relative">
        <Bot className={cn("h-4 w-4", iconColor)} />
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background",
          statusColors[member.status]
        )} />
      </div>
      <span className="text-[0.75rem] truncate text-white">{member.name}</span>
    </button>
  );
};
