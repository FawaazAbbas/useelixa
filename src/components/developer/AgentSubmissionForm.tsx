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

import ElixaCelebrating from "@/assets/mascots/Elixa-Mascot-Celebrating.png";
import ElixaPointingLeft from "@/assets/mascots/Elixa-Mascot-Pointing-Left.png";
import ElixaPointingRight from "@/assets/mascots/Elixa-Mascot-Pointing-Right.png";
import ElixaRelaxed from "@/assets/mascots/Elixa-Mascot-Relaxed.png";
import ElixaSearch from "@/assets/mascots/Elixa-Mascot-Search.png";
import ElixaSitting from "@/assets/mascots/Elixa-Mascot-Sitting.png";
import ElixaThinking from "@/assets/mascots/Elixa-Mascot-Thinking.png";
import ElixaWaving from "@/assets/mascots/Elixa-Mascot-Waving.png";
import ElixaDefault from "@/assets/mascots/Elixa-Mascot.png";

const MASCOT_OPTIONS = [
  { src: ElixaDefault, label: "Default" },
  { src: ElixaWaving, label: "Waving" },
  { src: ElixaCelebrating, label: "Celebrating" },
  { src: ElixaThinking, label: "Thinking" },
  { src: ElixaSearch, label: "Search" },
  { src: ElixaRelaxed, label: "Relaxed" },
  { src: ElixaSitting, label: "Sitting" },
  { src: ElixaPointingLeft, label: "Pointing Left" },
  { src: ElixaPointingRight, label: "Pointing Right" },
];

const AVATAR_COLORS = [
  { name: "Original", value: "none", bg: "bg-transparent", ring: "ring-border" },
  { name: "Blue", value: "hue-rotate-180", bg: "bg-blue-500/20", ring: "ring-blue-500" },
  { name: "Purple", value: "hue-rotate-270", bg: "bg-purple-500/20", ring: "ring-purple-500" },
  { name: "Green", value: "hue-rotate-90", bg: "bg-green-500/20", ring: "ring-green-500" },
  { name: "Orange", value: "hue-rotate-30 saturate-150", bg: "bg-orange-500/20", ring: "ring-orange-500" },
  { name: "Pink", value: "hue-rotate-315 saturate-150", bg: "bg-pink-500/20", ring: "ring-pink-500" },
  { name: "Cyan", value: "hue-rotate-150", bg: "bg-cyan-500/20", ring: "ring-cyan-500" },
];

interface AgentSubmissionFormProps {
  onSubmit: (agent: Partial<AgentSubmission>, actions?: any[]) => Promise<any>;
  userId?: string;
}

const CATEGORIES = ["productivity", "sales", "research", "customer-support", "marketing", "engineering", "hr", "finance", "other"];

const AVAILABLE_TOOLS = [
  "gmail", "google-calendar", "google-sheets", "slack", "notion",
  "shopify", "stripe", "hubspot", "jira", "github",
  "salesforce", "asana", "clickup", "zendesk", "freshdesk",
];

const TOTAL_STEPS = 3;

export const AgentSubmissionForm = ({ onSubmit, userId }: AgentSubmissionFormProps) => {
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

  // Avatar selection
  const [selectedMascot, setSelectedMascot] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  // Custom icon (fallback)
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [useCustomIcon, setUseCustomIcon] = useState(false);

  const toggleEpTool = (tool: string) => {
    setEpToolsRequired((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    if (!userId) return null;
    const ext = file.name.split(".").pop();
    const path = `${userId}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("agent-assets").upload(path, file);
    if (error) return null;
    const { data } = supabase.storage.from("agent-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async () => {
    setSaving(true);
    let iconUrl: string | null = null;
    if (useCustomIcon && iconFile) {
      iconUrl = await uploadFile(iconFile, "icons");
    } else {
      // Use the selected mascot path as the icon_url
      iconUrl = MASCOT_OPTIONS[selectedMascot].src;
    }

    const avatarColor = AVATAR_COLORS[selectedColor].value;

    const payload: Partial<AgentSubmission> = {
      name,
      description,
      category,
      version,
      icon_url: iconUrl,
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

    // Reset
    setStep(1); setName(""); setDescription(""); setCategory(""); setVersion("1.0.0");
    setEpBaseUrl(""); setEpAuthType("none"); setEpSecret(""); setEpInvokePath("/invoke"); setEpHealthPath("/health");
    setEpToolsRequired([]); setEpCanMutate(false); setEpRiskTier("sandbox");
    setIconFile(null); setIconPreview(null); setUseCustomIcon(false);
    setSelectedMascot(0); setSelectedColor(0);
    setSaving(false);
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
          <div className="space-y-5">
            {/* Avatar Picker */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Choose Agent Avatar</Label>
              <p className="text-xs text-muted-foreground">Select an Elixa pose and color for your agent's avatar</p>
              
              {/* Mascot pose grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {MASCOT_OPTIONS.map((mascot, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setSelectedMascot(i); setUseCustomIcon(false); }}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-xl border-2 p-2 transition-all hover:scale-105",
                      selectedMascot === i && !useCustomIcon
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <img
                      src={mascot.src}
                      alt={mascot.label}
                      className={cn(
                        "h-14 w-14 object-contain",
                        AVATAR_COLORS[selectedColor].value !== "none" && `filter ${AVATAR_COLORS[selectedColor].value}`
                      )}
                    />
                    <span className="text-[10px] text-muted-foreground leading-tight">{mascot.label}</span>
                    {selectedMascot === i && !useCustomIcon && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-2.5 w-2.5 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Color picker */}
              <div className="space-y-2">
                <Label className="text-sm">Avatar Color</Label>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.map((color, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedColor(i)}
                      className={cn(
                        "h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background transition-all",
                        color.bg,
                        selectedColor === i ? color.ring : "ring-transparent hover:ring-muted-foreground/50"
                      )}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                <img
                  src={useCustomIcon && iconPreview ? iconPreview : MASCOT_OPTIONS[selectedMascot].src}
                  alt="Avatar preview"
                  className={cn(
                    "h-16 w-16 rounded-xl object-contain bg-background p-1",
                    !useCustomIcon && AVATAR_COLORS[selectedColor].value !== "none" && `filter ${AVATAR_COLORS[selectedColor].value}`
                  )}
                />
                <div className="text-sm">
                  <p className="font-medium">{name || "Your Agent"}</p>
                  <p className="text-muted-foreground text-xs">
                    {useCustomIcon ? "Custom icon" : `${MASCOT_OPTIONS[selectedMascot].label} · ${AVATAR_COLORS[selectedColor].name}`}
                  </p>
                </div>
              </div>

              {/* Custom upload toggle */}
              <div className="pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                  onClick={() => setUseCustomIcon(!useCustomIcon)}
                >
                  {useCustomIcon ? "← Use Elixa avatar instead" : "Or upload a custom icon →"}
                </Button>
                {useCustomIcon && (
                  <div className="mt-2">
                    <Input type="file" accept="image/*" onChange={handleIconChange} />
                  </div>
                )}
              </div>
            </div>

            {/* Review summary */}
            <h3 className="font-semibold">Review your agent</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Name:</span><span className="font-medium">{name}</span>
              <span className="text-muted-foreground">Category:</span><span>{category || "None"}</span>
              <span className="text-muted-foreground">Version:</span><span>{version}</span>
              <span className="text-muted-foreground">Hosting:</span>
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" /> Endpoint Agent
              </span>
              <span className="text-muted-foreground">Base URL:</span>
              <span className="truncate">{epBaseUrl}</span>
              <span className="text-muted-foreground">Auth:</span>
              <span className="capitalize">{epAuthType === "api_key" ? "API Key" : epAuthType === "hmac" ? "HMAC" : "None"}</span>
              <span className="text-muted-foreground">Invoke:</span>
              <span className="font-mono text-xs">{epInvokePath}</span>
              <span className="text-muted-foreground">Risk Tier:</span>
              <span className="capitalize">{epRiskTier}</span>
              <span className="text-muted-foreground">Tools:</span>
              <span>{epToolsRequired.length > 0 ? epToolsRequired.join(", ") : "None"}</span>
              <span className="text-muted-foreground">Avatar:</span>
              <span>{useCustomIcon ? (iconFile?.name || "Custom") : `${MASCOT_OPTIONS[selectedMascot].label} (${AVATAR_COLORS[selectedColor].name})`}</span>
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
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
