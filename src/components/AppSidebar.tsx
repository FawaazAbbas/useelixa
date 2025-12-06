import { MessageSquare, CheckSquare, Calendar, Activity, Store, Plug, BookOpen, Settings, LogOut, Menu, ChevronLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const mainNavItems = [
  { icon: MessageSquare, label: "Workspace", path: "/workspace" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: BookOpen, label: "Knowledge", path: "/knowledge-base" },
  { icon: Activity, label: "Logs", path: "/logs" },
  { icon: Plug, label: "Connections", path: "/connections" },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const active = isActive(item.path);
    
    const button = (
      <SidebarMenuButton
        onClick={() => handleNavigation(item.path)}
        className={cn(
          "w-full h-12 gap-3 px-3 rounded-xl transition-all",
          active
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "hover:bg-muted"
        )}
      >
        <item.icon className={cn("h-5 w-5 shrink-0", active && "text-primary-foreground")} />
        {!isCollapsed && (
          <span className={cn("font-medium", active && "text-primary-foreground")}>
            {item.label}
          </span>
        )}
      </SidebarMenuButton>
    );

    if (isCollapsed && !isMobile) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      {/* Header */}
      <SidebarHeader className="p-4">
        <div className={cn(
          "flex items-center gap-3 transition-all",
          isCollapsed && !isMobile ? "justify-center" : ""
        )}>
          <img 
            src="/elixa-logo.png" 
            alt="ELIXA" 
            className={cn(
              "object-contain transition-all cursor-pointer hover:scale-105",
              isCollapsed && !isMobile ? "h-8 w-8" : "h-9 w-auto"
            )}
            onClick={() => handleNavigation("/talent-pool")}
          />
          {(!isCollapsed || isMobile) && (
            <span className="font-bold text-lg text-foreground">Elixa</span>
          )}
        </div>
      </SidebarHeader>

      <Separator className="mx-3" />

      {/* Main Navigation */}
      <SidebarContent className="px-2 py-4">
        <SidebarMenu className="space-y-1">
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <NavItem item={item} />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <Separator className="my-4 mx-1" />

        {/* Talent Pool Link */}
        <SidebarMenu>
          <SidebarMenuItem>
            {isCollapsed && !isMobile ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton
                    onClick={() => handleNavigation("/talent-pool")}
                    className={cn(
                      "w-full h-12 gap-3 px-3 rounded-xl transition-all",
                      isActive("/talent-pool") || isActive("/")
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-muted"
                    )}
                  >
                    <Store className="h-5 w-5 shrink-0" />
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  AI Talent Pool
                </TooltipContent>
              </Tooltip>
            ) : (
              <SidebarMenuButton
                onClick={() => handleNavigation("/talent-pool")}
                className={cn(
                  "w-full h-12 gap-3 px-3 rounded-xl transition-all",
                  isActive("/talent-pool") || isActive("/")
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-muted"
                )}
              >
                <Store className="h-5 w-5 shrink-0" />
                <span className="font-medium">AI Talent Pool</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 mt-auto">
        <Separator className="mb-3" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full h-14 gap-3 px-3 rounded-xl hover:bg-muted justify-start",
                isCollapsed && !isMobile && "justify-center px-0"
              )}
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  L
                </AvatarFallback>
              </Avatar>
              {(!isCollapsed || isMobile) && (
                <div className="flex flex-col items-start text-left overflow-hidden">
                  <span className="font-semibold text-sm truncate">Liam Baduss</span>
                  <span className="text-xs text-muted-foreground truncate">
                    Baduss Technologies
                  </span>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Liam Baduss</p>
                <p className="text-xs leading-none text-muted-foreground">
                  Liam@badusstechnologies.com
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigation("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleNavigation("/talent-pool")} 
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Exit Demo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
