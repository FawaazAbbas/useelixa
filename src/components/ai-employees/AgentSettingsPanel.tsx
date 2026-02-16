import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trash2, Activity, Shield, Loader2, X, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { AgentAvatar } from "./AgentAvatar";
import { INTEGRATION_MAPPINGS } from "@/config/integrationMapping";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState<"idle" | "checking" | "healthy" | "unhealthy">("idle");
  const [connectedKeys, setConnectedKeys] = useState<string[]>([]);

  const toolsRequired = (capabilityManifest as any)?.toolsRequired as string[] | undefined;

  useEffect(() => {
    if (!user || !toolsRequired?.length) return;
    supabase
      .from("user_credentials")
      .select("credential_type, bundle_type")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const keys = (data || []).map((c: any) => {
          const match = INTEGRATION_MAPPINGS.find(
            (m) => m.credentialType === c.credential_type && (!m.bundleType || m.bundleType === c.bundle_type)
          );
          return match?.gatewayKey;
        }).filter(Boolean) as string[];
        setConnectedKeys(keys);
      });
  }, [user, toolsRequired]);

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
            <AgentAvatar
              name={name}
              avatarColor={(capabilityManifest as any)?.avatarColor}
              iconUrl={iconUrl}
              className="h-12 w-12"
            />
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

          {/* Required Connections */}
          {toolsRequired && toolsRequired.length > 0 && (
            <>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Required Connections
                </h4>
                <div className="space-y-1.5">
                  {toolsRequired.map((key) => {
                    const mapping = INTEGRATION_MAPPINGS.find((m) => m.gatewayKey === key);
                    const isConnected = connectedKeys.includes(key);
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {mapping?.label || key.replace(/_/g, " ")}
                        </span>
                        {isConnected ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 gap-1 text-xs text-destructive"
                            onClick={() => navigate("/connections")}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Connect
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator />
            </>
          )}

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
