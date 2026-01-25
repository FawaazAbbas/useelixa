import { cn } from "@/lib/utils";
import { ElixaMascot, MascotSize } from "@/components/ElixaMascot";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap: Record<"sm" | "md" | "lg", MascotSize> = {
  sm: "sm",
  md: "md",
  lg: "lg",
};

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <ElixaMascot pose="thinking" size={sizeMap[size]} animation="pulse" />
    </div>
  );
};
