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
        "w-full flex items-center gap-2.5 px-3 py-2 h-9 transition-colors rounded-md mx-1",
        isSelected ? "bg-slate-700/70" : "hover:bg-slate-800/70",
        isIndented && "pl-7"
      )}
      style={{ width: 'calc(100% - 8px)' }}
      onClick={onSelect}
    >
      <div className="relative">
        <Bot className={cn("h-4 w-4", iconColor)} />
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-slate-900",
          statusColors[member.status]
        )} />
      </div>
      <span className="text-[13px] truncate text-slate-300">{member.name}</span>
    </button>
  );
};
