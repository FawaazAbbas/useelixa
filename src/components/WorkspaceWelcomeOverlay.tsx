import { useState, useEffect } from "react";
import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ElixaLogo } from "@/components/ElixaLogo";

interface WorkspaceWelcomeOverlayProps {
  onDismiss: () => void;
}

export const WorkspaceWelcomeOverlay = ({ onDismiss }: WorkspaceWelcomeOverlayProps) => {
  const [phase, setPhase] = useState<"entering" | "visible" | "exiting">("entering");
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Start showing content after initial fade in
    const contentTimer = setTimeout(() => {
      setPhase("visible");
      setShowContent(true);
    }, 300);

    // Show button after content is visible
    const buttonTimer = setTimeout(() => {
      setShowButton(true);
    }, 1200);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(buttonTimer);
    };
  }, []);

  const handleEnter = () => {
    setPhase("exiting");
    setTimeout(() => {
      onDismiss();
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-700 ease-out ${
        phase === "entering" ? "opacity-0" : phase === "exiting" ? "opacity-0 scale-105" : "opacity-100"
      }`}
    >
      {/* Backdrop with semi-transparent gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/80 to-slate-900/85 backdrop-blur-md">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        {/* Logo/Icon */}
        <div
          className={`flex justify-center mb-8 transition-all duration-700 ${
            showContent ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-90"
          }`}
        >
          <ElixaLogo size={80} gradientFrom="#3B82F6" gradientTo="#60A5FA" />
        </div>

        {/* Welcome text */}
        <h1
          className={`text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 transition-all duration-700 delay-100 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Welcome to the{" "}
          <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-sky-400 bg-clip-text text-transparent">
            Elixa Workspace
          </span>
        </h1>

        {/* Subheading with user info */}
        <div
          className={`transition-all duration-700 delay-200 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <p className="text-lg md:text-xl text-slate-300 mb-6">
            You're entering as
          </p>
          
          <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-6 py-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-white font-semibold text-lg">Liam Baduss</p>
              <p className="text-slate-400 text-sm">Baduss Technologies</p>
            </div>
          </div>
        </div>

        {/* Inspirational message */}
        <p
          className={`text-slate-400 text-lg md:text-xl max-w-lg mx-auto mb-10 leading-relaxed transition-all duration-700 delay-300 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          This is where AI employees collaborate, decisions get made, and work happens around the clock.{" "}
          <span className="text-slate-300">Imagine if it were yours.</span>
        </p>

        {/* Enter button */}
        <div
          className={`transition-all duration-500 ${
            showButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button
            onClick={handleEnter}
            size="lg"
            className="h-14 px-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-lg shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 rounded-xl group"
          >
            Enter Workspace
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="text-slate-500 text-sm mt-4">
            Press Enter or click to continue
          </p>
        </div>
      </div>
    </div>
  );
};
