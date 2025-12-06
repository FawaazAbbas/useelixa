import { useState } from "react";
import { WaitlistDialog } from "./WaitlistDialog";
import { Sparkles } from "lucide-react";

export const FloatingWaitlistButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 group"
        aria-label="Join waitlist"
      >
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity animate-pulse" />
          
          {/* Main button - compact on mobile */}
          <div className="relative bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground px-4 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl shadow-2xl shadow-primary/25 transition-all group-hover:scale-105 group-hover:shadow-primary/40 flex items-center gap-2 md:gap-3">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
            <div className="flex flex-col items-start">
              <span className="text-xs md:text-sm font-semibold leading-tight">Get Early Access</span>
              <span className="text-[10px] md:text-xs opacity-90 leading-tight hidden sm:block">Join the waitlist</span>
            </div>
          </div>
          
          {/* Floating particles effect */}
          <div className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-primary rounded-full opacity-75 animate-ping" />
        </div>
      </button>
      
      <WaitlistDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
