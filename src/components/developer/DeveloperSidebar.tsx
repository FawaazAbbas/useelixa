import { BarChart3, Bot, Plus, ScrollText, BookOpen, Settings, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
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

export const DeveloperSidebar = ({ activeSection, onSectionChange, userEmail, onSignOut }: DeveloperSidebarProps) => {
  return (
    <Sidebar className="border-r">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground">Developer Portal</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.value)}
                    isActive={activeSection === item.value}
                    className="cursor-pointer"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        {userEmail && (
          <p className="text-xs text-muted-foreground truncate mb-2">{userEmail}</p>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onSignOut}>
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};
