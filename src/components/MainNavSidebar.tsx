import { MessageSquare, CheckSquare, Calendar, Activity, Store } from "lucide-react";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { icon: MessageSquare, label: "Messenger", path: "/workspace" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: Activity, label: "Logs", path: "/logs" },
  { icon: Store, label: "Marketplace", path: "/marketplace" },
];

export const MainNavSidebar = () => {
  return (
    <div className="w-20 bg-sidebar-background border-r border-sidebar-border flex flex-col items-center py-4 gap-4">
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
  );
};
