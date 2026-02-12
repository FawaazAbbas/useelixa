import { BarChart3, Bot, Plus, ScrollText, BookOpen, Settings, LogOut, Code2, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export type DeveloperSection = "overview" | "agents" | "submit" | "logs" | "docs" | "settings";

const navItems: { title: string; value: DeveloperSection; icon: React.ElementType }[] = [
  { title: "Overview", value: "overview", icon: BarChart3 },
  { title: "My Agents", value: "agents", icon: Bot },
  { title: "Submit Agent", value: "submit", icon: Plus },
  { title: "Logs", value: "logs", icon: ScrollText },
  { title: "API Docs", value: "docs", icon: BookOpen },
  { title: "Settings", value: "settings", icon: Settings },
];

interface DeveloperSidebarProps {
  activeSection: DeveloperSection;
  onSectionChange: (section: DeveloperSection) => void;
  userEmail?: string;
  onSignOut: () => void;
}

const SidebarContent = ({ activeSection, onSectionChange, userEmail, onSignOut, collapsed, setCollapsed, onNavigate }: DeveloperSidebarProps & { collapsed: boolean; setCollapsed?: (v: boolean) => void; onNavigate?: () => void }) => {
  const getInitials = () => {
    if (!userEmail) return "D";
    return userEmail.charAt(0).toUpperCase();
  };

  const handleSectionClick = (section: DeveloperSection) => {
    onSectionChange(section);
    onNavigate?.();
  };

  return (
    <div className={cn("h-full flex flex-col", collapsed ? "w-[72px]" : "w-[240px]")}>
      {/* Logo Header */}
      <div className={cn("h-16 border-b flex items-center gap-3 flex-shrink-0 px-4", collapsed && "justify-center px-0")}>
        <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Code2 className="h-5 w-5 text-primary" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">Developer Portal</p>
            <p className="text-[10px] text-muted-foreground truncate">Build & Deploy Agents</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeSection === item.value;
          const button = (
            <button
              key={item.value}
              onClick={() => handleSectionClick(item.value)}
              className={cn(
                "group relative flex items-center w-full rounded-lg transition-colors",
                collapsed ? "justify-center h-10" : "gap-3 h-10 px-3",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium truncate">{item.title}</span>}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
              )}
            </button>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.value}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            );
          }
          return button;
        })}
      </nav>

      {/* Collapse Toggle - desktop only */}
      {setCollapsed && (
        <div className="px-2 py-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full h-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      )}

      {/* Footer */}
      <div className={cn("border-t p-3 flex items-center gap-3", collapsed && "justify-center p-2")}>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onSignOut} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{getInitials()}</AvatarFallback>
                </Avatar>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="text-xs">{userEmail}</p>
              <p className="text-xs text-muted-foreground">Click to sign out</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground truncate">{userEmail}</p>
            </div>
            <button onClick={onSignOut} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex-shrink-0">
              <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export const DeveloperSidebar = (props: DeveloperSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger */}
      <div className="md:hidden fixed top-0 left-0 z-50 h-16 flex items-center px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[240px]">
            <SidebarContent {...props} collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden md:flex h-screen border-r bg-card flex-shrink-0 transition-all duration-200",
        collapsed ? "w-[72px]" : "w-[240px]"
      )}>
        <SidebarContent {...props} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
    </>
  );
};
