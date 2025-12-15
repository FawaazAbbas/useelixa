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
      <div className="border-b border-border/30 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-6">
            {/* Logo */}
            <div 
              className="shrink-0 cursor-pointer hover:scale-105 transition-transform" 
              onClick={() => {
                onClearSearch?.();
                navigate("/");
              }}
            >
              <ElixaLogo size={28} />
            </div>

            {/* Desktop Search Bar */}
            {showSearch && !isChartsPage && (
              <div className="hidden md:flex flex-1 max-w-lg">
                <div className="relative w-full group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Search AI agents..."
                      className="w-full pl-11 pr-11 h-11 bg-muted/30 border border-border/40 rounded-full text-sm placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 focus-visible:bg-background/80 transition-all duration-300"
                      value={searchQuery}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        onClick={onClearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Charts page - show title */}
            {isChartsPage && (
              <div className="flex-1">
                <span className="text-sm font-medium text-muted-foreground">Top Charts</span>
              </div>
            )}

            {/* Spacer */}
            {!isChartsPage && <div className="flex-1 md:hidden" />}

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {!isChartsPage && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => { trackNavClick('Charts'); navigate("/talent-pool/charts"); }}
                  className="text-muted-foreground hover:text-foreground h-10 px-4 rounded-full"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Charts
                </Button>
              )}
              {isChartsPage && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="text-muted-foreground hover:text-foreground h-10 px-4 rounded-full"
                >
                  Discover
                </Button>
              )}
              <Button 
                onClick={() => { trackNavClick('Workspace'); navigate("/workspace"); }} 
                size="sm" 
                className="h-10 px-5 rounded-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 gap-2"
              >
                <Zap className="h-4 w-4" />
                Workspace
              </Button>
            </div>

            {/* Mobile: Workspace Button */}
            <div className="md:hidden shrink-0">
              <Button 
                onClick={() => { trackNavClick('Workspace'); navigate("/workspace"); }} 
                size="sm" 
                className="h-9 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="text-xs">Workspace</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile floating search bar */}
      {showSearch && !isChartsPage && (
        <div className="md:hidden px-4 py-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search AI agents..."
              className="w-full pl-11 pr-11 h-12 bg-background/60 backdrop-blur-xl border border-border/40 rounded-2xl text-sm shadow-lg shadow-black/5 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 focus-visible:bg-background/80 transition-all"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
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
