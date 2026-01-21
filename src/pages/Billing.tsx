import { CreditCard, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTeam } from "@/hooks/useTeam";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For individuals getting started",
    features: [
      "1 workspace",
      "3 team members",
      "Basic AI features",
      "5 integrations",
      "Community support",
    ],
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
      "Advanced AI features",
      "Unlimited integrations",
      "Priority support",
      "Custom branding",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "SSO & SAML",
      "Dedicated support",
      "SLA guarantee",
      "Custom contracts",
    ],
  },
];

const Billing = () => {
  const { organization, loading } = useTeam();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const currentPlan = organization?.plan || "free";
  const usagePercent = 35; // Placeholder usage

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
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">AI Credits Used</span>
                <span className="font-medium">{usagePercent}%</span>
              </div>
              <Progress value={usagePercent} className="h-2" />
              <p className="text-xs text-muted-foreground">
                350 of 1,000 credits used this month
              </p>
            </div>
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
