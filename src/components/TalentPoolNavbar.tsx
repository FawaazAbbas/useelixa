import { ArrowLeft, ChevronRight, Search, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { ElixaLogo } from "@/components/ElixaLogo";
import { trackNavClick } from "@/utils/analytics";

interface TalentPoolNavbarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onClearSearch?: () => void;
  showSearch?: boolean;
}

export const TalentPoolNavbar = ({ 
  searchQuery = "", 
  onSearchChange,
  onClearSearch,
  showSearch = true 
}: TalentPoolNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isChartsPage = location.pathname === "/talent-pool/charts";

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 md:gap-4">
        {/* Logo */}
        <div 
          className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => {
            onClearSearch?.();
            navigate("/talent-pool");
          }}
        >
          <ElixaLogo size={24} />
        </div>

        {/* Search Bar - Centered, takes available space */}
        {showSearch && !isChartsPage && (
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search AI agents..."
                className="pl-9 pr-9 h-10 bg-muted/50 border-border/50 rounded-full text-sm focus-visible:ring-1 focus-visible:ring-primary/50"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Charts page - show title instead of search */}
        {isChartsPage && (
          <div className="flex-1">
            <span className="text-sm font-medium text-muted-foreground">Top Charts</span>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isChartsPage && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => { trackNavClick('Charts'); navigate("/talent-pool/charts"); }}
              className="text-muted-foreground hover:text-foreground text-xs md:text-sm hidden sm:flex"
            >
              Charts
            </Button>
          )}
          {isChartsPage && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={() => navigate("/talent-pool")}
              className="text-muted-foreground hover:text-foreground text-xs md:text-sm hidden sm:flex"
            >
              Discover
            </Button>
          )}
          <Button 
            onClick={() => { trackNavClick('Workspace'); navigate("/workspace"); }} 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs md:text-sm px-3 md:px-4"
          >
            <Zap className="h-3.5 w-3.5 mr-1.5" />
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