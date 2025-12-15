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

            {/* Mobile Menu Button */}
            <div className="sm:hidden shrink-0">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[260px] bg-background border-border p-0">
                  <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4 border-b border-border/50">
                      <ElixaLogo size={24} />
                      <span className="font-semibold">Menu</span>
                    </div>
                    
                    {/* Navigation */}
                    <div className="flex flex-col p-2 gap-1">
                      <Button 
                        variant="ghost"
                        className="justify-start h-11 px-3"
                        onClick={() => { 
                          setMobileMenuOpen(false);
                          navigate("/"); 
                        }}
                      >
                        Discover Agents
                      </Button>
                      
                      <Button 
                        variant="ghost"
                        className="justify-start h-11 px-3"
                        onClick={() => { 
                          trackNavClick('Charts');
                          setMobileMenuOpen(false);
                          navigate("/talent-pool/charts"); 
                        }}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Top Charts
                      </Button>
                    </div>
                    
                    {/* CTA at bottom */}
                    <div className="mt-auto p-4 border-t border-border/50">
                      <Button 
                        onClick={() => { 
                          trackNavClick('Workspace');
                          setMobileMenuOpen(false);
                          navigate("/workspace"); 
                        }} 
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        My Workspace
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile floating search bar */}
      {showSearch && !isChartsPage && (
        <div className="sm:hidden px-4 py-3 bg-gradient-to-b from-background/80 to-transparent backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search AI agents..."
              className="w-full pl-10 pr-10 h-11 bg-background border border-border/60 rounded-xl text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40 focus-visible:border-primary/40 transition-all"
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
