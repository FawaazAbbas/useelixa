import { Bot } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getTeamMemberById } from "@/data/mockTeams";

interface TeamMemberAvatarProps {
  memberId?: string;
  name?: string;
  avatarUrl?: string;
  isManager?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  status?: "online" | "busy" | "offline";
  className?: string;
}

const sizeClasses = {
  sm: "h-5 w-5",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-14 w-14",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-6 w-6",
  lg: "h-7 w-7",
  xl: "h-8 w-8",
};

const statusSizeClasses = {
  sm: "h-2 w-2 -bottom-0.5 -right-0.5",
  md: "h-3 w-3 -bottom-0.5 -right-0.5",
  lg: "h-3.5 w-3.5 -bottom-0.5 -right-0.5",
  xl: "h-4 w-4 -bottom-0.5 -right-0.5",
};

const statusColors = {
  online: "bg-green-500",
  busy: "bg-yellow-500",
  offline: "bg-gray-400",
};

export const TeamMemberAvatar = ({
  memberId,
  name: propName,
  avatarUrl: propAvatarUrl,
  isManager: propIsManager,
  size = "md",
  showStatus = false,
  status: propStatus,
  className,
}: TeamMemberAvatarProps) => {
  // If memberId is provided, look up the member data
  let name = propName;
  let avatarUrl = propAvatarUrl;
  let isManager = propIsManager;
  let status = propStatus;

  if (memberId) {
    const memberInfo = getTeamMemberById(memberId);
    if (memberInfo) {
      name = name || memberInfo.member.name;
      avatarUrl = avatarUrl ?? memberInfo.member.avatarUrl;
      isManager = isManager ?? memberInfo.member.isManager;
      status = status ?? memberInfo.member.status;
    }
  }

  // Color scheme based on manager status
  const iconColor = isManager ? "text-blue-500" : "text-orange-500";
  const bgColor = isManager ? "bg-blue-500/20" : "bg-orange-500/20";

  const initials = name?.split(' ')[0]?.slice(0, 2).toUpperCase() || "??";

  return (
    <div className={cn("relative", className)}>
      {avatarUrl ? (
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={avatarUrl} alt={name || "Team member"} className="object-cover" />
          <AvatarFallback className={cn(bgColor, iconColor, "text-xs")}>
            {initials}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className={cn(
          "rounded-full flex items-center justify-center",
          bgColor,
          sizeClasses[size]
        )}>
          <Bot className={cn(iconColor, iconSizeClasses[size])} />
        </div>
      )}
      {showStatus && status && (
        <div
          className={cn(
            "absolute rounded-full border-2 border-background",
            statusColors[status],
            statusSizeClasses[size]
          )}
        />
      )}
    </div>
  );
};
