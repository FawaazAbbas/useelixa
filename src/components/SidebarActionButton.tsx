import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarActionButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const SidebarActionButton = ({
  onClick,
  icon: Icon,
  children,
  className,
}: SidebarActionButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "w-full gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all",
        className
      )}
      size="lg"
    >
      <Icon className="h-5 w-5" />
      {children}
    </Button>
  );
};
