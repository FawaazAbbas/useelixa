import { useState, useRef, useEffect, useCallback } from "react";
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

import ElixaMascotSvg from "@/assets/mascots/Elixa-Mascot-SVG.svg";

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

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 255, g: 255, b: 255 };
}

/** Canvas-based recolored mascot preview */
const CanvasRecoloredMascot = ({
  avatarColor,
  sizePx = 192,
  className,
}: {
  avatarColor: string;
  sizePx?: number;
  className?: string;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !img.complete) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    if (avatarColor) {
      const { r, g, b } = hexToRgb(avatarColor);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = (data[i] * r) / 255;
        data[i + 1] = (data[i + 1] * g) / 255;
        data[i + 2] = (data[i + 2] * b) / 255;
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }, [avatarColor]);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setLoaded(true);
    };
    img.src = ElixaMascotSvg;
  }, []);

  useEffect(() => {
    if (loaded) draw();
  }, [loaded, draw]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("object-contain rounded-xl", className)}
      style={{ width: sizePx, height: sizePx }}
    />
  );
};

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

  // Avatar color (hex string, empty = original)
  const [avatarHue, setAvatarHue] = useState(0); // 0 = original, 1-360 = hue
  const avatarColor = avatarHue > 0 ? hslToHex(avatarHue, 80, 50) : "";

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
      iconUrl = ElixaMascotSvg;
    }

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
        avatarSvgPath: ElixaMascotSvg,
        avatarColor: avatarColor || null,
      },
      runtime: "endpoint",
    };

    await onSubmit(payload);

    // Reset
    setStep(1); setName(""); setDescription(""); setCategory(""); setVersion("1.0.0");
    setEpBaseUrl(""); setEpAuthType("none"); setEpSecret(""); setEpInvokePath("/invoke"); setEpHealthPath("/health");
    setEpToolsRequired([]); setEpCanMutate(false); setEpRiskTier("sandbox");
    setIconFile(null); setIconPreview(null); setUseCustomIcon(false);
    setAvatarHue(0);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column: controls + review */}
            <div className="space-y-5">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Agent Avatar Color</Label>
                <p className="text-xs text-muted-foreground">Slide to recolor your agent's avatar, or leave at "Original"</p>

                {/* Small preview */}
                <div className="flex justify-center py-2">
                  <CanvasRecoloredMascot avatarColor={avatarColor} sizePx={80} />
                </div>

                {/* Hue slider */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={360}
                      value={avatarHue}
                      onChange={(e) => setAvatarHue(Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: "linear-gradient(to right, #ccc 0%, #ccc 0.5%, #ff0000 1%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                      }}
                    />
                    <span className="text-xs text-muted-foreground w-20 text-right shrink-0">
                      {avatarHue === 0 ? "Original" : avatarColor}
                    </span>
                  </div>
                  {avatarHue > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground h-6 px-2"
                      onClick={() => setAvatarHue(0)}
                    >
                      Reset to original
                    </Button>
                  )}
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
                <span className="text-muted-foreground">Avatar Color:</span>
                <span>{avatarColor || "Original"}</span>
              </div>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>

            {/* Right column: large avatar preview */}
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-muted/30 p-8">
              {useCustomIcon && iconPreview ? (
                <img
                  src={iconPreview}
                  alt="Custom avatar preview"
                  className="h-48 w-48 object-contain drop-shadow-lg"
                />
              ) : (
                <CanvasRecoloredMascot avatarColor={avatarColor} sizePx={192} className="drop-shadow-lg" />
              )}
              <div className="text-center">
                <p className="text-lg font-semibold">{name || "Your Agent"}</p>
                <p className="text-sm text-muted-foreground">
                  {useCustomIcon ? "Custom icon" : avatarColor ? `Color: ${avatarColor}` : "Original colors"}
                </p>
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
