import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Cloud, Server, Globe, Send, Trash2, Bot, CheckCircle, Loader2, AlertCircle, RefreshCw, Heart, HeartCrack } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";
import { AgentTestConsole } from "./AgentTestConsole";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  POST: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  PATCH: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

interface AgentDetailSheetProps {
  agent: AgentSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitForReview: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onValidate?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const AgentDetailSheet = ({ agent, open, onOpenChange, onSubmitForReview, onDelete, onValidate }: AgentDetailSheetProps) => {
  const [validating, setValidating] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{ status: string; latencyMs?: number } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  if (!agent) return null;

  const isEndpoint = (agent.execution_mode || agent.hosting_type) === "endpoint";
  const canSubmit = agent.status === "draft" && agent.execution_status !== "error";
  const hasValidationError = agent.execution_status === "error";

  const handleRevalidate = async () => {
    if (!onValidate) return;
    setValidating(true);
    await onValidate(agent.id);
    setValidating(false);
  };

  const handleHealthCheck = async () => {
    setCheckingHealth(true);
    setHealthStatus(null);
    try {
      const { data, error } = await supabase.functions.invoke("endpoint-health", {
        body: { agentId: agent.id },
      });
      if (error) throw error;
      setHealthStatus(data);
    } catch (e) {
      setHealthStatus({ status: "error" });
    } finally {
      setCheckingHealth(false);
    }
  };

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid grid-cols-3 gap-2 text-sm py-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="col-span-2 break-words">{value || "—"}</span>
    </div>
  );

  const baseUrl = agent.external_endpoint_url?.replace(/\/$/, '') || '';
  const manifest = agent.capability_manifest as any;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            {agent.icon_url ? (
              <img src={agent.icon_url} alt={agent.name} className="h-12 w-12 rounded-xl object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <SheetTitle>{agent.name}</SheetTitle>
              <SheetDescription>{agent.description || "No description"}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge className={statusColors[agent.status] || ""}>{agent.status.replace("_", " ")}</Badge>
            <Badge variant="outline" className="gap-1">
              {isEndpoint ? <Globe className="h-3 w-3" /> : agent.hosting_type === "self_hosted" ? <Server className="h-3 w-3" /> : <Cloud className="h-3 w-3" />}
              {isEndpoint ? "Endpoint" : agent.hosting_type === "self_hosted" ? "Self-Hosted" : "Platform"}
            </Badge>
          </div>

          {/* Validation Status - Platform only */}
          {agent.hosting_type === "platform" && !isEndpoint && (
            <div className={`rounded-lg border p-3 space-y-2 ${
              agent.execution_status === "ready" ? "border-green-500/30 bg-green-500/5" :
              agent.execution_status === "error" ? "border-destructive/30 bg-destructive/5" :
              agent.execution_status === "building" ? "border-yellow-500/30 bg-yellow-500/5" :
              "border-border bg-muted/30"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {agent.execution_status === "ready" && <><CheckCircle className="h-4 w-4 text-green-500" /> Validation Passed</>}
                  {agent.execution_status === "building" && <><Loader2 className="h-4 w-4 text-yellow-500 animate-spin" /> Validating...</>}
                  {agent.execution_status === "error" && <><AlertCircle className="h-4 w-4 text-destructive" /> Validation Failed</>}
                  {!["ready", "building", "error"].includes(agent.execution_status) && <><AlertCircle className="h-4 w-4 text-muted-foreground" /> Not Validated</>}
                </div>
                {onValidate && agent.execution_status !== "building" && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleRevalidate} disabled={validating}>
                    {validating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                    Re-validate
                  </Button>
                )}
              </div>
              {agent.execution_error && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded font-mono whitespace-pre-wrap">
                  {agent.execution_error}
                </div>
              )}
              {hasValidationError && (
                <p className="text-xs text-muted-foreground">Fix the error above and re-validate before submitting for review.</p>
              )}
            </div>
          )}

          {/* Endpoint Health Check */}
          {isEndpoint && (
            <div className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Endpoint Health</span>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={handleHealthCheck} disabled={checkingHealth}>
                  {checkingHealth ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                  Check Health
                </Button>
              </div>
              {healthStatus && (
                <div className="flex items-center gap-2 text-sm">
                  {healthStatus.status === "healthy" ? (
                    <><Heart className="h-4 w-4 text-green-500" /> <span className="text-green-600">Healthy</span></>
                  ) : (
                    <><HeartCrack className="h-4 w-4 text-destructive" /> <span className="text-destructive">Unhealthy</span></>
                  )}
                  {healthStatus.latencyMs && (
                    <span className="text-muted-foreground text-xs">({healthStatus.latencyMs}ms)</span>
                  )}
                </div>
              )}
            </div>
          )}

          {agent.review_notes && agent.status === "rejected" && (
            <div className="bg-destructive/5 text-destructive text-sm rounded-md p-3">
              <strong>Review Notes:</strong> {agent.review_notes}
            </div>
          )}

          <Separator />

          {/* Metadata */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Details</h4>
            <DetailRow label="Category" value={agent.category} />
            <DetailRow label="Version" value={agent.version || "1.0.0"} />
            {!isEndpoint && <DetailRow label="Runtime" value={<span className="capitalize">{agent.runtime}</span>} />}
            <DetailRow label="Downloads" value={agent.download_count} />
            <DetailRow label="Slug" value={<code className="text-xs bg-muted px-1 rounded">{agent.slug}</code>} />
          </div>

          <Separator />

          {/* Hosting Config */}
          <div>
            <h4 className="text-sm font-semibold mb-2">
              {isEndpoint ? "Endpoint Configuration" : "Hosting Configuration"}
            </h4>
            {isEndpoint ? (
              <>
                <DetailRow label="Base URL" value={agent.endpoint_base_url} />
                <DetailRow label="Invoke Path" value={agent.endpoint_invoke_path || "/invoke"} />
                <DetailRow label="Health Path" value={agent.endpoint_health_path || "/health"} />
                <DetailRow label="Auth Type" value={
                  <span className="capitalize">{agent.endpoint_auth_type === "api_key" ? "API Key" : agent.endpoint_auth_type === "hmac" ? "HMAC" : "None"}</span>
                } />
                {manifest && (
                  <>
                    <DetailRow label="Can Mutate" value={manifest.canMutate ? "Yes" : "No"} />
                    <DetailRow label="Risk Tier" value={<span className="capitalize">{manifest.riskTier || "sandbox"}</span>} />
                    {manifest.toolsRequired?.length > 0 && (
                      <DetailRow label="Tools" value={
                        <div className="flex flex-wrap gap-1">
                          {manifest.toolsRequired.map((t: string) => (
                            <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                          ))}
                        </div>
                      } />
                    )}
                  </>
                )}
              </>
            ) : agent.hosting_type === "self_hosted" ? (
              <>
                <DetailRow label="Base URL" value={agent.external_endpoint_url} />
                <DetailRow label="Auth Header" value={agent.external_auth_header} />
              </>
            ) : (
              <>
                <DetailRow label="Code File" value={agent.code_file_url ? "Uploaded" : "None"} />
                <DetailRow label="Entry Function" value={agent.entry_function} />
                <DetailRow label="Requirements" value={agent.requirements} />
              </>
            )}
          </div>

          {/* Actions (self-hosted) */}
          {agent.hosting_type === "self_hosted" && !isEndpoint && agent.actions && agent.actions.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Actions ({agent.actions.length})</h4>
                <div className="space-y-2">
                  {agent.actions.map((action) => (
                    <div key={action.id} className="rounded-md border p-2.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={`${METHOD_COLORS[action.method] || ""} text-[10px] px-1.5 py-0`}>{action.method}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{baseUrl}{action.path}</span>
                      </div>
                      <p className="text-sm font-medium">{action.action_name}</p>
                      {action.description && <p className="text-xs text-muted-foreground">{action.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* System Prompt & Tools */}
          {!isEndpoint && (agent.system_prompt || (agent.allowed_tools && agent.allowed_tools.length > 0)) && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">AI Configuration</h4>
                {agent.system_prompt && (
                  <div className="mb-2">
                    <p className="text-xs text-muted-foreground mb-1">System Prompt</p>
                    <p className="text-sm bg-muted p-2 rounded-md whitespace-pre-wrap max-h-32 overflow-y-auto">{agent.system_prompt}</p>
                  </div>
                )}
                {agent.allowed_tools && agent.allowed_tools.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Allowed Tools</p>
                    <div className="flex flex-wrap gap-1">
                      {agent.allowed_tools.map((t) => (
                        <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Timeline */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Timeline</h4>
            <DetailRow label="Created" value={format(new Date(agent.created_at), "MMM d, yyyy HH:mm")} />
            {agent.submitted_at && <DetailRow label="Submitted" value={format(new Date(agent.submitted_at), "MMM d, yyyy HH:mm")} />}
            {agent.reviewed_at && <DetailRow label="Reviewed" value={format(new Date(agent.reviewed_at), "MMM d, yyyy HH:mm")} />}
            <DetailRow label="Updated" value={format(new Date(agent.updated_at), "MMM d, yyyy HH:mm")} />
          </div>

          {/* Test Console */}
          {(isEndpoint || (agent.hosting_type === "self_hosted" && agent.external_endpoint_url) || (agent.hosting_type === "platform" && agent.execution_status === "ready")) && (
            <>
              <Separator />
              <AgentTestConsole agent={agent} />
            </>
          )}

          {/* Actions */}
          <Separator />
          <div className="flex gap-2 pt-2">
            {agent.status === "draft" && (
              <div className="flex flex-col gap-1.5">
                <Button size="sm" onClick={() => { onSubmitForReview(agent.id); onOpenChange(false); }} disabled={!canSubmit}>
                  <Send className="h-3 w-3 mr-1" /> Submit for Review
                </Button>
                {hasValidationError && !isEndpoint && (
                  <p className="text-xs text-destructive">Fix validation errors before submitting.</p>
                )}
              </div>
            )}
            {(agent.status === "draft" || agent.status === "rejected") && (
              <Button size="sm" variant="destructive" onClick={() => { onDelete(agent.id); onOpenChange(false); }}>
                <Trash2 className="h-3 w-3 mr-1" /> Delete
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
