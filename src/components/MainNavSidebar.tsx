import { CheckSquare, Calendar, Activity, Plug, BookOpen, Settings as SettingsIcon, LogOut, FileText, Bell, CreditCard, Coins, Mail, Users, Table, LucideIcon, Workflow, Newspaper, MessageSquare, GitBranch } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


type NavItem = {
  icon: LucideIcon;
  label: string;
  path: string;
};

const navItems: NavItem[] = [
  { icon: MessageSquare, label: "Chats", path: "/ai-employees" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: FileText, label: "Notes", path: "/notes" },
  { icon: Newspaper, label: "Digest", path: "/digest" },
  { icon: BookOpen, label: "Knowledge", path: "/knowledge-base" },
  { icon: Plug, label: "Connections", path: "/connections" },
  { icon: Activity, label: "Logs", path: "/logs" },
  { icon: GitBranch, label: "Hierarchy", path: "/hierarchy" },
  { icon: CreditCard, label: "Billing", path: "/billing" },
];

const comingSoonItems = [
  { icon: Mail, label: "Emails", comingSoon: true },
  { icon: Workflow, label: "Workflows", comingSoon: true },
  { icon: Table, label: "Lexi Sheets", comingSoon: true },
];

export const MainNavSidebar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const [monthlyCredits, setMonthlyCredits] = useState<number>(1000);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const calculateCredits = useCallback((monthlyAlloc: number, purchased: number, used: number) => {
    return Math.max(0, monthlyAlloc + purchased - used);
  }, []);

  // Fetch org membership, initial credits, and avatar
  useEffect(() => {
    if (user) {
      fetchOrgAndCredits();
      fetchAvatar();
    }
    
    return () => {
      // Cleanup realtime subscription on unmount
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user]);

  const fetchAvatar = async () => {
    if (!user) return;
    
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();
      
      if (profile?.avatar_url) {
        setAvatarUrl(profile.avatar_url);
      }
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  };

  // Subscribe to realtime changes when orgId is available
  useEffect(() => {
    if (!orgId) return;

    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Subscribe to usage_stats changes for this org
    const channel = supabase
      .channel(`usage_stats_${orgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'usage_stats',
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          console.log('[Realtime] Usage stats changed:', payload);
          const newData = payload.new as { credits_used?: number; credits_purchased?: number; month?: string };
          
          // Only update if it's the current month
          if (newData && newData.month === currentMonth) {
            const used = newData.credits_used || 0;
            const purchased = newData.credits_purchased || 0;
            const remaining = calculateCredits(monthlyCredits, purchased, used);
            setCredits(remaining);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orgId, monthlyCredits, calculateCredits]);

  const fetchOrgAndCredits = async () => {
    if (!user) return;

    try {
      // Get user's org
      const { data: orgMember } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (!orgMember) return;

      setOrgId(orgMember.org_id);

      // Get org's monthly credits allocation
      const { data: org } = await supabase
        .from("orgs")
        .select("monthly_credits, is_unlimited")
        .eq("id", orgMember.org_id)
        .single();

      if (org?.is_unlimited) {
        setCredits(-1); // -1 indicates unlimited
        return;
      }

      const monthlyAlloc = org?.monthly_credits || 1000;
      setMonthlyCredits(monthlyAlloc);

      // Get current month's usage
      const currentMonth = new Date().toISOString().slice(0, 7);
      const { data: usage } = await supabase
        .from("usage_stats")
        .select("credits_used, credits_purchased")
        .eq("org_id", orgMember.org_id)
        .eq("month", currentMonth)
        .single();

      const used = usage?.credits_used || 0;
      const purchased = usage?.credits_purchased || 0;
      setCredits(calculateCredits(monthlyAlloc, purchased, used));
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  const displayUser = user || { email: "demo@elixa.ai" };

  const handleSignOut = async () => {
    if (user) await signOut();
    navigate("/");
  };

  const getUserInitials = () => {
    if (!displayUser?.email) return "U";
    return displayUser.email.charAt(0).toUpperCase();
  };

  return (
    <div className="h-screen w-[72px] bg-card border-r flex flex-col items-center py-4 gap-2 flex-shrink-0 overflow-visible">
      {/* Logo */}
      <div className="h-10 w-10 mb-4 flex items-center justify-center">
        <img 
          src="/elixa-logo.png" 
          alt="ELIXA" 
          className="w-8 h-8 object-contain" 
        />
      </div>

      {/* Navigation - vertically scrollable */}
      <nav className="flex flex-col gap-1 flex-1 min-h-0 w-full px-2 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <Tooltip key={item.path}>
            <TooltipTrigger asChild>
              <NavLink
                to={item.path}
                className="group relative flex items-center justify-center h-10 w-full rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                activeClassName="bg-primary/10 text-primary"
              >
                {item.icon && <item.icon className="w-5 h-5" />}
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">
              {item.label}
            </TooltipContent>
          </Tooltip>
        ))}

        {/* Coming Soon Items */}
        <div className="mt-2 pt-2 border-t border-border/50">
          {comingSoonItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <div
                  className="group relative flex items-center justify-center h-10 w-full rounded-lg text-muted-foreground/50 hover:bg-muted/50 transition-colors cursor-not-allowed"
                >
                  <item.icon className="w-5 h-5" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                {item.label} <span className="text-muted-foreground">(Coming Soon)</span>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col items-center gap-1 w-full px-2 pt-2 border-t">
        {/* Credit Balance */}
        {credits !== null && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate("/billing")}
                className={cn(
                  "group relative flex items-center justify-center h-10 w-full rounded-lg transition-colors",
                  credits === -1 
                    ? "text-primary hover:bg-primary/10" 
                    : credits < 100 
                      ? "text-destructive hover:bg-destructive/10" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Coins className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {credits === -1 ? "Unlimited credits" : `${credits.toLocaleString()} credits remaining`}
            </TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/notifications"
              className="group relative flex items-center justify-center h-10 w-full rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              activeClassName="bg-primary/10 text-primary"
            >
              <Bell className="w-5 h-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">
            Notifications
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink
              to="/settings"
              className="group relative flex items-center justify-center h-10 w-full rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              activeClassName="bg-primary/10 text-primary"
            >
              <SettingsIcon className="w-5 h-5" />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">
            Settings
          </TooltipContent>
        </Tooltip>

        {/* User */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="mt-2 p-1.5 rounded-lg hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-8 w-8">
                {avatarUrl && <AvatarImage src={avatarUrl} alt="User avatar" />}
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
            <DropdownMenuItem onClick={() => navigate("/billing")}>
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
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
