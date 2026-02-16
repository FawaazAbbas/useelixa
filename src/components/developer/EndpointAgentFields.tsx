import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Key, Hash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { INTEGRATION_MAPPINGS } from "@/config/integrationMapping";

interface EndpointAgentFieldsProps {
  baseUrl: string;
  onBaseUrlChange: (v: string) => void;
  authType: "none" | "api_key" | "hmac";
  onAuthTypeChange: (v: "none" | "api_key" | "hmac") => void;
  endpointSecret: string;
  onEndpointSecretChange: (v: string) => void;
  invokePath: string;
  onInvokePathChange: (v: string) => void;
  healthPath: string;
  onHealthPathChange: (v: string) => void;
  toolsRequired: string[];
  onToggleTool: (tool: string) => void;
  availableTools: string[];
  canMutate: boolean;
  onCanMutateChange: (v: boolean) => void;
  riskTier: "sandbox" | "verified" | "privileged";
  onRiskTierChange: (v: "sandbox" | "verified" | "privileged") => void;
}

export const EndpointAgentFields = ({
  baseUrl, onBaseUrlChange,
  authType, onAuthTypeChange,
  endpointSecret, onEndpointSecretChange,
  invokePath, onInvokePathChange,
  healthPath, onHealthPathChange,
  toolsRequired, onToggleTool, availableTools,
  canMutate, onCanMutateChange,
  riskTier, onRiskTierChange,
}: EndpointAgentFieldsProps) => (
  <div className="space-y-5">
    {/* Endpoint URL */}
    <div className="space-y-2">
      <Label htmlFor="ep-base-url">Base URL *</Label>
      <Input
        id="ep-base-url"
        value={baseUrl}
        onChange={(e) => onBaseUrlChange(e.target.value)}
        placeholder="https://my-agent.example.com"
      />
      <p className="text-xs text-muted-foreground">The root URL of your agent endpoint.</p>
    </div>

    {/* Paths */}
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="ep-invoke">Invoke Path</Label>
        <Input id="ep-invoke" value={invokePath} onChange={(e) => onInvokePathChange(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ep-health">Health Path</Label>
        <Input id="ep-health" value={healthPath} onChange={(e) => onHealthPathChange(e.target.value)} />
      </div>
    </div>

    {/* Auth Type */}
    <div className="space-y-2">
      <Label>Authentication</Label>
      <div className="grid grid-cols-3 gap-2">
        {([
          { type: "none" as const, icon: Shield, label: "None" },
          { type: "api_key" as const, icon: Key, label: "API Key" },
          { type: "hmac" as const, icon: Hash, label: "HMAC" },
        ]).map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            type="button"
            onClick={() => onAuthTypeChange(type)}
            className={`flex items-center gap-2 rounded-lg border-2 p-3 text-sm transition-all ${
              authType === type ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <Icon className={`h-4 w-4 ${authType === type ? "text-primary" : "text-muted-foreground"}`} />
            {label}
          </button>
        ))}
      </div>
    </div>

    {/* Secret */}
    {authType !== "none" && (
      <div className="space-y-2">
        <Label htmlFor="ep-secret">
          {authType === "api_key" ? "API Key" : "HMAC Secret"}
        </Label>
        <Input
          id="ep-secret"
          type="password"
          value={endpointSecret}
          onChange={(e) => onEndpointSecretChange(e.target.value)}
          placeholder={authType === "api_key" ? "Bearer token value" : "HMAC shared secret"}
        />
        <p className="text-xs text-muted-foreground">
          {authType === "api_key"
            ? "Sent as Authorization: Bearer <key> with each request."
            : "Used to compute HMAC-SHA256 signature for request verification."}
        </p>
      </div>
    )}

    {/* Capability Manifest */}
    <div className="space-y-3 rounded-lg border p-4">
      <h4 className="text-sm font-semibold">Capability Manifest</h4>

      <div className="space-y-2">
        <Label>Tools Required</Label>
        <p className="text-xs text-muted-foreground">Select the OAuth integrations your agent needs via the Tool Gateway.</p>
        <TooltipProvider>
          <div className="flex flex-wrap gap-1.5">
            {availableTools.map((tool) => {
              const mapping = INTEGRATION_MAPPINGS.find((m) => m.gatewayKey === tool);
              return (
                <Tooltip key={tool}>
                  <TooltipTrigger asChild>
                    <Badge
                      variant={toolsRequired.includes(tool) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => onToggleTool(tool)}
                    >
                      {mapping?.label || tool.replace(/_/g, " ")}
                    </Badge>
                  </TooltipTrigger>
                  {mapping && (
                    <TooltipContent side="bottom" className="max-w-[220px]">
                      <p className="font-medium text-xs">{mapping.label}</p>
                      <p className="text-xs text-muted-foreground">{mapping.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Actions: {mapping.exampleActions.join(", ")}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Can Mutate Data</Label>
          <p className="text-xs text-muted-foreground">Agent can make write operations via tools.</p>
        </div>
        <Switch checked={canMutate} onCheckedChange={onCanMutateChange} />
      </div>

      <div className="space-y-2">
        <Label>Risk Tier</Label>
        <Select value={riskTier} onValueChange={(v) => onRiskTierChange(v as any)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sandbox">Sandbox — Read-only, limited scope</SelectItem>
            <SelectItem value="verified">Verified — Can mutate with approval</SelectItem>
            <SelectItem value="privileged">Privileged — Auto-approved mutations</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
);
