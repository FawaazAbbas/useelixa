import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColorizedMascot } from "@/components/ColorizedMascot";
import { cn } from "@/lib/utils";

interface AgentAvatarProps {
  name: string;
  avatarColor?: string | null;
  iconUrl?: string | null;
  className?: string;
}

/**
 * Renders an agent avatar: colorized mascot when a brand color exists,
 * icon_url image when available, or letter fallback otherwise.
 */
export function AgentAvatar({ name, avatarColor, iconUrl, className }: AgentAvatarProps) {
  if (avatarColor) {
    return (
      <ColorizedMascot
        color={avatarColor}
        crop="head"
        className={cn("rounded-full overflow-hidden", className)}
      />
    );
  }

  return (
    <Avatar className={className}>
      <AvatarImage src={iconUrl || undefined} />
      <AvatarFallback className="bg-primary/10 text-primary">
        {name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
