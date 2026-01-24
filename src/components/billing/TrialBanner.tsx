import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface OrgData {
  plan: string;
  trial_ends_at: string | null;
}

export function TrialBanner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [org, setOrg] = useState<OrgData | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchOrg = async () => {
      if (!user) return;

      const { data: membership } = await supabase
        .from("org_members")
        .select("org_id")
        .eq("user_id", user.id)
        .single();

      if (membership?.org_id) {
        const { data: orgData } = await supabase
          .from("orgs")
          .select("plan, trial_ends_at")
          .eq("id", membership.org_id)
          .single();

        if (orgData) {
          setOrg(orgData as OrgData);
        }
      }
    };

    fetchOrg();
  }, [user]);

  if (!org || org.plan !== "trial" || !org.trial_ends_at || dismissed) {
    return null;
  }

  const trialEndsAt = new Date(org.trial_ends_at);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Trial has expired
  if (daysRemaining <= 0) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2.5">
        <div className="flex items-center justify-center gap-3 text-sm">
          <Clock className="h-4 w-4 text-destructive" />
          <span className="text-destructive font-medium">
            Your free trial has expired
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => navigate("/billing")}
            className="h-7 px-3"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  const isUrgent = daysRemaining <= 3;

  return (
    <div
      className={cn(
        "border-b px-4 py-2.5 transition-colors",
        isUrgent
          ? "bg-amber-500/10 border-amber-500/20"
          : "bg-primary/5 border-primary/10"
      )}
    >
      <div className="flex items-center justify-center gap-3 text-sm">
        <Clock className={cn("h-4 w-4", isUrgent ? "text-amber-500" : "text-primary")} />
        <span className={cn("font-medium", isUrgent ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>
          {daysRemaining} {daysRemaining === 1 ? "day" : "days"} left on your free trial
        </span>
        <Button
          size="sm"
          variant={isUrgent ? "default" : "outline"}
          onClick={() => navigate("/billing")}
          className={cn("h-7 px-3", isUrgent && "bg-amber-500 hover:bg-amber-600")}
        >
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Upgrade
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
