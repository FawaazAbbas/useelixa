import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface TalentPoolNavbarProps {
  showBackButton?: boolean;
  backLabel?: string;
  backTo?: string;
}

export const TalentPoolNavbar = ({ 
  showBackButton = false, 
  backLabel = "Back",
  backTo = "/talent-pool"
}: TalentPoolNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isDiscoverActive = location.pathname === "/talent-pool" || location.pathname.startsWith("/agent/");
  const isChartsActive = location.pathname === "/talent-pool/charts";

  return (
    <nav className="border-b border-white/10 bg-background/40 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <img 
            src="/elixa-logo.png" 
            alt="ELIXA" 
            className="h-8 w-auto object-contain cursor-pointer hover:scale-105 transition-transform" 
            onClick={() => navigate("/talent-pool")}
          />
          <div className="hidden md:flex gap-6">
            <button 
              onClick={() => navigate("/talent-pool")}
              className={`text-sm font-${isDiscoverActive ? 'semibold' : 'medium'} ${isDiscoverActive ? 'text-foreground' : 'text-muted-foreground'} hover:text-${isDiscoverActive ? 'primary' : 'foreground'} transition-colors relative group`}
            >
              Discover
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </button>
            <button 
              onClick={() => navigate("/talent-pool/charts")}
              className={`text-sm font-${isChartsActive ? 'semibold' : 'medium'} ${isChartsActive ? 'text-foreground' : 'text-muted-foreground'} hover:text-${isChartsActive ? 'primary' : 'foreground'} transition-colors relative group`}
            >
              Charts
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-sm hover:bg-white/10 backdrop-blur-sm"
              onClick={() => navigate(backTo)}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          )}
          <Button onClick={() => navigate("/workspace")} variant="ghost" size="sm" className="hidden sm:inline-flex hover:bg-white/10 backdrop-blur-sm">
            Workspace
          </Button>
          <Button onClick={() => navigate("/auth")} size="sm" className="bg-primary/90 hover:bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all backdrop-blur-sm">
            Sign In
          </Button>
        </div>
      </div>
    </nav>
  );
};
