import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrianAvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  rounded?: "lg" | "full";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const iconSizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
};

export const BrianAvatar = ({ size = "md", rounded = "lg", className }: BrianAvatarProps) => {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0",
        rounded === "full" ? "rounded-full" : "rounded-lg",
        sizeClasses[size],
        className
      )}
    >
      <Bot className={cn("text-white", iconSizeClasses[size])} />
    </div>
  );
};
