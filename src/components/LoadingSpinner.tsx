import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24"
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn(
        "animate-spin transition-all duration-1000",
        sizeClasses[size]
      )}>
        <img 
          src="/elixa-logo.png" 
          alt="Loading..." 
          className="w-full h-full object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  );
};
