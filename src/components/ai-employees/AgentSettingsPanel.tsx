import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, Activity, Shield, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

interface AgentSettingsPanelProps {
  name: string;
  description: string | null;
  iconUrl: string | null;
  category: string | null;
  capabilityManifest: Record<string, unknown> | null;
  permissions: Record<string, unknown>;
  requiresApproval: boolean;
  riskTier: string;
  agentId: string;
  onUninstall: () => void;
  onClose: () => void;
}

export function AgentSettingsPanel({
  name,
  description,
  iconUrl,
  category,
  capabilityManifest,
  permissions,
  requiresApproval,
  riskTier,
  agentId,
  onUninstall,
  onClose,
}: AgentSettingsPanelProps) {
  const [healthStatus, setHealthStatus] = useState<"idle" | "checking" | "healthy" | "unhealthy">("idle");

  const testHealth = async () => {
    setHealthStatus("checking");
    try {
      const { data, error } = await supabase.functions.invoke("endpoint-health", {
        body: { agentId },
      });
      if (error) throw error;
      setHealthStatus(data?.healthy ? "healthy" : "unhealthy");
    } catch {
      setHealthStatus("unhealthy");
      toast.error("Health check failed");
    }
  };

  const capabilities = capabilityManifest
    ? (Array.isArray((capabilityManifest as any)?.tools)
        ? (capabilityManifest as any).tools
        : Object.keys(capabilityManifest))
    : [];

  return (
    <div className="w-[320px] border-l bg-card flex flex-col h-full flex-shrink-0">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Agent Details</h3>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Identity */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={iconUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{name}</p>
              {category && (
                <Badge variant="outline" className="text-xs mt-0.5">
                  {category.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
          </div>

          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}

          <Separator />

          {/* Capabilities */}
          {capabilities.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Capabilities
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {capabilities.map((cap: string | { name?: string }, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {typeof cap === "string" ? cap.replace(/_/g, " ") : cap.name || "Tool"}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Guardrails */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Guardrails
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" />
                  Requires Approval
                </span>
                <Badge variant={requiresApproval ? "default" : "secondary"} className="text-xs">
                  {requiresApproval ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Risk Tier</span>
                <Badge
                  variant="outline"
                  className={
                    riskTier === "sandbox"
                      ? "text-emerald-600 border-emerald-200"
                      : riskTier === "elevated"
                      ? "text-amber-600 border-amber-200"
                      : "text-muted-foreground"
                  }
                >
                  {riskTier}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5"
              onClick={testHealth}
              disabled={healthStatus === "checking"}
            >
              {healthStatus === "checking" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Activity className="h-3.5 w-3.5" />
              )}
              {healthStatus === "idle"
                ? "Test Health"
                : healthStatus === "checking"
                ? "Checking…"
                : healthStatus === "healthy"
                ? "✓ Healthy"
                : "✗ Unhealthy"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 text-destructive hover:text-destructive"
              onClick={onUninstall}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Uninstall Agent
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
