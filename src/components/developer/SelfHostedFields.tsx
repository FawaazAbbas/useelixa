import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Code } from "lucide-react";

interface SelfHostedFieldsProps {
  endpointUrl: string;
  onEndpointUrlChange: (val: string) => void;
  authHeader: string;
  onAuthHeaderChange: (val: string) => void;
  authToken: string;
  onAuthTokenChange: (val: string) => void;
  runtime: string;
  onRuntimeChange: (val: string) => void;
}

export const SelfHostedFields = ({
  endpointUrl, onEndpointUrlChange,
  authHeader, onAuthHeaderChange,
  authToken, onAuthTokenChange,
  runtime, onRuntimeChange,
}: SelfHostedFieldsProps) => {
  const [contractOpen, setContractOpen] = useState(false);

  return (
    <>
      <div className="space-y-2">
        <Label>Runtime</Label>
        <Select value={runtime} onValueChange={onRuntimeChange}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="endpoint-url">Endpoint URL *</Label>
        <Input
          id="endpoint-url"
          type="url"
          value={endpointUrl}
          onChange={(e) => onEndpointUrlChange(e.target.value)}
          placeholder="https://your-server.com/agent"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="auth-header">Auth Header Name (optional)</Label>
        <Input
          id="auth-header"
          value={authHeader}
          onChange={(e) => onAuthHeaderChange(e.target.value)}
          placeholder="X-API-Key"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="auth-token">Auth Token (optional)</Label>
        <Input
          id="auth-token"
          type="password"
          value={authToken}
          onChange={(e) => onAuthTokenChange(e.target.value)}
          placeholder="Your secret token"
        />
      </div>

      <Collapsible open={contractOpen} onOpenChange={setContractOpen}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Code className="h-4 w-4" />
          <span>View API Contract</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${contractOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-3 rounded-lg bg-muted p-4 font-mono text-xs space-y-3">
            <div>
              <p className="font-semibold text-foreground mb-1">Request (POST):</p>
              <pre className="text-muted-foreground">{`{
  "message": "user message",
  "user_id": "uuid",
  "context": {}
}`}</pre>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">Expected Response:</p>
              <pre className="text-muted-foreground">{`{
  "response": "agent reply",
  "tools_used": []
}`}</pre>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </>
  );
};
