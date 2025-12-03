import { cn } from "@/lib/utils";
import { TeamMember, Team } from "@/data/mockTeams";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

  // Get initials from name
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <button
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted/50 transition-colors",
        isSelected && "bg-muted"
      )}
      onClick={onSelect}
    >
      <div className="relative">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-muted text-xs">
            {getInitials(member.name)}
          </AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute bottom-0 right-0 h-2 w-2 rounded-full border border-background",
          statusColors[member.status]
        )} />
      </div>
      <span className="text-sm truncate">{member.name}</span>
      {member.isManager && (
        <span className="text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary font-medium ml-auto">
          HEAD
        </span>
      )}
    </button>
  );
};
