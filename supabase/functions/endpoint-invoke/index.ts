import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function hmacSign(secret: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function generateSessionToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "");
  const body = btoa(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 900 })).replace(/=/g, "");
  const data = `${header}.${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  return `${data}.${sigB64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const startTime = Date.now();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { agentId, installationId, message, userId, workspaceId, threadId } = await req.json();

    // Load agent submission
    const { data: agent, error: agentErr } = await supabase
      .from("agent_submissions")
      .select("*")
      .eq("id", agentId)
      .single();
    if (agentErr || !agent) throw new Error("Agent not found");
    if (agent.execution_mode !== "endpoint" || !agent.endpoint_base_url) {
      throw new Error("Agent is not an endpoint agent");
    }

    // Load installation if provided
    let installation: any = null;
    if (installationId) {
      const { data } = await supabase
        .from("agent_installations")
        .select("*")
        .eq("id", installationId)
        .single();
      installation = data;
    }

    // Load user memories
    let memory: Record<string, unknown> = {};
    if (userId) {
      const { data: memories } = await supabase
        .from("user_memories")
        .select("memory_key, memory_value, category")
        .eq("user_id", userId)
        .limit(50);
      if (memories) {
        for (const m of memories) {
          if (!memory[m.category || "general"]) memory[m.category || "general"] = {};
          (memory[m.category || "general"] as any)[m.memory_key] = m.memory_value;
        }
      }
    }

    // Build request payload
    const requestId = crypto.randomUUID();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const signingSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const sessionToken = await generateSessionToken({
      installationId: installationId || null,
      agentId,
      userId: userId || null,
      permissions: installation?.permissions || {},
    }, signingSecret);

    const payload = {
      requestId,
      workspaceId: workspaceId || null,
      userId: userId || null,
      agentId,
      installationId: installationId || null,
      threadId: threadId || null,
      message,
      memory,
      settings: {
        requiresApproval: installation?.requires_approval ?? true,
        permissions: installation?.permissions || {},
      },
      toolGateway: {
        baseUrl: `${supabaseUrl}/functions/v1/tool-gateway`,
        sessionToken,
      },
    };

    // Build outbound request
    const invokeUrl = `${agent.endpoint_base_url.replace(/\/$/, "")}${agent.endpoint_invoke_path || "/invoke"}`;
    const rawBody = JSON.stringify(payload);
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (agent.endpoint_auth_type === "api_key" && agent.endpoint_secret) {
      headers["Authorization"] = `Bearer ${agent.endpoint_secret}`;
    } else if (agent.endpoint_auth_type === "hmac" && agent.endpoint_secret) {
      const timestamp = new Date().toISOString();
      const signature = await hmacSign(agent.endpoint_secret, `${timestamp}.${rawBody}`);
      headers["X-Elixa-Request-Id"] = requestId;
      headers["X-Elixa-Timestamp"] = timestamp;
      headers["X-Elixa-Signature"] = signature;
    }

    // Call endpoint
    const endpointRes = await fetch(invokeUrl, { method: "POST", headers, body: rawBody });
    const endpointLatency = Date.now() - startTime;

    if (!endpointRes.ok) {
      const errText = await endpointRes.text();
      throw new Error(`Endpoint returned ${endpointRes.status}: ${errText}`);
    }

    const responseData = await endpointRes.json();

    // Validate response shape
    if (!responseData.assistantMessage || typeof responseData.assistantMessage !== "string") {
      throw new Error("Endpoint response missing required 'assistantMessage' string field");
    }

    // Process proposals
    if (responseData.actions && Array.isArray(responseData.actions)) {
      for (const action of responseData.actions) {
        if (action.type === "proposal" && (installation?.requires_approval ?? true) && installationId) {
          await supabase.from("agent_proposals").insert({
            installation_id: installationId,
            request_id: requestId,
            user_id: userId,
            title: action.title || "Untitled proposal",
            data: action.data || {},
            status: "pending",
          });
        }
      }
    }

    // Log execution
    if (agent.developer_id) {
      await supabase.from("agent_execution_logs").insert({
        agent_id: agentId,
        developer_id: agent.developer_id,
        user_id: userId || null,
        input_message: message,
        output_response: responseData.assistantMessage,
        status: "success",
        execution_time_ms: endpointLatency,
      }).then(() => {}).catch(() => {});
    }

    return new Response(JSON.stringify({
      response: responseData.assistantMessage,
      actions: responseData.actions || [],
      receipts: responseData.receipts || [],
      requestId,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
