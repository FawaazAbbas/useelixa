import { MessageSquare, CheckSquare, Calendar, Activity, Store, Plug } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { icon: MessageSquare, label: "Messenger", path: "/workspace" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Activity, label: "Logs", path: "/logs" },
];

export const MainNavSidebar = () => {
  return (
    <div className="w-20 bg-sidebar-background border-r border-sidebar-border flex flex-col items-center py-4">
      {/* Main Navigation Items */}
      <div className="flex flex-col items-center gap-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex flex-col items-center gap-1 p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-primary"
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Spacer to push bottom items down */}
      <div className="flex-1" />

      {/* Connections Button */}
      <NavLink
        to="/connections"
        className="flex flex-col items-center gap-1 p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        activeClassName="bg-sidebar-accent text-sidebar-primary"
      >
        <Plug className="h-6 w-6" />
        <span className="text-xs font-medium">Connections</span>
      </NavLink>

      {/* Marketplace Button at Bottom */}
      <NavLink
        to="/marketplace"
        className="flex flex-col items-center gap-1 p-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        activeClassName="bg-sidebar-accent text-sidebar-primary"
      >
        <Store className="h-6 w-6" />
        <span className="text-xs font-medium">Marketplace</span>
      </NavLink>
    </div>
  );
};
