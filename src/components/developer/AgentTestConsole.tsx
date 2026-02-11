import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AgentSubmission, AgentAction } from "@/hooks/useDeveloperPortal";

interface AgentTestConsoleProps {
  agent: AgentSubmission;
}

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  POST: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  PUT: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  PATCH: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

const SAMPLE_ENDPOINT_BODY = `{
  "message": "Hello, what can you help me with?"
}`;

export const AgentTestConsole = ({ agent }: AgentTestConsoleProps) => {
  const actions = agent.actions || [];
  const isSelfHosted = agent.hosting_type === "self_hosted" && (agent.execution_mode || agent.hosting_type) !== "endpoint";
  const isPlatform = agent.hosting_type === "platform" && (agent.execution_mode || agent.hosting_type) !== "endpoint";
  const isEndpoint = (agent.execution_mode || agent.hosting_type) === "endpoint";

  const [selectedActionId, setSelectedActionId] = useState<string>(
    actions.length > 0 ? actions[0].id : "__default__"
  );
  const [requestBody, setRequestBody] = useState(
    isEndpoint ? SAMPLE_ENDPOINT_BODY : '{\n  "message": "Hello"\n}'
  );
  const [response, setResponse] = useState<string | null>(null);
  const [parsedResponse, setParsedResponse] = useState<{ assistantMessage?: string; actions?: any[]; receipts?: any[] } | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);

  const selectedAction = actions.find((a) => a.id === selectedActionId);
  const baseUrl = agent.external_endpoint_url?.replace(/\/$/, "") || "";

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setParsedResponse(null);
    setStatusCode(null);
    setElapsed(null);

    const start = performance.now();

    try {
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(requestBody);
      } catch {
        setResponse("Invalid JSON in request body");
        setStatusCode(0);
        setElapsed(performance.now() - start);
        setLoading(false);
        return;
      }

      if (isEndpoint) {
        // Endpoint agent: call through endpoint-invoke edge function
        const { data, error } = await supabase.functions.invoke("endpoint-invoke", {
          body: {
            agentId: agent.id,
            message: parsedBody.message || JSON.stringify(parsedBody),
            userId: null,
            workspaceId: null,
            threadId: null,
            installationId: null,
          },
        });

        const elapsedMs = performance.now() - start;
        setElapsed(elapsedMs);

        if (error) {
          setStatusCode(500);
          setResponse(`Error: ${error.message}`);
        } else {
          setStatusCode(200);
          setResponse(JSON.stringify(data, null, 2));
          if (data?.response || data?.actions || data?.receipts) {
            setParsedResponse({
              assistantMessage: data.response,
              actions: data.actions,
              receipts: data.receipts,
            });
          }
        }
      } else if (isPlatform) {
        const { data, error } = await supabase.functions.invoke("test-agent", {
          body: { agent_id: agent.id, message: parsedBody.message || JSON.stringify(parsedBody) },
        });

        const elapsedMs = performance.now() - start;
        setElapsed(elapsedMs);

        if (error) {
          setStatusCode(500);
          setResponse(`Error: ${error.message}`);
        } else {
          setStatusCode(200);
          setResponse(JSON.stringify(data, null, 2));
        }
      } else {
        // Self-hosted: direct fetch
        let url: string;
        let method: string;
        let headers: Record<string, string> = { "Content-Type": "application/json" };

        if (selectedAction) {
          url = `${baseUrl}${selectedAction.path}`;
          method = selectedAction.method;
        } else {
          url = baseUrl;
          method = "POST";
        }

        if (agent.external_auth_header && agent.external_auth_token) {
          headers[agent.external_auth_header] = agent.external_auth_token;
        }

        const fetchOptions: RequestInit = { method, headers };
        if (method !== "GET" && method !== "HEAD") fetchOptions.body = requestBody;

        const res = await fetch(url, fetchOptions);
        const elapsedMs = performance.now() - start;
        setElapsed(elapsedMs);
        setStatusCode(res.status);

        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const json = await res.json();
          setResponse(JSON.stringify(json, null, 2));
        } else {
          setResponse(await res.text());
        }
      }
    } catch (err: any) {
      setElapsed(performance.now() - start);
      setStatusCode(0);
      setResponse(`Network error: ${err.message}\n\nMake sure your agent is running and CORS is enabled.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold flex items-center gap-2">
        <Play className="h-4 w-4 text-primary" />
        Test Console
      </h4>

      {/* Action selector for self-hosted with actions */}
      {isSelfHosted && actions.length > 0 && (
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Action</label>
          <Select value={selectedActionId} onValueChange={setSelectedActionId}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {actions.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  <span className="flex items-center gap-2">
                    <Badge className={`${METHOD_COLORS[a.method] || ""} text-[10px] px-1 py-0`}>{a.method}</Badge>
                    {a.action_name}
                    <span className="text-muted-foreground font-mono">{a.path}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Target preview */}
      <div className="text-xs font-mono bg-muted rounded px-2 py-1.5 break-all text-muted-foreground">
        {isEndpoint
          ? `POST → ${agent.endpoint_base_url || agent.name}${agent.endpoint_invoke_path || "/invoke"}`
          : isPlatform
            ? `POST → ${agent.name} (platform-hosted)`
            : selectedAction
              ? `${selectedAction.method} ${baseUrl}${selectedAction.path}`
              : `POST ${baseUrl}`}
      </div>

      {/* Request body */}
      {(!selectedAction || selectedAction.method !== "GET") && (
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            {isEndpoint ? "Message (JSON)" : isPlatform ? "Test Message (JSON)" : "Request Body (JSON)"}
          </label>
          <Textarea
            value={requestBody}
            onChange={(e) => setRequestBody(e.target.value)}
            className="font-mono text-xs min-h-[80px] resize-y"
            placeholder='{"message": "Hello"}'
          />
        </div>
      )}

      <Button size="sm" onClick={handleSendRequest} disabled={loading} className="w-full">
        {loading ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Sending...</> : <><Play className="h-3 w-3 mr-1" /> Send Request</>}
      </Button>

      {/* Parsed endpoint response */}
      {isEndpoint && parsedResponse && (
        <div className="space-y-2">
          {parsedResponse.assistantMessage && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Assistant Message</label>
              <div className="text-sm bg-muted rounded-md p-2.5">{parsedResponse.assistantMessage}</div>
            </div>
          )}
          {parsedResponse.actions && parsedResponse.actions.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Actions ({parsedResponse.actions.length})</label>
              <pre className="text-xs bg-muted rounded-md p-2.5 overflow-auto max-h-32 font-mono">
                {JSON.stringify(parsedResponse.actions, null, 2)}
              </pre>
            </div>
          )}
          {parsedResponse.receipts && parsedResponse.receipts.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Receipts ({parsedResponse.receipts.length})</label>
              <pre className="text-xs bg-muted rounded-md p-2.5 overflow-auto max-h-32 font-mono">
                {JSON.stringify(parsedResponse.receipts, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Raw response */}
      {response !== null && !parsedResponse && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs">
            {statusCode !== null && statusCode >= 200 && statusCode < 300 ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <XCircle className="h-3.5 w-3.5 text-destructive" />
            )}
            <Badge variant={statusCode && statusCode >= 200 && statusCode < 300 ? "default" : "destructive"} className="text-[10px]">
              {statusCode === 0 ? "ERR" : statusCode}
            </Badge>
            {elapsed !== null && (
              <span className="text-muted-foreground flex items-center gap-0.5">
                <Clock className="h-3 w-3" />
                {elapsed < 1000 ? `${Math.round(elapsed)}ms` : `${(elapsed / 1000).toFixed(2)}s`}
              </span>
            )}
          </div>
          <pre className="text-xs bg-muted rounded-md p-2.5 overflow-auto max-h-48 whitespace-pre-wrap font-mono">{response}</pre>
        </div>
      )}

      {/* Status bar for parsed responses */}
      {response !== null && parsedResponse && (
        <div className="flex items-center gap-2 text-xs">
          {statusCode !== null && statusCode >= 200 && statusCode < 300 ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-destructive" />
          )}
          <Badge variant={statusCode && statusCode >= 200 && statusCode < 300 ? "default" : "destructive"} className="text-[10px]">
            {statusCode === 0 ? "ERR" : statusCode}
          </Badge>
          {elapsed !== null && (
            <span className="text-muted-foreground flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {elapsed < 1000 ? `${Math.round(elapsed)}ms` : `${(elapsed / 1000).toFixed(2)}s`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
