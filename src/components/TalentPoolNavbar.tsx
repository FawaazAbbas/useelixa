import { Search, X, Zap, Menu, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { ElixaLogo } from "@/components/ElixaLogo";
import { trackNavClick } from "@/utils/analytics";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isChartsPage = location.pathname === "/talent-pool/charts";

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <div 
            className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2" 
            onClick={() => {
              onClearSearch?.();
              navigate("/");
            }}
          >
            <ElixaLogo size={28} />
            <span className="font-semibold text-lg hidden sm:block">Elixa</span>
          </div>

          {/* Center: Search Bar (Desktop) */}
          {showSearch && !isChartsPage && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search AI agents..."
                  className="pl-10 pr-10 h-10 bg-muted/50 border-border/50 rounded-full text-sm focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 transition-all"
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

          {/* Charts page title */}
          {isChartsPage && (
            <div className="hidden md:flex flex-1 justify-center">
              <span className="text-sm font-medium text-muted-foreground">Top Charts</span>
            </div>
          )}

          {/* Right: Navigation (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {!isChartsPage && (
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => { trackNavClick('Charts'); navigate("/talent-pool/charts"); }}
                className="text-muted-foreground hover:text-foreground"
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
                className="text-muted-foreground hover:text-foreground"
              >
                Discover
              </Button>
            )}
            <Button 
              onClick={() => { trackNavClick('Workspace'); navigate("/workspace"); }} 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
            >
              <Zap className="h-4 w-4" />
              Workspace
            </Button>
          </div>

          {/* Mobile: Search + Menu */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Search */}
            {showSearch && !isChartsPage && (
              <div className="relative flex-1 max-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-8 pr-8 h-9 bg-muted/50 border-border/50 rounded-full text-sm"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={onClearSearch}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-border">
                <div className="flex flex-col gap-4 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ElixaLogo size={24} />
                    <span className="font-semibold">Elixa</span>
                  </div>
                  
                  <Button 
                    variant="ghost"
                    className="justify-start"
                    onClick={() => { 
                      setMobileMenuOpen(false);
                      navigate("/"); 
                    }}
                  >
                    Discover Agents
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    className="justify-start"
                    onClick={() => { 
                      trackNavClick('Charts');
                      setMobileMenuOpen(false);
                      navigate("/talent-pool/charts"); 
                    }}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Top Charts
                  </Button>
                  
                  <hr className="border-border/50" />
                  
                  <Button 
                    onClick={() => { 
                      trackNavClick('Workspace');
                      setMobileMenuOpen(false);
                      navigate("/workspace"); 
                    }} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    My Workspace
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
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
