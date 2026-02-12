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
  // If there's a real image URL (not a hex color), show it
  const isHex = iconUrl?.startsWith("#");
  if (iconUrl && !isHex) {
    return (
      <Avatar className={className}>
        <AvatarImage src={iconUrl} />
        <AvatarFallback className="bg-muted">
          <ColorizedMascot crop="head" size="sm" className="rounded-full overflow-hidden" />
        </AvatarFallback>
      </Avatar>
    );
  }

  // Always show mascot — colorized if a color exists, default otherwise
  const color = avatarColor || (isHex ? iconUrl : undefined) || undefined;
  return (
    <div className={cn("rounded-full bg-muted flex items-center justify-center overflow-hidden", className)}>
      <ColorizedMascot
        color={color}
        crop="head"
        size="sm"
        className="rounded-full overflow-hidden"
      />
    </div>
  );
}
