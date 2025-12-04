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
        "w-full flex items-center gap-2.5 px-3 py-2.5 h-10 transition-all duration-200 rounded-lg group",
        isSelected 
          ? "bg-white/[0.08] border border-white/[0.1]" 
          : "hover:bg-white/[0.04] border border-transparent",
        isIndented && "ml-2"
      )}
      style={{ width: isIndented ? 'calc(100% - 8px)' : '100%' }}
      onClick={onSelect}
    >
      <div className={cn(
        "h-7 w-7 rounded-lg flex items-center justify-center transition-colors relative",
        isSelected ? "bg-white/[0.1]" : "bg-white/[0.06]"
      )}>
        <Bot className={cn("h-4 w-4", iconColor)} />
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0e12]",
          statusColors[member.status]
        )} />
      </div>
      <span className={cn(
        "text-[13px] truncate transition-colors",
        isSelected ? "text-white/90" : "text-white/60 group-hover:text-white/80"
      )}>{member.name}</span>
    </button>
  );
};
