import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Loader2, X, ChevronRight, ChevronLeft, Check, Cloud, Server, Code, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AgentSubmission } from "@/hooks/useDeveloperPortal";
import { HostingTypeSelector } from "./HostingTypeSelector";
import { PlatformHostedFields } from "./PlatformHostedFields";
import { SelfHostedFields } from "./SelfHostedFields";

interface AgentSubmissionFormProps {
  onSubmit: (agent: Partial<AgentSubmission>) => Promise<any>;
  userId?: string;
}

const CATEGORIES = ["productivity", "sales", "research", "customer-support", "marketing", "engineering", "hr", "finance", "other"];

const AVAILABLE_TOOLS = [
  "gmail", "google-calendar", "google-sheets", "slack", "notion",
  "shopify", "stripe", "hubspot", "jira", "github",
  "salesforce", "asana", "clickup", "zendesk", "freshdesk",
];

export const AgentSubmissionForm = ({ onSubmit, userId }: AgentSubmissionFormProps) => {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [hostingType, setHostingType] = useState<"platform" | "self_hosted">("platform");

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

  // Step 3: Assets
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
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
    if (codeFile && hostingType === "platform") codeFileUrl = await uploadFile(codeFile, "code");

    await onSubmit({
      name,
      description,
      category,
      version,
      hosting_type: hostingType,
      runtime,
      system_prompt: systemPrompt || null,
      allowed_tools: selectedTools.length > 0 ? selectedTools : null,
      icon_url: iconUrl,
      code_file_url: codeFileUrl,
      requirements: hostingType === "platform" ? requirements || null : null,
      entry_function: hostingType === "platform" ? entryFunction : null,
      external_endpoint_url: hostingType === "self_hosted" ? endpointUrl : null,
      external_auth_header: hostingType === "self_hosted" ? authHeader || null : null,
      external_auth_token: hostingType === "self_hosted" ? authToken || null : null,
    });

    // Reset form
    setStep(1);
    setName(""); setDescription(""); setCategory(""); setVersion("1.0.0");
    setHostingType("platform"); setSystemPrompt(""); setSelectedTools([]);
    setCodeFile(null); setRequirements(""); setEntryFunction("handle"); setRuntime("python");
    setEndpointUrl(""); setAuthHeader(""); setAuthToken("");
    setIconFile(null); setIconPreview(null);
    setSaving(false);
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) {
      if (hostingType === "self_hosted") return endpointUrl.trim().length > 0;
      return true;
    }
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Agent</CardTitle>
        <CardDescription>Step {step} of 4</CardDescription>
        <div className="flex gap-1 mt-2">
          {[1, 2, 3, 4].map((s) => (
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

        {step === 2 && hostingType === "platform" && (
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

        {step === 2 && hostingType === "self_hosted" && (
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

        {step === 3 && (
          <div className="space-y-2">
            <Label>Agent Icon</Label>
            <Input type="file" accept="image/*" onChange={handleIconChange} />
            {iconPreview && (
              <img src={iconPreview} alt="Preview" className="h-20 w-20 rounded-lg object-cover mt-2" />
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Review your agent</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Name:</span><span className="font-medium">{name}</span>
              <span className="text-muted-foreground">Category:</span><span>{category || "None"}</span>
              <span className="text-muted-foreground">Version:</span><span>{version}</span>
              <span className="text-muted-foreground">Hosting:</span>
              <span className="flex items-center gap-1">
                {hostingType === "platform" ? <Cloud className="h-3 w-3" /> : <Server className="h-3 w-3" />}
                {hostingType === "platform" ? "Platform Hosted" : "Self-Hosted"}
              </span>
              <span className="text-muted-foreground">Runtime:</span><span className="capitalize">{runtime}</span>
              {hostingType === "self_hosted" && (
                <>
                  <span className="text-muted-foreground">Endpoint:</span>
                  <span className="truncate">{endpointUrl}</span>
                </>
              )}
              {hostingType === "platform" && codeFile && (
                <>
                  <span className="text-muted-foreground">Code File:</span>
                  <span>{codeFile.name}</span>
                </>
              )}
              <span className="text-muted-foreground">Tools:</span><span>{selectedTools.length > 0 ? selectedTools.join(", ") : "None"}</span>
              <span className="text-muted-foreground">Icon:</span><span>{iconFile ? iconFile.name : "None"}</span>
            </div>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < 4 ? (
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
