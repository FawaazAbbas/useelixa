import { Bot, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TeamMember, Team } from "@/data/mockTeams";

interface TeamMemberCardProps {
  member: TeamMember;
  team: Team;
  isSelected: boolean;
  onSelect: () => void;
  compact?: boolean;
}

export const TeamMemberCard = ({ 
  member, 
  team, 
  isSelected, 
  onSelect,
  compact = false 
}: TeamMemberCardProps) => {
  const statusColors = {
    online: "bg-green-500",
    busy: "bg-yellow-500",
    offline: "bg-gray-400"
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start h-auto py-2 px-3 group hover:bg-white/5",
          isSelected && "bg-white/10"
        )}
        onClick={onSelect}
      >
        <div className="flex items-center gap-3 w-full">
          <div className="relative">
            <div className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center",
              `bg-gradient-to-br ${team.gradient} opacity-60`
            )}>
              <Bot className="h-3.5 w-3.5 text-white" />
            </div>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
              statusColors[member.status]
            )} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium truncate">{member.name}</div>
            <div className="text-xs text-muted-foreground truncate">{member.role}</div>
          </div>
          <MessageSquare className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start h-auto py-3 px-4 group hover:bg-white/5",
        isSelected && "bg-white/10 ring-1 ring-white/20"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4 w-full">
        <div className="relative">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
            `bg-gradient-to-br ${team.gradient}`,
            member.isManager && "ring-2 ring-white/30"
          )}>
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background",
            statusColors[member.status]
          )} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold truncate">{member.name}</span>
            {member.isManager && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground font-medium">
                HEAD
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">{member.role}</div>
          {member.specialty && (
            <div className="text-[10px] text-muted-foreground/70 truncate mt-0.5">{member.specialty}</div>
          )}
        </div>
        <MessageSquare className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Button>
  );
};
