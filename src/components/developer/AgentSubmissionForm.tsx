import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronRight, ChevronLeft, Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";
import { HostingTypeSelector } from "./HostingTypeSelector";
import { EndpointAgentFields } from "./EndpointAgentFields";
import { ColorizedMascot } from "@/components/ColorizedMascot";

interface AgentSubmissionFormProps {
  onSubmit: (agent: Partial<AgentSubmission>, actions?: any[]) => Promise<any>;
  userId?: string;
  onSuccess?: () => void;
}

const CATEGORIES = ["productivity", "sales", "research", "customer-support", "marketing", "engineering", "hr", "finance", "other"];

const AVAILABLE_TOOLS = [
  "gmail", "google-calendar", "google-sheets", "slack", "notion",
  "shopify", "stripe", "hubspot", "jira", "github",
  "salesforce", "asana", "clickup", "zendesk", "freshdesk",
];

const TOTAL_STEPS = 3;

export const AgentSubmissionForm = ({ onSubmit, userId, onSuccess }: AgentSubmissionFormProps) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [version, setVersion] = useState("1.0.0");

  // Step 2: Endpoint configuration
  const [epBaseUrl, setEpBaseUrl] = useState("");
  const [epAuthType, setEpAuthType] = useState<"none" | "api_key" | "hmac">("none");
  const [epSecret, setEpSecret] = useState("");
  const [epInvokePath, setEpInvokePath] = useState("/invoke");
  const [epHealthPath, setEpHealthPath] = useState("/health");
  const [epToolsRequired, setEpToolsRequired] = useState<string[]>([]);
  const [epCanMutate, setEpCanMutate] = useState(false);
  const [epRiskTier, setEpRiskTier] = useState<"sandbox" | "verified" | "privileged">("sandbox");

  // Avatar color selection
  const [avatarColor, setAvatarColor] = useState<string>("#4F46E5"); // Default indigo

  const PRESET_COLORS = [
    "#4F46E5", "#7C3AED", "#EC4899", "#EF4444", "#F97316",
    "#EAB308", "#22C55E", "#06B6D4", "#3B82F6", "#6366F1",
  ];

  const toggleEpTool = (tool: string) => {
    setEpToolsRequired((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };



  const handleSubmit = async () => {
    setSaving(true);
    const payload: Partial<AgentSubmission> = {
      name,
      description,
      category,
      version,
      icon_url: null,
      hosting_type: "endpoint",
      execution_mode: "endpoint",
      endpoint_base_url: epBaseUrl,
      endpoint_invoke_path: epInvokePath,
      endpoint_health_path: epHealthPath,
      endpoint_auth_type: epAuthType,
      endpoint_secret: epAuthType !== "none" ? epSecret : null,
      capability_manifest: {
        toolsRequired: epToolsRequired,
        canMutate: epCanMutate,
        riskTier: epRiskTier,
        avatarColor: avatarColor,
      },
      runtime: "endpoint",
    };

    await onSubmit(payload);
    setSaving(false);

    // Navigate to agents list to see the newly created agent
    if (onSuccess) {
      onSuccess();
    } else {
      // Fallback: reset form
      setStep(1); setName(""); setDescription(""); setCategory(""); setVersion("1.0.0");
      setEpBaseUrl(""); setEpAuthType("none"); setEpSecret(""); setEpInvokePath("/invoke"); setEpHealthPath("/health");
      setEpToolsRequired([]); setEpCanMutate(false); setEpRiskTier("sandbox");
      setAvatarColor("#4F46E5");
    }
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return epBaseUrl.trim().length > 0;
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Agent</CardTitle>
        <CardDescription>Step {step} of {TOTAL_STEPS}</CardDescription>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="agent-name">Agent Name *</Label>
              <Input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="My AI Agent" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-desc">Description</Label>
              <Textarea id="agent-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does your agent do?" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace("-", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-version">Version</Label>
              <Input id="agent-version" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="1.0.0" />
            </div>
            <HostingTypeSelector hostingType="endpoint" onSelect={() => {}} />
          </>
        )}

        {step === 2 && (
          <EndpointAgentFields
            baseUrl={epBaseUrl}
            onBaseUrlChange={setEpBaseUrl}
            authType={epAuthType}
            onAuthTypeChange={setEpAuthType}
            endpointSecret={epSecret}
            onEndpointSecretChange={setEpSecret}
            invokePath={epInvokePath}
            onInvokePathChange={setEpInvokePath}
            healthPath={epHealthPath}
            onHealthPathChange={setEpHealthPath}
            toolsRequired={epToolsRequired}
            onToggleTool={toggleEpTool}
            availableTools={AVAILABLE_TOOLS}
            canMutate={epCanMutate}
            onCanMutateChange={setEpCanMutate}
            riskTier={epRiskTier}
            onRiskTierChange={setEpRiskTier}
          />
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column: color + review */}
            <div className="space-y-5">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Agent Brand Color</Label>
                <p className="text-xs text-muted-foreground">Pick a color that represents your agent's identity</p>

                {/* Preset swatches */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatarColor(c)}
                      className={cn(
                        "h-9 w-9 rounded-full border-2 transition-all hover:scale-110",
                        avatarColor === c ? "border-foreground ring-2 ring-primary/40 scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  {/* Custom color */}
                  <label
                    className={cn(
                      "h-9 w-9 rounded-full border-2 border-dashed border-muted-foreground/40 flex items-center justify-center cursor-pointer hover:border-muted-foreground transition-colors",
                      !PRESET_COLORS.includes(avatarColor) && "border-foreground ring-2 ring-primary/40"
                    )}
                    style={!PRESET_COLORS.includes(avatarColor) ? { backgroundColor: avatarColor } : undefined}
                    title="Custom color"
                  >
                    <input
                      type="color"
                      value={avatarColor}
                      onChange={(e) => setAvatarColor(e.target.value)}
                      className="sr-only"
                    />
                    {PRESET_COLORS.includes(avatarColor) && (
                      <span className="text-muted-foreground text-xs font-bold">+</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Review summary */}
              <h3 className="font-semibold pt-2">Review</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Name:</span><span className="font-medium">{name}</span>
                <span className="text-muted-foreground">Category:</span><span>{category || "None"}</span>
                <span className="text-muted-foreground">Version:</span><span>{version}</span>
                <span className="text-muted-foreground">Hosting:</span>
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3" /> Endpoint
                </span>
                <span className="text-muted-foreground">Base URL:</span>
                <span className="truncate">{epBaseUrl}</span>
                <span className="text-muted-foreground">Auth:</span>
                <span className="capitalize">{epAuthType === "api_key" ? "API Key" : epAuthType === "hmac" ? "HMAC" : "None"}</span>
                <span className="text-muted-foreground">Risk Tier:</span>
                <span className="capitalize">{epRiskTier}</span>
              </div>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>

            {/* Right column: live preview */}
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-muted/30 p-8">
              <ColorizedMascot color={avatarColor} size="2xl" />
              <div className="text-center">
                <p className="text-lg font-semibold">{name || "Your Agent"}</p>
                <p className="text-sm text-muted-foreground font-mono">{avatarColor.toUpperCase()}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < TOTAL_STEPS ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
              Create Agent
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
