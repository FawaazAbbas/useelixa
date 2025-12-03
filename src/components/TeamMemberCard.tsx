import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TeamMember, Team } from "@/data/mockTeams";
import { getAgentColor } from "@/utils/agentColors";

interface TeamMemberCardProps {
  member: TeamMember;
  team: Team;
  isSelected: boolean;
  onSelect: () => void;
}

export const TeamMemberCard = ({ 
  member, 
  team, 
  isSelected, 
  onSelect,
}: TeamMemberCardProps) => {
  const statusColors = {
    online: "bg-green-500",
    busy: "bg-yellow-500",
    offline: "bg-gray-400"
  };

  // Map team to category for color
  const categoryMap: Record<string, string> = {
    'marketing': 'Marketing',
    'product': 'Operations',
    'customer-service': 'Customer Service',
    'finance': 'Finance',
    'development': 'Analytics',
    'creative': 'Marketing',
    'legal': 'Operations'
  };
  
  const category = categoryMap[team.id] || 'General';
  const colors = getAgentColor(category);

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start h-auto py-1.5 px-2 hover:bg-muted/50",
        isSelected && "bg-primary/20 text-primary"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 w-full">
        <div className="relative">
          <div className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center",
            colors.bg
          )}>
            <Bot className={cn("h-4 w-4", colors.icon)} />
          </div>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background",
            statusColors[member.status]
          )} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium truncate">{member.name}</span>
            {member.isManager && (
              <span className="text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary font-medium">
                HEAD
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">{member.role}</div>
        </div>
      </div>
    </Button>
  );
};
