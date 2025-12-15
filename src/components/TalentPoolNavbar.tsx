import { ArrowLeft, ChevronRight, Search, X, Menu, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { ElixaLogo } from "@/components/ElixaLogo";
import { trackNavClick } from "@/utils/analytics";
import { useState } from "react";

interface TalentPoolNavbarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onClearSearch?: () => void;
  showSearch?: boolean;
  onOpenFilters?: () => void;
  activeFilterCount?: number;
}

export const TalentPoolNavbar = ({ 
  searchQuery = "", 
  onSearchChange,
  onClearSearch,
  showSearch = true,
  onOpenFilters,
  activeFilterCount = 0
}: TalentPoolNavbarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const isChartsPage = location.pathname === "/talent-pool/charts";

  return (
    <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Logo */}
          <div 
            className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2" 
            onClick={() => {
              onClearSearch?.();
              navigate("/talent-pool");
            }}
          >
            <ElixaLogo size={28} className="sm:w-8" />
            <span className="font-semibold text-lg hidden sm:block">Elixa</span>
          </div>

          {/* Desktop Search Bar - Centered */}
          {showSearch && !isChartsPage && (
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search AI agents..."
                  className="pl-10 pr-10 h-10 bg-muted/40 border-border/40 rounded-full text-sm focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={onClearSearch}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Charts page - show title instead of search */}
          {isChartsPage && (
            <div className="flex-1 text-center">
              <span className="text-sm font-medium text-muted-foreground">Top Charts</span>
            </div>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Search Toggle */}
            {showSearch && !isChartsPage && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="md:hidden h-9 w-9"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}

            {/* Mobile Filter Button */}
            {onOpenFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onOpenFilters}
                className="md:hidden h-9 w-9 relative"
              >
                <Filter className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            )}

            {/* Desktop Nav Links */}
            {!isChartsPage && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => { trackNavClick('Charts'); navigate("/talent-pool/charts"); }}
                className="text-muted-foreground hover:text-foreground text-sm hidden md:flex"
              >
                Charts
              </Button>
            )}
            {isChartsPage && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => navigate("/talent-pool")}
                className="text-muted-foreground hover:text-foreground text-sm hidden md:flex"
              >
                Discover
              </Button>
            )}
            
            {/* CTA Button */}
            <Button 
              onClick={() => { trackNavClick('Workspace'); navigate("/workspace"); }} 
              size="sm" 
              className="bg-gradient-to-r from-rose-500 to-purple-500 hover:from-rose-600 hover:to-purple-600 text-white text-sm px-3 sm:px-4 h-9 font-medium shadow-sm"
            >
              <span className="hidden sm:inline">My Workspace</span>
              <span className="sm:hidden">Demo</span>
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar - Expandable */}
        {showSearch && !isChartsPage && mobileSearchOpen && (
          <div className="md:hidden pb-3 animate-in slide-in-from-top-2 duration-200">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search AI agents..."
                className="pl-10 pr-10 h-10 bg-muted/40 border-border/40 rounded-full text-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={onClearSearch}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
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
