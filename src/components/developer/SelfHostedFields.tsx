import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
        <Label htmlFor="endpoint-url">Base URL *</Label>
        <Input
          id="endpoint-url"
          type="url"
          value={endpointUrl}
          onChange={(e) => onEndpointUrlChange(e.target.value)}
          placeholder="https://your-server.com"
        />
        <p className="text-xs text-muted-foreground">The root URL of your agent. Action paths will be appended to this.</p>
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
    </>
  );
};
