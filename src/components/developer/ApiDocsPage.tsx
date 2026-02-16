import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Zap, Shield, Key, Terminal, Network } from "lucide-react";

const CodeBlock = ({ code, language = "json" }: { code: string; language?: string }) => (
  <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono whitespace-pre">{code}</pre>
);

export const ApiDocsPage = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Getting Started */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Getting Started</CardTitle>
          </div>
          <CardDescription>
            Elixa uses an <strong>Endpoint-First</strong> model. You host your agent logic on your own infrastructure, and Elixa calls your HTTP endpoint when users invoke your agent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>To register an agent, you need:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>An HTTP endpoint that accepts <Badge variant="secondary" className="text-xs">POST</Badge> requests at your invoke path</li>
            <li>An optional <Badge variant="secondary" className="text-xs">GET</Badge> health endpoint for monitoring</li>
            <li>Authentication configuration (None, API Key, or HMAC-SHA256)</li>
            <li>A capability manifest describing your agent's permissions</li>
          </ul>
        </CardContent>
      </Card>

      {/* Invoke Contract */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Invoke Contract</CardTitle>
          </div>
          <CardDescription>
            Elixa sends a POST request to <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{'{{base_url}}{{invoke_path}}'}</code> with the following JSON body.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">Request Body</h4>
            <CodeBlock code={`{
  "message": "User's message text",
  "user_id": "uuid-of-the-user",
  "context": {
    "workspace_id": "uuid",
    "installation_id": "uuid"
  },
  "toolGateway": {
    "sessionToken": "jwt-token-valid-15-min",
    "gatewayUrl": "https://...functions/v1/tool-gateway"
  }
}`} />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Expected Response <Badge variant="outline" className="text-xs">200 OK</Badge></h4>
            <CodeBlock code={`{
  "response": "Your agent's reply text",
  "tools_used": ["optional", "tool", "names"]
}`} />
          </div>
          <p className="text-sm text-muted-foreground">
            The response body must include at least a <code className="text-xs bg-muted px-1 rounded">response</code> field. 
            The system also accepts <code className="text-xs bg-muted px-1 rounded">assistantMessage</code>, <code className="text-xs bg-muted px-1 rounded">output</code>, <code className="text-xs bg-muted px-1 rounded">message</code>, or <code className="text-xs bg-muted px-1 rounded">text</code> as fallbacks.
            Plain-text responses are also accepted.
          </p>
        </CardContent>
      </Card>

      {/* Health Endpoint */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>Health Endpoint</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Elixa periodically calls <code className="text-xs bg-muted px-1.5 py-0.5 rounded">GET {'{{base_url}}{{health_path}}'}</code> to monitor your agent's availability.
          </p>
          <CodeBlock code={`// Expected Response (200 OK)
{
  "status": "ok"
}`} />
          <p className="text-sm text-muted-foreground">
            Any 2xx response is treated as healthy. Non-2xx or timeouts (&gt;5s) mark the agent as unhealthy.
          </p>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Authentication</CardTitle>
          </div>
          <CardDescription>
            Choose how Elixa authenticates requests to your endpoint.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">None</h4>
            <p className="text-sm text-muted-foreground">No authentication headers are sent. Suitable for development or endpoints behind a VPN.</p>
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2">API Key</h4>
            <p className="text-sm text-muted-foreground mb-2">Elixa sends your secret as a Bearer token:</p>
            <CodeBlock language="http" code={`Authorization: Bearer your-secret-token`} />
          </div>
          <Separator />
          <div>
            <h4 className="font-semibold text-sm mb-2">HMAC-SHA256</h4>
            <p className="text-sm text-muted-foreground mb-2">Elixa computes a signature and sends it in custom headers:</p>
            <CodeBlock language="http" code={`X-Elixa-Signature: hmac_sha256(secret, timestamp + "." + body)
X-Elixa-Timestamp: 1700000000
X-Elixa-Request-Id: uuid`} />
            <p className="text-sm text-muted-foreground mt-2">
              Your endpoint should verify the signature within a <strong>5-minute window</strong> to prevent replay attacks.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tool Gateway */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Tool Gateway</CardTitle>
          </div>
          <CardDescription>
            Access Elixa's managed OAuth integrations (Google Ads, Gmail, etc.) without handling refresh tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Each invoke request includes a <code className="text-xs bg-muted px-1 rounded">toolGateway</code> object with a short-lived JWT session token (15 minutes). 
            Use it to call the gateway:
          </p>

          {/* Available Integrations */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Available Integrations</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: "gmail", label: "Gmail", actions: "list_messages, send_email" },
                { key: "google_ads", label: "Google Ads", actions: "get_campaigns, get_reports" },
                { key: "google_analytics", label: "Analytics", actions: "run_report, get_realtime" },
                { key: "google_sheets", label: "Sheets", actions: "read_range, write_range" },
                { key: "shopify", label: "Shopify", actions: "list_products, get_orders" },
                { key: "stripe", label: "Stripe", actions: "list_charges, get_subscription" },
                { key: "notion", label: "Notion", actions: "search, query_database" },
              ].map((i) => (
                <div key={i.key} className="rounded-lg border p-2">
                  <p className="text-sm font-medium">{i.label}</p>
                  <p className="text-xs text-muted-foreground">{i.actions}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Python Example */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Python <Badge variant="secondary" className="text-xs ml-1">requests</Badge></h4>
            <CodeBlock language="python" code={`import requests

def call_tool_gateway(gateway_url, session_token, integration, action, params=None):
    """Call Elixa Tool Gateway from your /invoke handler."""
    response = requests.post(
        gateway_url,
        headers={
            "Authorization": f"Bearer {session_token}",
            "Content-Type": "application/json",
        },
        json={
            "integration": integration,  # e.g. "gmail", "shopify"
            "action": action,            # e.g. "list_messages", "list_products"
            "params": params or {},
        },
    )
    response.raise_for_status()
    return response.json()

# Usage in your /invoke handler:
def handle_invoke(request_body):
    gateway = request_body["toolGateway"]
    emails = call_tool_gateway(
        gateway["gatewayUrl"],
        gateway["sessionToken"],
        "gmail",
        "list_messages",
        {"maxResults": 10},
    )
    return {"response": f"Found {len(emails.get('messages', []))} emails"}`} />
          </div>

          {/* Node.js Example */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Node.js <Badge variant="secondary" className="text-xs ml-1">fetch</Badge></h4>
            <CodeBlock language="javascript" code={`async function callToolGateway(gatewayUrl, sessionToken, integration, action, params = {}) {
  const res = await fetch(gatewayUrl, {
    method: "POST",
    headers: {
      "Authorization": \`Bearer \${sessionToken}\`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ integration, action, params }),
  });
  if (!res.ok) throw new Error(\`Gateway error: \${res.status}\`);
  return res.json();
}

// In your /invoke handler:
export async function handleInvoke(body) {
  const { toolGateway } = body;
  const data = await callToolGateway(
    toolGateway.gatewayUrl,
    toolGateway.sessionToken,
    "shopify",
    "list_products",
    { limit: 5 }
  );
  return { response: \`Found \${data.products?.length || 0} products\` };
}`} />
          </div>

          {/* cURL Example */}
          <div>
            <h4 className="font-semibold text-sm mb-2">cURL</h4>
            <CodeBlock language="bash" code={`curl -X POST "{{gatewayUrl}}" \\
  -H "Authorization: Bearer {{sessionToken}}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "integration": "gmail",
    "action": "list_messages",
    "params": { "maxResults": 10 }
  }'`} />
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10 p-3">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              <strong>HITL Gating:</strong> Mutating actions (write/delete) are automatically held for user approval. Your agent receives a <code className="text-xs bg-muted px-1 rounded">pending_approval</code> status and a <code className="text-xs bg-muted px-1 rounded">proposalId</code>. The action executes only after the user confirms.
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-900/10 p-3">
            <p className="text-sm text-blue-800 dark:text-blue-400">
              <strong>Missing Connections:</strong> If the user hasn't connected the required OAuth service, the gateway returns a <code className="text-xs bg-muted px-1 rounded">403</code> with <code className="text-xs bg-muted px-1 rounded">{`{"error": "missing_connection"}`}</code>. Handle this gracefully in your agent's response.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Capability Manifest */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Capability Manifest</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            When registering your agent, provide a capability manifest to declare its permissions:
          </p>
          <CodeBlock code={`{
  "toolsRequired": ["google_ads", "gmail"],
  "canMutate": true,
  "riskTier": "standard"   // "sandbox" | "standard" | "elevated"
}`} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border p-3">
              <h5 className="font-medium text-sm mb-1">Sandbox</h5>
              <p className="text-xs text-muted-foreground">Read-only access. No approval needed.</p>
            </div>
            <div className="rounded-lg border p-3">
              <h5 className="font-medium text-sm mb-1">Standard</h5>
              <p className="text-xs text-muted-foreground">Read/write with HITL approval for mutations.</p>
            </div>
            <div className="rounded-lg border p-3">
              <h5 className="font-medium text-sm mb-1">Elevated</h5>
              <p className="text-xs text-muted-foreground">Full access. Requires verified developer status.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Terminal className="h-5 w-5 text-primary" />
            <CardTitle>Testing Your Agent</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Test your endpoint locally before registering:</p>
          <div>
            <h4 className="font-semibold text-sm mb-2">Test Invoke</h4>
            <CodeBlock language="bash" code={`curl -X POST http://localhost:8080/invoke \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "Hello!",
    "user_id": "test-user",
    "context": {}
  }'`} />
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-2">Test Health</h4>
            <CodeBlock language="bash" code={`curl http://localhost:8080/health
# Expected: {"status": "ok"}`} />
          </div>
          <p className="text-sm text-muted-foreground">
            You can also use the built-in <strong>Test Console</strong> in the agent detail view to send test messages directly through Elixa's orchestration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
