import { useState, useEffect } from "react";
import { CreditCard, Zap, CheckCircle, ArrowRight, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTeam } from "@/hooks/useTeam";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface UsageStats {
  ai_calls: number;
  tool_executions: number;
  documents_uploaded: number;
  storage_bytes_used: number;
}

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For individuals getting started",
    features: [
      "1 workspace",
      "3 team members",
      "1,000 AI credits/month",
      "5 integrations",
      "Community support",
    ],
    limits: { ai_calls: 1000, tool_executions: 500, documents: 50 },
    current: true,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For growing teams",
    features: [
      "Unlimited workspaces",
      "10 team members",
      "10,000 AI credits/month",
      "Unlimited integrations",
      "Priority support",
      "Custom branding",
    ],
    limits: { ai_calls: 10000, tool_executions: 5000, documents: 500 },
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Unlimited AI credits",
      "SSO & SAML",
      "Dedicated support",
      "SLA guarantee",
    ],
    limits: { ai_calls: Infinity, tool_executions: Infinity, documents: Infinity },
  },
];

const Billing = () => {
  const { user } = useAuth();
  const { organization, loading } = useTeam();
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!organization?.id) {
        setLoadingUsage(false);
        return;
      }

      try {
        const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
        
        const { data, error } = await supabase
          .from("usage_stats")
          .select("*")
          .eq("org_id", organization.id)
          .eq("month", currentMonth)
          .maybeSingle();

        if (!error && data) {
          setUsageStats(data as UsageStats);
        } else {
          // No usage data yet, show zeros
          setUsageStats({
            ai_calls: 0,
            tool_executions: 0,
            documents_uploaded: 0,
            storage_bytes_used: 0,
          });
        }
      } catch (error) {
        console.error("Error fetching usage:", error);
      } finally {
        setLoadingUsage(false);
      }
    };

    fetchUsage();
  }, [organization?.id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const currentPlan = organization?.plan || "free";
  const currentPlanData = plans.find(p => p.name.toLowerCase() === currentPlan) || plans[0];
  
  const aiCreditsUsed = usageStats?.ai_calls || 0;
  const aiCreditsLimit = currentPlanData.limits?.ai_calls || 1000;
  const aiUsagePercent = Math.min((aiCreditsUsed / aiCreditsLimit) * 100, 100);
  
  const toolsUsed = usageStats?.tool_executions || 0;
  const toolsLimit = currentPlanData.limits?.tool_executions || 500;
  const toolsUsagePercent = Math.min((toolsUsed / toolsLimit) * 100, 100);

  const docsUploaded = usageStats?.documents_uploaded || 0;
  const docsLimit = currentPlanData.limits?.documents || 50;
  const docsUsagePercent = Math.min((docsUploaded / docsLimit) * 100, 100);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <header className="border-b bg-card/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Billing</h1>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Current Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your current subscription and usage</CardDescription>
              </div>
              <Badge variant="outline" className="capitalize text-lg px-4 py-1">
                {currentPlan}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingUsage ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : (
              <>
                {/* AI Credits */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      AI Credits Used
                    </span>
                    <span className="font-medium">
                      {aiCreditsUsed.toLocaleString()} / {aiCreditsLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={aiUsagePercent} className="h-2" />
                </div>

                {/* Tool Executions */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Tool Executions
                    </span>
                    <span className="font-medium">
                      {toolsUsed.toLocaleString()} / {toolsLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={toolsUsagePercent} className="h-2" />
                </div>

                {/* Documents */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Documents Uploaded</span>
                    <span className="font-medium">
                      {docsUploaded} / {docsLimit}
                    </span>
                  </div>
                  <Progress value={docsUsagePercent} className="h-2" />
                </div>

                {/* Storage */}
                <div className="text-sm text-muted-foreground">
                  Storage used: {formatBytes(usageStats?.storage_bytes_used || 0)}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Plans */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Plans</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
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
                  <Button
                    variant={plan.current ? "outline" : plan.highlighted ? "default" : "secondary"}
                    className="w-full"
                    disabled={plan.current}
                  >
                    {plan.current ? (
                      "Current Plan"
                    ) : (
                      <>
                        Upgrade <ArrowRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>Your past invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              No billing history available. You're on the free plan.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Billing;
