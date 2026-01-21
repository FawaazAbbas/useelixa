import { MessageSquare, CheckSquare, Calendar, Activity, Plug, BookOpen, Settings as SettingsIcon, LogOut, Bot, FileText, Users, CreditCard } from "lucide-react";
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

const navItems = [
  { icon: Bot, label: "AI Chat", path: "/chat" },
  { icon: MessageSquare, label: "Messenger", path: "/workspace" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: BookOpen, label: "Knowledge", path: "/knowledge-base" },
  { icon: Plug, label: "Connections", path: "/connections" },
  { icon: Users, label: "Team", path: "/team" },
  { icon: Activity, label: "Logs", path: "/logs" },
];

export const MainNavSidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Mock user for demo - Liam Baduss
  const mockUser = { email: "Liam@badusstechnologies.com", name: "Liam Baduss" };
  const displayUser = user || mockUser;

  const handleSignOut = async () => {
    if (user) {
      const { signOut } = useAuth();
      await signOut();
    }
    navigate("/talent-pool");
  };

  const getUserInitials = () => {
    if (!displayUser?.email) return "L";
    return "L"; // Liam's initial
  };

  return (
    <div className="h-screen w-20 bg-background border-r border-border flex flex-col items-center py-6 gap-6">
      {/* Logo */}
      <div className="h-10 w-auto flex-shrink-0 transition-all duration-300 hover:scale-110 hover:rotate-6 cursor-pointer">
        <img src="/elixa-logo.png" alt="ELIXA" className="w-full h-full object-contain drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300" />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 flex-1" style={{ position: 'relative', zIndex: 50 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="group relative p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 ease-in-out hover:scale-105"
            activeClassName="bg-accent active"
            style={{ position: 'relative', zIndex: 50 }}
          >
            <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary group-[.active]:text-white transition-colors duration-200" />
            <span 
              className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border border-border opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 ease-out whitespace-nowrap" 
              style={{ zIndex: 999999, position: 'absolute' }}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* AI Talent Pool - Separated */}
      <div className="flex flex-col items-center" style={{ position: 'relative', zIndex: 50 }}>
        <div className="w-12 h-px bg-border mb-4" />
        <NavLink
          to="/talent-pool"
          className="group relative p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 ease-in-out hover:scale-105"
          activeClassName="bg-accent active"
          style={{ position: 'relative', zIndex: 50 }}
        >
          <SettingsIcon className="w-6 h-6 text-muted-foreground group-hover:text-primary group-[.active]:text-white transition-colors duration-200" />
          <span 
            className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md shadow-lg border border-border opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 ease-out whitespace-nowrap" 
            style={{ zIndex: 999999, position: 'absolute' }}
          >
            Settings
          </span>
        </NavLink>
      </div>

      {/* User Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-lg hover:bg-accent/50 transition-all duration-200 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" style={{ zIndex: 999999 }}>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">Liam Baduss</p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                Liam@badusstechnologies.com
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/settings")}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            {user ? "Sign Out" : "Exit Demo"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
