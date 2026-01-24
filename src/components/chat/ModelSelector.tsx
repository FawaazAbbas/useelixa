import { useState, useEffect } from "react";
import { ChevronDown, Zap, Brain, Sparkles, CreditCard, Lock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface AIModel {
  id: string;
  name: string;
  credits: number;
  speed: 1 | 2 | 3; // 1 = slow, 3 = fast
  quality: 1 | 2 | 3 | 4 | 5 | 6; // Higher = better
  description: string;
  default?: boolean;
  premium?: boolean;
}

// Standard models - Available on Free Trial and Starter
const STANDARD_MODELS: AIModel[] = [
  {
    id: "google/gemini-2.5-flash-lite",
    name: "Flash Lite",
    credits: 1,
    speed: 3,
    quality: 2,
    description: "Fast & budget-friendly",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini Flash",
    credits: 2,
    speed: 2,
    quality: 3,
    description: "Balanced (default)",
    default: true,
  },
  {
    id: "openai/gpt-5-nano",
    name: "GPT-5 Nano",
    credits: 2,
    speed: 3,
    quality: 3,
    description: "Fast OpenAI model",
  },
];

// Premium models - Only on Pro and Unlimited tiers
const PREMIUM_MODELS: AIModel[] = [
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    credits: 4,
    speed: 2,
    quality: 4,
    description: "Good performance",
    premium: true,
  },
  {
    id: "google/gemini-2.5-pro",
    name: "Gemini Pro",
    credits: 5,
    speed: 1,
    quality: 5,
    description: "Heavy reasoning",
    premium: true,
  },
  {
    id: "openai/gpt-5",
    name: "GPT-5",
    credits: 8,
    speed: 1,
    quality: 5,
    description: "Premium accuracy",
    premium: true,
  },
  {
    id: "openai/gpt-5.2",
    name: "GPT-5.2",
    credits: 10,
    speed: 1,
    quality: 6,
    description: "Enhanced reasoning",
    premium: true,
  },
];

export const AI_MODELS: AIModel[] = [...STANDARD_MODELS, ...PREMIUM_MODELS];

interface OrgTier {
  has_premium_models: boolean;
  is_unlimited: boolean;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export function ModelSelector({ selectedModel, onModelChange, className }: ModelSelectorProps) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<{ used: number; purchased: number; monthly: number } | null>(null);
  const [orgTier, setOrgTier] = useState<OrgTier | null>(null);
  const [loading, setLoading] = useState(true);

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS.find((m) => m.default)!;
  const availableCredits = credits ? (credits.monthly + credits.purchased) - credits.used : 1000;
  const hasPremiumAccess = orgTier?.has_premium_models || orgTier?.is_unlimited || false;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's org
        const { data: membership } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("user_id", user.id)
          .single();

        if (membership?.org_id) {
          // Fetch org tier info
          const { data: org } = await supabase
            .from("orgs")
            .select("has_premium_models, is_unlimited, monthly_credits")
            .eq("id", membership.org_id)
            .single();

          if (org) {
            setOrgTier({
              has_premium_models: org.has_premium_models ?? false,
              is_unlimited: org.is_unlimited ?? false,
            });
          }

          // Fetch usage
          const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
          const { data: usage } = await supabase
            .from("usage_stats")
            .select("credits_used, credits_purchased")
            .eq("org_id", membership.org_id)
            .eq("month", currentMonth)
            .maybeSingle();

          setCredits({
            used: usage?.credits_used ?? 0,
            purchased: usage?.credits_purchased ?? 0,
            monthly: org?.monthly_credits ?? 100,
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getCreditBadgeVariant = () => {
    if (availableCredits <= 10) return "destructive";
    if (availableCredits <= 50) return "secondary";
    return "outline";
  };

  const getSpeedIcon = (speed: number) => {
    return Array(speed)
      .fill(null)
      .map((_, i) => (
        <Zap key={i} className="h-3 w-3 fill-current" />
      ));
  };

  const canSelectModel = (model: AIModel) => {
    const hasCredits = availableCredits >= model.credits;
    const hasAccess = !model.premium || hasPremiumAccess;
    return hasCredits && hasAccess;
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-8">
              {currentModel.premium ? (
                <Brain className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">{currentModel.name}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Standard Models
            </div>
            {STANDARD_MODELS.map((model) => {
              const isSelected = model.id === currentModel.id;
              const canAfford = availableCredits >= model.credits;

              return (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => canAfford && onModelChange(model.id)}
                  disabled={!canAfford}
                  className={cn(
                    "flex items-center justify-between cursor-pointer",
                    isSelected && "bg-accent",
                    !canAfford && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-500">{getSpeedIcon(model.speed)}</div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">{model.name}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{model.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium">{model.credits}</span>
                    <CreditCard className="h-3 w-3 text-muted-foreground" />
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-primary ml-1" />
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
            
            <DropdownMenuSeparator />
            
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
              Premium Models
              {!hasPremiumAccess && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4">
                  <Lock className="h-2.5 w-2.5 mr-0.5" />
                  Pro
                </Badge>
              )}
            </div>
            {PREMIUM_MODELS.map((model) => {
              const isSelected = model.id === currentModel.id;
              const canAfford = availableCredits >= model.credits;
              const canSelect = canSelectModel(model);

              return (
                <Tooltip key={model.id}>
                  <TooltipTrigger asChild>
                    <div>
                      <DropdownMenuItem
                        onClick={() => canSelect && onModelChange(model.id)}
                        disabled={!canSelect}
                        className={cn(
                          "flex items-center justify-between cursor-pointer",
                          isSelected && "bg-accent",
                          !canSelect && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex text-amber-500">{getSpeedIcon(model.speed)}</div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">{model.name}</span>
                              {!hasPremiumAccess && (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground">{model.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium">{model.credits}</span>
                          <CreditCard className="h-3 w-3 text-muted-foreground" />
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-primary ml-1" />
                          )}
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </TooltipTrigger>
                  {!hasPremiumAccess && (
                    <TooltipContent side="left">
                      <p>Upgrade to Pro to unlock premium models</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant={getCreditBadgeVariant()}
              className={cn(
                "cursor-default h-6 gap-1",
                availableCredits <= 10 && "animate-pulse"
              )}
            >
              <CreditCard className="h-3 w-3" />
              <span className="tabular-nums">
                {loading ? "..." : availableCredits.toLocaleString()}
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {availableCredits <= 10
                ? "Low credits! Buy more to continue."
                : availableCredits <= 50
                ? "Credits running low"
                : "Available credits"}
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
