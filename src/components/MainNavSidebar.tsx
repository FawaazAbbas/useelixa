import { MessageSquare, CheckSquare, Calendar, Activity, Store, Plug, BookOpen } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { icon: MessageSquare, label: "Messenger", path: "/workspace" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: BookOpen, label: "Knowledge", path: "/knowledge-base" },
  { icon: Activity, label: "Logs", path: "/logs" },
];

export const MainNavSidebar = () => {
  return (
    <>
      <div className="w-20 bg-sidebar-background border-r border-sidebar-border flex flex-col items-center py-4">
        {/* Logo */}
        <div className="mb-4 px-2">
          <img src="/logo.png" alt="ELIXA" className="w-12 h-12" />
        </div>
        
        {/* Main Navigation Items */}
        <div className="flex flex-col items-center gap-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="group relative flex flex-col items-center gap-1 p-3 transition-all"
              activeClassName="text-primary"
            >
              <item.icon className="h-6 w-6 text-sidebar-foreground group-hover:text-primary transition-colors" />
              <span className="absolute left-full ml-3 px-2 py-1 bg-sidebar-background border border-sidebar-border rounded text-xs font-medium text-sidebar-foreground whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Spacer to push bottom items down */}
        <div className="flex-1" />

        {/* Connections Button */}
        <NavLink
          to="/connections"
          className="group relative flex flex-col items-center gap-1 p-3 transition-all"
          activeClassName="text-primary"
        >
          <Plug className="h-6 w-6 text-sidebar-foreground group-hover:text-primary transition-colors" />
          <span className="absolute left-full ml-3 px-2 py-1 bg-sidebar-background border border-sidebar-border rounded text-xs font-medium text-sidebar-foreground whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            Connections
          </span>
        </NavLink>
      </div>

      {/* Marketplace Fixed at Bottom-Left */}
      <NavLink
        to="/marketplace"
        className="group fixed bottom-4 left-4 z-50 flex items-center justify-center w-14 h-14 bg-sidebar-background border border-sidebar-border rounded-lg shadow-lg transition-all"
        activeClassName="border-primary"
      >
        <Store className="h-6 w-6 text-sidebar-foreground group-hover:text-primary transition-colors" />
        <span className="absolute left-full ml-3 px-2 py-1 bg-sidebar-background border border-sidebar-border rounded text-xs font-medium text-sidebar-foreground whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          Marketplace
        </span>
      </NavLink>
    </>
  );
};
