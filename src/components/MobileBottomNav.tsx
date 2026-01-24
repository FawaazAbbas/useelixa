import { MessageSquare, CheckSquare, Calendar, MoreHorizontal, Plug, BookOpen, Activity, CreditCard } from "lucide-react";
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

interface MobileBottomNavProps {
  hidden?: boolean;
}

export const MobileBottomNav = ({ hidden = false }: MobileBottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems = [
    { path: "/workspace", icon: MessageSquare, label: "Chats" },
    { path: "/tasks", icon: CheckSquare, label: "Tasks" },
    { path: "/calendar", icon: Calendar, label: "Calendar" },
  ];

  const moreItems = [
    { path: "/logs", icon: Activity, label: "Logs" },
    { path: "/connections", icon: Plug, label: "Connections" },
    { path: "/knowledge-base", icon: BookOpen, label: "Knowledge" },
    { path: "/billing", icon: CreditCard, label: "Billing" },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (hidden) return null;

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all active:scale-95",
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon className={cn(
              "h-6 w-6 transition-transform",
              isActive(item.path) && "scale-110"
            )} />
            <span className={cn(
              "text-[11px] font-medium",
              isActive(item.path) && "font-semibold"
            )}>
              {item.label}
            </span>
          </button>
        ))}

        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button
              className={cn(
                "flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-xl transition-all active:scale-95",
                "text-muted-foreground"
              )}
            >
              <MoreHorizontal className="h-6 w-6" />
              <span className="text-[11px] font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent 
            side="bottom" 
            className="h-auto rounded-t-3xl pb-safe"
          >
            <SheetHeader className="pb-4">
              <SheetTitle className="text-left">More Options</SheetTitle>
            </SheetHeader>
            <div className="grid gap-2">
              {moreItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? "secondary" : "ghost"}
                  className="justify-start h-14 text-base rounded-xl"
                  onClick={() => {
                    navigate(item.path);
                    setMoreOpen(false);
                  }}
                >
                  <item.icon className="h-5 w-5 mr-4" />
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
