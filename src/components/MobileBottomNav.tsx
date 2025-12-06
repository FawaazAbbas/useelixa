import { MessageSquare, CheckSquare, Calendar, MoreHorizontal, Plug, BookOpen, Activity } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems = [
    { path: "/workspace", icon: MessageSquare, label: "Messenger" },
    { path: "/tasks", icon: CheckSquare, label: "Tasks" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
  ];

  const moreItems = [
    { path: "/logs", icon: Activity, label: "Logs" },
    { path: "/connections", icon: Plug, label: "Connections" },
    { path: "/knowledge-base", icon: BookOpen, label: "Knowledge" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors",
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors",
                "text-muted-foreground hover:text-foreground"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto pb-safe">
            <SheetHeader>
              <SheetTitle>More Options</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2 mt-4">
              {moreItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="justify-start h-12"
                  onClick={() => {
                    navigate(item.path);
                    setMoreOpen(false);
                  }}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
