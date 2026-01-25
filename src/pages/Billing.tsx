import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CreditCard, Zap, CheckCircle, ArrowRight, BarChart3, Coins, Clock, Lock, Settings, Loader2, AlertTriangle, X, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useTeam } from "@/hooks/useTeam";
import { PageLayout, CardGrid } from "@/components/PageLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { CreditPurchaseDialog } from "@/components/chat/CreditPurchaseDialog";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ElixaMascot } from "@/components/ElixaMascot";

interface UsageStats {
  ai_calls: number;
  tool_executions: number;
  documents_uploaded: number;
  storage_bytes_used: number;
  credits_used: number;
  credits_purchased: number;
}

interface OrgData {
  plan: string;
  trial_ends_at: string | null;
  monthly_credits: number;
  is_unlimited: boolean;
  has_premium_models: boolean;
  connector_limit: number | null;
}

const plans = [
  {
    id: "trial",
    name: "Free Trial",
    price: "£0",
    description: "14-day trial to explore Elixa",
    features: [
      "100 AI credits",
      "Standard Elixa AI only",
      "2 connectors maximum",
      "14-day access",
    ],
    limits: { credits: 100, connectors: 2, premiumModels: false },
    trial: true,
  },
  {
    id: "starter",
    name: "Starter",
    price: "£4.99",
    period: "/month",
    description: "For individuals getting started",
    features: [
      "1,000 AI credits/month",
      "Standard Elixa AI",
      "Unlimited connectors",
      "Email support",
    ],
    limits: { credits: 1000, connectors: Infinity, premiumModels: false },
  },
  {
    id: "pro",
    name: "Pro",
    price: "£14.99",
    period: "/month",
    description: "For power users",
    features: [
      "5,000 AI credits/month",
      "Access to GPT & Gemini Pro",
      "Unlimited connectors",
      "Priority support",
    ],
    limits: { credits: 5000, connectors: Infinity, premiumModels: true },
    highlighted: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: "£29.99",
    period: "/month",
    description: "No limits, full power",
    features: [
      "Unlimited AI credits",
      "Access to GPT & Gemini Pro",
      "Unlimited connectors",
      "Dedicated support",
    ],
    limits: { credits: Infinity, connectors: Infinity, premiumModels: true },
  },
];

const Billing = () => {
  const { user } = useAuth();
  const { organization, loading } = useTeam();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [orgData, setOrgData] = useState<OrgData | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [lowCreditDismissed, setLowCreditDismissed] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoOpenForPlan, setPromoOpenForPlan] = useState<string | null>(null);

  // Handle URL params from Stripe redirect
  useEffect(() => {
    const success = searchParams.get("success");
    const credits = searchParams.get("credits");
    const creditAmount = searchParams.get("amount");
    const canceled = searchParams.get("canceled");

    if (success === "true") {
      toast.success("Subscription activated!", {
        description: "Your plan has been upgraded successfully.",
      });
      // Refresh subscription status
      checkSubscription();
    } else if (credits === "true" && creditAmount) {
      toast.success(`${parseInt(creditAmount).toLocaleString()} credits added!`, {
        description: "Your credits are now available to use.",
      });
    } else if (canceled === "true") {
      toast.info("Checkout canceled", {
        description: "No charges were made.",
      });
    }

    // Clean up URL params
    if (success || credits || canceled) {
      window.history.replaceState({}, "", "/billing");
    }
  }, [searchParams]);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      console.log("[Billing] Subscription check:", data);
    } catch (error) {
      console.error("[Billing] Failed to check subscription:", error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      if (!organization?.id) {
        setLoadingUsage(false);
        return;
      }

      try {
        // Fetch org data
        const { data: org } = await supabase
          .from("orgs")
          .select("plan, trial_ends_at, monthly_credits, is_unlimited, has_premium_models, connector_limit")
          .eq("id", organization.id)
          .single();

        if (org) {
          setOrgData(org as OrgData);
        }

        // Fetch usage stats
        const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
        const { data: usage } = await supabase
          .from("usage_stats")
          .select("*")
          .eq("org_id", organization.id)
          .eq("month", currentMonth)
          .maybeSingle();

        if (usage) {
          setUsageStats(usage as UsageStats);
        } else {
          setUsageStats({
            ai_calls: 0,
            tool_executions: 0,
            documents_uploaded: 0,
            storage_bytes_used: 0,
            credits_used: 0,
            credits_purchased: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingUsage(false);
      }
    };

    fetchData();
  }, [organization?.id]);

  if (loading) {
    return (
      <PageLayout title="Billing" icon={CreditCard}>
        <BillingLoadingSkeleton />
      </PageLayout>
    );
  }

  const currentPlan = orgData?.plan || "trial";
  const currentPlanData = plans.find(p => p.id === currentPlan) || plans[0];
  
  // Calculate credits
  const monthlyCredits = orgData?.monthly_credits || 100;
  const creditsUsed = usageStats?.credits_used || 0;
  const creditsPurchased = usageStats?.credits_purchased || 0;
  const totalAvailable = monthlyCredits + creditsPurchased;
  const creditsRemaining = Math.max(0, totalAvailable - creditsUsed);
  const creditUsagePercent = orgData?.is_unlimited ? 0 : Math.min((creditsUsed / totalAvailable) * 100, 100);

  // Show low credit warning (after creditsRemaining is calculated)
  const showLowCreditWarning = !loadingUsage && !orgData?.is_unlimited && creditsRemaining < 100 && !lowCreditDismissed;

  // Trial countdown
  const trialEndsAt = orgData?.trial_ends_at ? new Date(orgData.trial_ends_at) : null;
  const daysRemaining = trialEndsAt 
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleUpgrade = async (planId: string, withPromoCode?: string) => {
    if (planId === "trial") return;
    
    setUpgradingPlan(planId);
    try {
      const body: { type: string; planId: string; promoCode?: string } = {
        type: "subscription",
        planId,
      };

      // Include promo code if provided
      if (withPromoCode?.trim()) {
        body.promoCode = withPromoCode.trim();
      }

      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body,
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("[Billing] Checkout error:", error);
      toast.error("Failed to start checkout", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setUpgradingPlan(null);
      setPromoCode("");
      setPromoOpenForPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    setOpeningPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-portal");

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("[Billing] Portal error:", error);
      toast.error("Failed to open billing portal", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setOpeningPortal(false);
    }
  };

  return (
    <PageLayout
      title="Billing"
      icon={CreditCard}
      badge={currentPlanData.name}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Low Credit Warning Banner */}
        {showLowCreditWarning && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <div className="flex items-start gap-3">
              <ElixaMascot pose="thinking" size="sm" className="shrink-0" />
              <div className="flex-1">
                <AlertTitle className="flex items-center justify-between">
                  <span>Low Credit Balance</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 -mr-2"
                    onClick={() => setLowCreditDismissed(true)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="mb-3">
                    You have only <strong>{creditsRemaining.toLocaleString()} credits</strong> remaining. 
                    Top up now to avoid interruptions to your AI workflows.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => setCreditDialogOpen(true)}
                      className="gap-1"
                    >
                      <Coins className="h-4 w-4" />
                      Top Up Credits
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpgrade("pro")}
                      disabled={upgradingPlan === "pro"}
                    >
                      {upgradingPlan === "pro" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Upgrade Plan"
                      )}
                    </Button>
                  </div>
                </AlertDescription>
              </div>
            </div>
          </Alert>
        )}
        {/* Current Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your current subscription and usage</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-lg px-4 py-1">
                  {currentPlanData.name}
                </Badge>
                {currentPlan === "trial" && daysRemaining > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {daysRemaining} days left
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingUsage ? (
              <UsageLoadingSkeleton />
            ) : (
              <>
                {/* AI Credits */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      AI Credits
                    </span>
                    <span className="font-medium">
                      {orgData?.is_unlimited ? (
                        <span className="text-primary">Unlimited</span>
                      ) : (
                        <>
                          {creditsRemaining.toLocaleString()} remaining
                          <span className="text-muted-foreground ml-1">
                            ({creditsUsed.toLocaleString()} / {totalAvailable.toLocaleString()} used)
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  {!orgData?.is_unlimited && <Progress value={creditUsagePercent} className="h-2" />}
                </div>

                {/* Premium Models Access */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Premium AI Models (GPT, Gemini Pro)
                  </span>
                  {orgData?.has_premium_models ? (
                    <Badge variant="default" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <Lock className="h-3 w-3" />
                      Upgrade to unlock
                    </Badge>
                  )}
                </div>

                {/* Connectors */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Connectors
                  </span>
                  <span className="font-medium">
                    {orgData?.connector_limit === null || orgData?.connector_limit === undefined 
                      ? "Unlimited" 
                      : `${orgData.connector_limit} max`}
                  </span>
                </div>

                {/* Storage */}
                <div className="text-sm text-muted-foreground">
                  Storage used: {formatBytes(usageStats?.storage_bytes_used || 0)}
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t flex flex-wrap gap-2">
                  <Button onClick={() => setCreditDialogOpen(true)} variant="outline">
                    <Coins className="h-4 w-4 mr-2" />
                    Top Up Credits
                    <span className="ml-2 text-muted-foreground">£0.06/credit</span>
                  </Button>
                  {currentPlan !== "trial" && (
                    <Button 
                      onClick={handleManageSubscription} 
                      variant="outline"
                      disabled={openingPortal}
                    >
                      {openingPortal ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Settings className="h-4 w-4 mr-2" />
                      )}
                      Manage Subscription
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
          <CardGrid columns={4}>
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              return (
                <Card
                  key={plan.name}
                  className={`relative ${
                    plan.highlighted 
                      ? "border-primary shadow-lg" 
                      : ""
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Zap className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-baseline gap-1">
                      <span className="text-2xl">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm font-normal text-muted-foreground">
                          {plan.period}
                        </span>
                      )}
                    </CardTitle>
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    {/* Promo code section - only for non-current, non-trial plans */}
                    {!isCurrent && !plan.trial && (
                      <Collapsible 
                        open={promoOpenForPlan === plan.id} 
                        onOpenChange={(open) => {
                          setPromoOpenForPlan(open ? plan.id : null);
                          if (!open) setPromoCode("");
                        }}
                      >
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground p-0 h-auto text-xs">
                            <Tag className="h-3 w-3" />
                            Promo code?
                            {promoOpenForPlan === plan.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-2">
                          <Input
                            placeholder="Enter code"
                            value={promoOpenForPlan === plan.id ? promoCode : ""}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            className="uppercase text-sm h-8"
                          />
                        </CollapsibleContent>
                      </Collapsible>
                    )}
                    
                    <Button
                      variant={isCurrent ? "outline" : plan.highlighted ? "default" : "secondary"}
                      className="w-full"
                      disabled={isCurrent || plan.trial || upgradingPlan === plan.id}
                      onClick={() => handleUpgrade(plan.id, promoOpenForPlan === plan.id ? promoCode : undefined)}
                    >
                      {upgradingPlan === plan.id ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          Opening checkout...
                        </>
                      ) : isCurrent ? (
                        "Current Plan"
                      ) : plan.trial ? (
                        "Trial Only"
                      ) : (
                        <>
                          Upgrade <ArrowRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </CardGrid>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Your past invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              No billing history available yet.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Purchase Dialog */}
      <CreditPurchaseDialog
        open={creditDialogOpen}
        onOpenChange={setCreditDialogOpen}
        currentCredits={creditsRemaining}
      />
    </PageLayout>
  );
};

// Loading skeleton for the usage section
const UsageLoadingSkeleton = () => (
  <div className="space-y-6">
    {/* Credits skeleton */}
    <div className="space-y-2">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
      </div>
      <Skeleton className="h-2 w-full" />
    </div>
    
    {/* Premium models skeleton */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="h-5 w-20" />
    </div>
    
    {/* Connectors skeleton */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
    </div>
    
    {/* Storage skeleton */}
    <Skeleton className="h-4 w-32" />
    
    {/* Buttons skeleton */}
    <div className="pt-4 border-t flex gap-2">
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-10 w-44" />
    </div>
  </div>
);

// Full page loading skeleton
const BillingLoadingSkeleton = () => (
  <div className="max-w-5xl mx-auto space-y-6">
    {/* Current Plan Card Skeleton */}
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <UsageLoadingSkeleton />
      </CardContent>
    </Card>
    
    {/* Plans Grid Skeleton */}
    <div>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-8 w-20" />
              <div className="space-y-1">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
    
    {/* Billing History Skeleton */}
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  </div>
);

export default Billing;
