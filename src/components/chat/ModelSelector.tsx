import { useState, useEffect } from "react";
import { ChevronDown, Zap, Brain, Sparkles, CreditCard } from "lucide-react";
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

export const AI_MODELS: AIModel[] = [
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
  {
    id: "openai/gpt-5-mini",
    name: "GPT-5 Mini",
    credits: 4,
    speed: 2,
    quality: 4,
    description: "Good performance",
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

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  className?: string;
}

export function ModelSelector({ selectedModel, onModelChange, className }: ModelSelectorProps) {
  const { user } = useAuth();
  const [credits, setCredits] = useState<{ used: number; purchased: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS.find((m) => m.default)!;
  const availableCredits = credits ? credits.purchased - credits.used : 1000;

  useEffect(() => {
    const fetchCredits = async () => {
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
          const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
          const { data: usage } = await supabase
            .from("usage_stats")
            .select("credits_used, credits_purchased")
            .eq("org_id", membership.org_id)
            .eq("month", currentMonth)
            .maybeSingle();

          if (usage) {
            setCredits({
              used: usage.credits_used ?? 0,
              purchased: usage.credits_purchased ?? 1000,
            });
          } else {
            setCredits({ used: 0, purchased: 1000 });
          }
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
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
          <DropdownMenuContent align="end" className="w-64">
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Select AI Model
            </div>
            <DropdownMenuSeparator />
            {AI_MODELS.map((model) => {
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
                        {model.premium && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                            PRO
                          </Badge>
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
