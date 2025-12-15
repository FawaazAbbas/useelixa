import { Search, X, Zap, BarChart3 } from "lucide-react";
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
    <nav className="sticky top-0 z-50">
      {/* Main navbar row */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-4">
            {/* Logo */}
            <div 
              className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => {
                onClearSearch?.();
                navigate("/");
              }}
            >
              <ElixaLogo size={26} />
            </div>

            {/* Search Bar - Desktop only */}
            {showSearch && !isChartsPage && (
              <div className="hidden sm:flex flex-1 max-w-xl">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search agents..."
                    className="w-full pl-9 pr-9 h-9 bg-muted/40 border-0 rounded-lg text-sm placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:bg-muted/60 transition-all"
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

            {/* Charts page - show title */}
            {isChartsPage && (
              <div className="flex-1">
                <span className="text-sm font-medium">Top Charts</span>
              </div>
            )}

            {/* Spacer for mobile */}
            {!isChartsPage && <div className="flex-1 sm:hidden" />}

            {/* Right: Navigation (Desktop) */}
            <div className="hidden sm:flex items-center gap-1 shrink-0">
              {!isChartsPage && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => { trackNavClick('Charts'); navigate("/talent-pool/charts"); }}
                  className="text-muted-foreground hover:text-foreground h-9 px-3"
                >
                  <BarChart3 className="h-4 w-4 mr-1.5" />
                  Charts
                </Button>
              )}
              {isChartsPage && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="text-muted-foreground hover:text-foreground h-9 px-3"
                >
                  Discover
                </Button>
              )}
              <Button 
                onClick={() => { trackNavClick('Workspace'); navigate("/workspace"); }} 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4 gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                Workspace
              </Button>
            </div>

            {/* Mobile: My Workspace button */}
            <div className="sm:hidden shrink-0">
              <Button 
                onClick={() => { trackNavClick('Workspace'); navigate("/workspace"); }} 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-3 gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                Workspace
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile floating search bar */}
      {showSearch && !isChartsPage && (
        <div className="sm:hidden px-4 py-3 bg-gradient-to-b from-background/60 to-transparent">
          <div className="relative">
            <Input
              placeholder="Search AI agents..."
              className="w-full pl-4 pr-10 h-11 bg-muted/30 border border-border/40 rounded-xl text-sm placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 transition-all backdrop-blur-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            {searchQuery ? (
              <button
                onClick={onClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            )}
          </div>
        </div>
      )}
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
  to = "/" 
}: TalentPoolBackButtonProps) => {
  const navigate = useNavigate();
  
  return (
    <button 
      onClick={() => navigate(to)}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
    >
      <span className="h-4 w-4">←</span>
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
            <span className="h-4 w-4 text-muted-foreground/50">›</span>
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
