import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Server, Globe, Send, Trash2, Bot, Loader2, RefreshCw, Heart, HeartCrack, ChevronDown, Copy, Save } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";
import { AgentTestConsole } from "./AgentTestConsole";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const CATEGORIES = ["Productivity", "Marketing", "Sales", "Support", "Analytics", "Finance", "HR", "Engineering", "Other"];

interface AgentDetailSheetProps {
  agent: AgentSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitForReview: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onValidate?: (id: string) => Promise<{ success: boolean; error?: string }>;
  onUpdate?: (id: string, updates: Partial<AgentSubmission>) => Promise<void>;
  onDuplicate?: (agent: AgentSubmission) => void;
}

const CollapsibleSection = ({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold hover:text-primary transition-colors">
        {title}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pb-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const AgentDetailSheet = ({ agent, open, onOpenChange, onSubmitForReview, onDelete, onValidate, onUpdate, onDuplicate }: AgentDetailSheetProps) => {
  const { toast } = useToast();
  const [healthStatus, setHealthStatus] = useState<{ status: string; latencyMs?: number } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);

  // Editable fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [version, setVersion] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [invokePath, setInvokePath] = useState("");
  const [healthPath, setHealthPath] = useState("");
  const [authType, setAuthType] = useState("none");
  const [authSecret, setAuthSecret] = useState("");
  const [canMutate, setCanMutate] = useState(false);
  const [riskTier, setRiskTier] = useState("sandbox");

  // Reset fields when agent changes
  useEffect(() => {
    if (agent) {
      setName(agent.name || "");
      setDescription(agent.description || "");
      setCategory(agent.category || "");
      setVersion(agent.version || "1.0.0");
      setBaseUrl(agent.endpoint_base_url || "");
      setInvokePath(agent.endpoint_invoke_path || "/invoke");
      setHealthPath(agent.endpoint_health_path || "/health");
      setAuthType(agent.endpoint_auth_type || "none");
      setAuthSecret(agent.endpoint_secret || "");
      const manifest = agent.capability_manifest as any;
      setCanMutate(manifest?.canMutate || false);
      setRiskTier(manifest?.riskTier || "sandbox");
    }
  }, [agent]);

  if (!agent) return null;

  const isEndpoint = (agent.execution_mode || agent.hosting_type) === "endpoint";
  const canSubmit = agent.status === "draft" && agent.execution_status !== "error";

  const handleSave = async (section: string, updates: Partial<AgentSubmission>) => {
    if (!onUpdate) return;
    setSaving(section);
    await onUpdate(agent.id, updates);
    setSaving(null);
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
    } catch {
      setHealthStatus({ status: "error" });
    } finally {
      setCheckingHealth(false);
    }
  };

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

        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge className={statusColors[agent.status] || ""}>{agent.status.replace("_", " ")}</Badge>
            <Badge variant="outline" className="gap-1">
              {isEndpoint ? <Globe className="h-3 w-3" /> : <Server className="h-3 w-3" />}
              {isEndpoint ? "Endpoint" : "Legacy"}
            </Badge>
          </div>

          {agent.review_notes && agent.status === "rejected" && (
            <div className="bg-destructive/5 text-destructive text-sm rounded-md p-3">
              <strong>Review Notes:</strong> {agent.review_notes}
            </div>
          )}

          <Separator />

          {/* Basic Info - Editable */}
          <CollapsibleSection title="Basic Info" defaultOpen>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Version</Label>
                  <Input value={version} onChange={(e) => setVersion(e.target.value)} className="h-9" placeholder="1.0.0" />
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Slug: <code className="bg-muted px-1 rounded">{agent.slug}</code>
              </div>
              <Button
                size="sm"
                className="w-full"
                disabled={saving === "basic"}
                onClick={() => handleSave("basic", { name, description, category, version } as any)}
              >
                {saving === "basic" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                Save Basic Info
              </Button>
            </div>
          </CollapsibleSection>

          <Separator />

          {/* Endpoint Config - Editable */}
          {isEndpoint && (
            <>
              <CollapsibleSection title="Endpoint Configuration" defaultOpen>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Base URL</Label>
                    <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="h-9" placeholder="https://your-endpoint.com" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Invoke Path</Label>
                      <Input value={invokePath} onChange={(e) => setInvokePath(e.target.value)} className="h-9" placeholder="/invoke" />
                    </div>
                    <div>
                      <Label className="text-xs">Health Path</Label>
                      <Input value={healthPath} onChange={(e) => setHealthPath(e.target.value)} className="h-9" placeholder="/health" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Auth Type</Label>
                      <Select value={authType} onValueChange={setAuthType}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="api_key">API Key</SelectItem>
                          <SelectItem value="hmac">HMAC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {authType !== "none" && (
                      <div>
                        <Label className="text-xs">Secret</Label>
                        <Input value={authSecret} onChange={(e) => setAuthSecret(e.target.value)} className="h-9" type="password" />
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={saving === "endpoint"}
                    onClick={() => handleSave("endpoint", {
                      endpoint_base_url: baseUrl,
                      endpoint_invoke_path: invokePath,
                      endpoint_health_path: healthPath,
                      endpoint_auth_type: authType,
                      endpoint_secret: authType !== "none" ? authSecret : null,
                    } as any)}
                  >
                    {saving === "endpoint" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                    Save Endpoint Config
                  </Button>
                </div>
              </CollapsibleSection>
              <Separator />
            </>
          )}

          {/* Capability Manifest */}
          {isEndpoint && (
            <>
              <CollapsibleSection title="Capability Manifest">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Can Mutate Data</Label>
                    <Switch checked={canMutate} onCheckedChange={setCanMutate} />
                  </div>
                  <div>
                    <Label className="text-xs">Risk Tier</Label>
                    <Select value={riskTier} onValueChange={setRiskTier}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sandbox">Sandbox</SelectItem>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="elevated">Elevated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={saving === "manifest"}
                    onClick={() => handleSave("manifest", {
                      capability_manifest: {
                        ...(agent.capability_manifest as any || {}),
                        canMutate,
                        riskTier,
                      },
                    } as any)}
                  >
                    {saving === "manifest" ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                    Save Manifest
                  </Button>
                </div>
              </CollapsibleSection>
              <Separator />
            </>
          )}

          {/* Health Check */}
          {isEndpoint && (
            <>
              <CollapsibleSection title="Health Check">
                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full" onClick={handleHealthCheck} disabled={checkingHealth}>
                    {checkingHealth ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                    Check Health
                  </Button>
                  {healthStatus && (
                    <div className="flex items-center gap-2 text-sm p-2 rounded-lg border">
                      {healthStatus.status === "healthy" ? (
                        <><Heart className="h-4 w-4 text-green-500" /> <span className="text-green-600">Healthy</span></>
                      ) : (
                        <><span className="text-destructive">Unhealthy</span></>
                      )}
                      {healthStatus.latencyMs && (
                        <span className="text-muted-foreground text-xs">({healthStatus.latencyMs}ms)</span>
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleSection>
              <Separator />
            </>
          )}

          {/* Test Console */}
          {(isEndpoint || agent.external_endpoint_url) && (
            <>
              <CollapsibleSection title="Test Console">
                <AgentTestConsole agent={agent} />
              </CollapsibleSection>
              <Separator />
            </>
          )}

          {/* Timeline */}
          <CollapsibleSection title="Timeline">
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{format(new Date(agent.created_at), "MMM d, yyyy HH:mm")}</span></div>
              {agent.submitted_at && <div className="flex justify-between"><span className="text-muted-foreground">Submitted</span><span>{format(new Date(agent.submitted_at), "MMM d, yyyy HH:mm")}</span></div>}
              {agent.reviewed_at && <div className="flex justify-between"><span className="text-muted-foreground">Reviewed</span><span>{format(new Date(agent.reviewed_at), "MMM d, yyyy HH:mm")}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Updated</span><span>{format(new Date(agent.updated_at), "MMM d, yyyy HH:mm")}</span></div>
            </div>
          </CollapsibleSection>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2 pt-2 flex-wrap">
            {agent.status === "draft" && (
              <Button size="sm" onClick={() => { onSubmitForReview(agent.id); onOpenChange(false); }} disabled={!canSubmit}>
                <Send className="h-3 w-3 mr-1" /> Submit for Review
              </Button>
            )}
            {onDuplicate && (
              <Button size="sm" variant="outline" onClick={() => { onDuplicate(agent); onOpenChange(false); }}>
                <Copy className="h-3 w-3 mr-1" /> Duplicate
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Agent</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{agent.name}" and all associated execution logs. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => { onDelete(agent.id); onOpenChange(false); }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
