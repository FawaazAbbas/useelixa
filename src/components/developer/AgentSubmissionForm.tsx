import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronRight, ChevronLeft, Check, Cloud, Server, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";
import { HostingTypeSelector } from "./HostingTypeSelector";
import { PlatformHostedFields } from "./PlatformHostedFields";
import { SelfHostedFields } from "./SelfHostedFields";
import { EndpointAgentFields } from "./EndpointAgentFields";
import { AgentActionsEditor, type AgentActionDraft } from "./AgentActionsEditor";

interface AgentSubmissionFormProps {
  onSubmit: (agent: Partial<AgentSubmission>, actions?: AgentActionDraft[]) => Promise<any>;
  userId?: string;
}

const CATEGORIES = ["productivity", "sales", "research", "customer-support", "marketing", "engineering", "hr", "finance", "other"];

const AVAILABLE_TOOLS = [
  "gmail", "google-calendar", "google-sheets", "slack", "notion",
  "shopify", "stripe", "hubspot", "jira", "github",
  "salesforce", "asana", "clickup", "zendesk", "freshdesk",
];

const DEFAULT_ACTION: AgentActionDraft = { action_name: "handle", path: "/handle", method: "POST", description: "" };

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  POST: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  PATCH: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

export const AgentSubmissionForm = ({ onSubmit, userId }: AgentSubmissionFormProps) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [hostingType, setHostingType] = useState<"platform" | "self_hosted" | "endpoint">("platform");

  // Step 2: Configuration (Platform-hosted)
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [codeFile, setCodeFile] = useState<File | null>(null);
  const [requirements, setRequirements] = useState("");
  const [entryFunction, setEntryFunction] = useState("handle");
  const [runtime, setRuntime] = useState("python");

  // Step 2: Configuration (Self-hosted)
  const [endpointUrl, setEndpointUrl] = useState("");
  const [authHeader, setAuthHeader] = useState("");
  const [authToken, setAuthToken] = useState("");

  // Step 2: Configuration (Endpoint agent)
  const [epBaseUrl, setEpBaseUrl] = useState("");
  const [epAuthType, setEpAuthType] = useState<"none" | "api_key" | "hmac">("none");
  const [epSecret, setEpSecret] = useState("");
  const [epInvokePath, setEpInvokePath] = useState("/invoke");
  const [epHealthPath, setEpHealthPath] = useState("/health");
  const [epToolsRequired, setEpToolsRequired] = useState<string[]>([]);
  const [epCanMutate, setEpCanMutate] = useState(false);
  const [epRiskTier, setEpRiskTier] = useState<"sandbox" | "verified" | "privileged">("sandbox");

  // Step 3 (self-hosted only): Actions
  const [actions, setActions] = useState<AgentActionDraft[]>([{ ...DEFAULT_ACTION }]);

  // Icon
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const isSelfHosted = hostingType === "self_hosted";
  const isEndpoint = hostingType === "endpoint";
  const isPlatform = hostingType === "platform";

  // Steps: platform=4, self_hosted=5, endpoint=3 (info, config, icon+review)
  const totalSteps = isSelfHosted ? 5 : isEndpoint ? 3 : 4;
  const iconStep = isSelfHosted ? 4 : isEndpoint ? 3 : 3;
  const reviewStep = isSelfHosted ? 5 : isEndpoint ? 3 : 4;

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

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
    let codeFileUrl: string | null = null;

    if (iconFile) iconUrl = await uploadFile(iconFile, "icons");
    if (codeFile && isPlatform) codeFileUrl = await uploadFile(codeFile, "code");

    const base: Partial<AgentSubmission> = {
      name,
      description,
      category,
      version,
      icon_url: iconUrl,
    };

    if (isEndpoint) {
      Object.assign(base, {
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
        },
        runtime: "endpoint",
      });
    } else if (isSelfHosted) {
      Object.assign(base, {
        hosting_type: "self_hosted",
        runtime,
        external_endpoint_url: endpointUrl,
        external_auth_header: authHeader || null,
        external_auth_token: authToken || null,
      });
    } else {
      Object.assign(base, {
        hosting_type: "platform",
        runtime,
        system_prompt: systemPrompt || null,
        allowed_tools: selectedTools.length > 0 ? selectedTools : null,
        code_file_url: codeFileUrl,
        requirements: requirements || null,
        entry_function: entryFunction,
      });
    }

    await onSubmit(base, isSelfHosted ? actions : undefined);

    // Reset
    setStep(1); setName(""); setDescription(""); setCategory(""); setVersion("1.0.0");
    setHostingType("platform"); setSystemPrompt(""); setSelectedTools([]);
    setCodeFile(null); setRequirements(""); setEntryFunction("handle"); setRuntime("python");
    setEndpointUrl(""); setAuthHeader(""); setAuthToken("");
    setEpBaseUrl(""); setEpAuthType("none"); setEpSecret(""); setEpInvokePath("/invoke"); setEpHealthPath("/health");
    setEpToolsRequired([]); setEpCanMutate(false); setEpRiskTier("sandbox");
    setActions([{ ...DEFAULT_ACTION }]);
    setIconFile(null); setIconPreview(null);
    setSaving(false);
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) {
      if (isSelfHosted) return endpointUrl.trim().length > 0;
      if (isEndpoint) return epBaseUrl.trim().length > 0;
      return true;
    }
    if (step === 3 && isSelfHosted) {
      return actions.length > 0 && actions.every((a) => a.action_name.trim() && a.path.trim());
    }
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Agent</CardTitle>
        <CardDescription>Step {step} of {totalSteps}</CardDescription>
        <div className="flex gap-1 mt-2">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
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
            <HostingTypeSelector hostingType={hostingType} onSelect={setHostingType} />
          </>
        )}

        {step === 2 && isPlatform && (
          <PlatformHostedFields
            codeFile={codeFile}
            onCodeFileChange={setCodeFile}
            requirements={requirements}
            onRequirementsChange={setRequirements}
            entryFunction={entryFunction}
            onEntryFunctionChange={setEntryFunction}
            runtime={runtime}
            onRuntimeChange={setRuntime}
            systemPrompt={systemPrompt}
            onSystemPromptChange={setSystemPrompt}
            selectedTools={selectedTools}
            onToggleTool={toggleTool}
            availableTools={AVAILABLE_TOOLS}
          />
        )}

        {step === 2 && isSelfHosted && (
          <SelfHostedFields
            endpointUrl={endpointUrl}
            onEndpointUrlChange={setEndpointUrl}
            authHeader={authHeader}
            onAuthHeaderChange={setAuthHeader}
            authToken={authToken}
            onAuthTokenChange={setAuthToken}
            runtime={runtime}
            onRuntimeChange={setRuntime}
          />
        )}

        {step === 2 && isEndpoint && (
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

        {step === 3 && isSelfHosted && (
          <AgentActionsEditor actions={actions} onChange={setActions} baseUrl={endpointUrl} />
        )}

        {/* Icon step: for endpoint it's combined with review at step 3 */}
        {step === iconStep && !isEndpoint && (
          <div className="space-y-2">
            <Label>Agent Icon</Label>
            <Input type="file" accept="image/*" onChange={handleIconChange} />
            {iconPreview && (
              <img src={iconPreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover mt-2" />
            )}
          </div>
        )}

        {step === reviewStep && (
          <div className="space-y-3">
            {isEndpoint && (
              <div className="space-y-2">
                <Label>Agent Icon</Label>
                <Input type="file" accept="image/*" onChange={handleIconChange} />
                {iconPreview && (
                  <img src={iconPreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover mt-2" />
                )}
              </div>
            )}
            <h3 className="font-semibold">Review your agent</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Name:</span><span className="font-medium">{name}</span>
              <span className="text-muted-foreground">Category:</span><span>{category || "None"}</span>
              <span className="text-muted-foreground">Version:</span><span>{version}</span>
              <span className="text-muted-foreground">Hosting:</span>
              <span className="flex items-center gap-1">
                {isPlatform ? <Cloud className="h-3 w-3" /> : isEndpoint ? <Globe className="h-3 w-3" /> : <Server className="h-3 w-3" />}
                {isPlatform ? "Platform Hosted" : isEndpoint ? "Endpoint Agent" : "Self-Hosted"}
              </span>
              {!isEndpoint && (
                <>
                  <span className="text-muted-foreground">Runtime:</span><span className="capitalize">{runtime}</span>
                </>
              )}
              {isEndpoint && (
                <>
                  <span className="text-muted-foreground">Base URL:</span>
                  <span className="truncate">{epBaseUrl}</span>
                  <span className="text-muted-foreground">Auth:</span>
                  <span className="capitalize">{epAuthType === "api_key" ? "API Key" : epAuthType === "hmac" ? "HMAC" : "None"}</span>
                  <span className="text-muted-foreground">Invoke:</span>
                  <span className="font-mono text-xs">{epInvokePath}</span>
                  <span className="text-muted-foreground">Risk Tier:</span>
                  <span className="capitalize">{epRiskTier}</span>
                </>
              )}
              {isSelfHosted && (
                <>
                  <span className="text-muted-foreground">Base URL:</span>
                  <span className="truncate">{endpointUrl}</span>
                </>
              )}
              {isPlatform && codeFile && (
                <>
                  <span className="text-muted-foreground">Code File:</span>
                  <span>{codeFile.name}</span>
                </>
              )}
              <span className="text-muted-foreground">Tools:</span>
              <span>{isEndpoint ? (epToolsRequired.length > 0 ? epToolsRequired.join(", ") : "None") : (selectedTools.length > 0 ? selectedTools.join(", ") : "None")}</span>
              <span className="text-muted-foreground">Icon:</span><span>{iconFile ? iconFile.name : "None"}</span>
            </div>
            {isSelfHosted && actions.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Registered Actions ({actions.length})</p>
                <div className="space-y-1.5">
                  {actions.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <Badge className={`${METHOD_COLORS[a.method] || ""} text-[10px] px-1.5 py-0`}>{a.method}</Badge>
                      <span className="font-mono text-muted-foreground">{a.path}</span>
                      <span className="text-foreground">{a.action_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < reviewStep ? (
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
