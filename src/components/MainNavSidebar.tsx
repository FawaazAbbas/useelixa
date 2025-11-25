import { MessageSquare, CheckSquare, Calendar, Activity, Store, Plug, BookOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { icon: MessageSquare, label: "Messenger", path: "/workspace" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: BookOpen, label: "Knowledge", path: "/knowledge-base" },
  { icon: Activity, label: "Logs", path: "/logs" },
  { icon: Plug, label: "Connections", path: "/connections" },
];

export const MainNavSidebar = () => {
  return (
    <div className="h-screen w-20 bg-background border-r border-border flex flex-col items-center py-6 gap-6">
      {/* Logo */}
      <div className="w-10 h-10 flex-shrink-0 transition-transform hover:scale-110 duration-200">
        <img src="/logo.png" alt="ELIXA" className="w-full h-full object-contain" />
      </div>

      {/* Navigation Items */}
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="group relative p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 ease-in-out hover:scale-105"
            activeClassName="bg-accent active"
          >
            <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary group-[.active]:text-white transition-colors duration-200" />
            <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md shadow-md border border-border opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 ease-out whitespace-nowrap z-[9999]">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Marketplace - Separated */}
      <div className="w-full px-2">
        <div className="h-px bg-border mb-4" />
        <NavLink
          to="/marketplace"
          className="group relative flex items-center justify-center p-3 rounded-lg hover:bg-accent/50 transition-all duration-200 ease-in-out hover:scale-105 w-full"
          activeClassName="bg-accent active"
        >
          <Store className="w-6 h-6 text-muted-foreground group-hover:text-primary group-[.active]:text-white transition-colors duration-200" />
          <span className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-popover text-popover-foreground text-sm rounded-md shadow-md border border-border opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-200 ease-out whitespace-nowrap z-[9999]">
            Marketplace
          </span>
        </NavLink>
      </div>
    </div>
  );
};
