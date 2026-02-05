import { cn } from "@/lib/utils";

interface SlideShellProps {
  children: React.ReactNode;
  className?: string;
  background?: "white" | "gradient" | "custom";
}

export const SlideShell = ({ children, className, background = "white" }: SlideShellProps) => {
  return (
    <section className={cn(
      "pitch-slide",
      "min-h-screen w-full relative overflow-hidden",
      className
    )}>
      {/* Background */}
      {background !== "custom" && (
        <div className={cn(
          "absolute inset-0 z-0",
          background === "white" ? "bg-white" : "bg-gradient-to-br from-white via-slate-50 to-white"
        )} />
      )}
      
      {/* Content container with safe area padding */}
      <div className="relative z-10 w-full h-full pt-[72px] pb-[72px] px-6 md:px-12 lg:px-24">
        <div className="max-w-[1728px] mx-auto h-full">
          <div className="pitch-grid h-full content-start">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
};
