import { ArrowLeft, ChevronRight, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ElixaLogo } from "@/components/ElixaLogo";
import { trackNavClick } from "@/utils/analytics";

export const TalentPoolNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isDiscoverActive = location.pathname === "/talent-pool" || location.pathname.startsWith("/agent/");
  const isChartsActive = location.pathname === "/talent-pool/charts";

  return (
    <nav className="border-b border-white/10 bg-gradient-to-r from-background/95 via-primary/5 to-background/95 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]">
      {/* Animated gradient line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="relative group cursor-pointer" onClick={() => navigate("/talent-pool")}>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <ElixaLogo size={22} className="relative hover:scale-105 transition-transform md:w-6" />
          </div>
          {/* Desktop nav tabs */}
          <div className="hidden md:flex gap-1 bg-muted/30 backdrop-blur-sm rounded-full p-1 border border-border/30">
            <button 
              onClick={() => { trackNavClick('Discover'); navigate("/talent-pool"); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                isDiscoverActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Discover
            </button>
            <button 
              onClick={() => { trackNavClick('Charts'); navigate("/talent-pool/charts"); }}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                isChartsActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Charts
            </button>
          </div>
          {/* Mobile nav tabs */}
          <div className="flex md:hidden gap-1 bg-muted/30 backdrop-blur-sm rounded-full p-0.5 border border-border/30">
            <button 
              onClick={() => navigate("/talent-pool")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                isDiscoverActive 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' 
                  : 'text-muted-foreground'
              }`}
            >
              Discover
            </button>
            <button 
              onClick={() => navigate("/talent-pool/charts")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                isChartsActive 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' 
                  : 'text-muted-foreground'
              }`}
            >
              Charts
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button 
            onClick={() => { trackNavClick('Workspace'); navigate("/workspace"); }} 
            size="sm" 
            className="bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-200 text-xs md:text-sm px-3 md:px-4"
          >
            <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" />
            <span className="hidden sm:inline">My Workspace</span>
            <span className="sm:hidden">Workspace</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

// Simple back button for sub-pages
interface TalentPoolBackButtonProps {
  label?: string;
  to?: string;
}

export const TalentPoolBackButton = ({ 
  label = "Back to Talent Pool", 
  to = "/talent-pool" 
}: TalentPoolBackButtonProps) => {
  const navigate = useNavigate();
  
  return (
    <button 
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  );
};

// Breadcrumb navigation for agent details
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface TalentPoolBreadcrumbProps {
  items: BreadcrumbItem[];
}

export const TalentPoolBreadcrumb = ({ items }: TalentPoolBreadcrumbProps) => {
  const navigate = useNavigate();
  
  return (
    <nav className="flex items-center gap-1 text-sm mb-6" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
          )}
          {item.href ? (
            <button
              onClick={() => navigate(item.href!)}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium truncate max-w-[200px]">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
