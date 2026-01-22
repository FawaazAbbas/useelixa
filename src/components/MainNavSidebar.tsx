import { MessageSquare, CheckSquare, Calendar, Activity, Plug, BookOpen, Settings as SettingsIcon, LogOut, FileText, Users, Bell, BarChart3 } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: MessageSquare, label: "AI Chat", path: "/chat" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: BookOpen, label: "Knowledge", path: "/knowledge-base" },
  { icon: Plug, label: "Connections", path: "/connections" },
  { icon: Users, label: "Team", path: "/team" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: Activity, label: "Logs", path: "/logs" },
];

export const MainNavSidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayUser = user || { email: "demo@elixa.ai" };

  const handleSignOut = async () => {
    if (user) await signOut();
    navigate("/talent-pool");
  };

  const getUserInitials = () => {
    if (!displayUser?.email) return "U";
    return displayUser.email.charAt(0).toUpperCase();
  };

  return (
    <div className="h-screen w-[72px] bg-card border-r flex flex-col items-center py-4 gap-2 flex-shrink-0">
      {/* Logo */}
      <div className="h-10 w-10 mb-4 flex items-center justify-center">
        <img 
          src="/elixa-logo.png" 
          alt="ELIXA" 
          className="w-8 h-8 object-contain" 
        />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1 w-full px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="group relative flex items-center justify-center h-10 w-full rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            activeClassName="bg-primary/10 text-primary"
          >
            <item.icon className="w-5 h-5" />
            <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-md shadow-lg border opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-1 w-full px-2 pt-2 border-t">
        <NavLink
          to="/notifications"
          className="group relative flex items-center justify-center h-10 w-full rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          activeClassName="bg-primary/10 text-primary"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-md shadow-lg border opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Notifications
          </span>
        </NavLink>
        
        <NavLink
          to="/settings"
          className="group relative flex items-center justify-center h-10 w-full rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          activeClassName="bg-primary/10 text-primary"
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="absolute left-full ml-3 px-2.5 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-md shadow-lg border opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
            Settings
          </span>
        </NavLink>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-2 p-1.5 rounded-lg hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-56 z-50">
            <DropdownMenuLabel>
              <p className="text-xs text-muted-foreground truncate">{displayUser.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              {user ? "Sign Out" : "Exit Demo"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
