import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutDashboard, LogOut, RefreshCw, ChevronLeft, ChevronRight, FileText, History } from "lucide-react";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onRefresh: () => void;
  onSignOut: () => void;
  refreshing: boolean;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "blog", label: "Blog", icon: FileText },
  { id: "audit", label: "Audit Log", icon: History },
];

export const AdminSidebar = ({
  activeTab,
  onTabChange,
  onRefresh,
  onSignOut,
  refreshing,
  collapsed,
  onCollapsedChange,
}: AdminSidebarProps) => {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className={cn(
          "flex h-16 items-center border-b border-border px-4",
          collapsed ? "justify-center" : "justify-between"
        )}>
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Admin</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapsedChange(!collapsed)}
            className="h-8 w-8 shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 text-left">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t border-border p-3 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
            className={cn("w-full", collapsed ? "px-2" : "justify-start")}
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin", !collapsed && "mr-2")} />
            {!collapsed && "Refresh"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSignOut}
            className={cn("w-full text-muted-foreground hover:text-destructive", collapsed ? "px-2" : "justify-start")}
          >
            <LogOut className={cn("h-4 w-4", !collapsed && "mr-2")} />
            {!collapsed && "Sign Out"}
          </Button>
        </div>
      </div>
    </aside>
  );
};
