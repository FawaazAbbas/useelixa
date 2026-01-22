import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash function for token verification
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Tool definitions by integration slug
const TOOL_DEFINITIONS: Record<string, { domain: string; actions: { name: string; description: string; parameters: Record<string, unknown> }[] }> = {
  slack: {
    domain: "messaging",
    actions: [
      { name: "send_message", description: "Send a message to a Slack channel", parameters: { type: "object", properties: { channel: { type: "string" }, text: { type: "string" } }, required: ["channel", "text"] } },
      { name: "list_channels", description: "List available Slack channels", parameters: { type: "object", properties: {} } },
    ],
  },
  google_calendar: {
    domain: "events",
    actions: [
      { name: "list", description: "List calendar events", parameters: { type: "object", properties: { calendar_id: { type: "string" }, max_results: { type: "number" } } } },
      { name: "create", description: "Create a calendar event", parameters: { type: "object", properties: { summary: { type: "string" }, start: { type: "string" }, end: { type: "string" } }, required: ["summary", "start", "end"] } },
    ],
  },
  gmail: {
    domain: "email",
    actions: [
      { name: "list", description: "List emails", parameters: { type: "object", properties: { max_results: { type: "number" }, query: { type: "string" } } } },
      { name: "get", description: "Get a specific email", parameters: { type: "object", properties: { message_id: { type: "string" } }, required: ["message_id"] } },
      { name: "send", description: "Send an email", parameters: { type: "object", properties: { to: { type: "string" }, subject: { type: "string" }, body: { type: "string" } }, required: ["to", "subject", "body"] } },
    ],
  },
  github: {
    domain: "repos",
    actions: [
      { name: "list", description: "List repositories", parameters: { type: "object", properties: {} } },
      { name: "create_issue", description: "Create an issue", parameters: { type: "object", properties: { repo: { type: "string" }, title: { type: "string" }, body: { type: "string" } }, required: ["repo", "title"] } },
    ],
  },
  shopify: {
    domain: "orders",
    actions: [
      { name: "list", description: "List recent orders", parameters: { type: "object", properties: { limit: { type: "number" }, status: { type: "string" } } } },
      { name: "list_products", description: "List products", parameters: { type: "object", properties: { limit: { type: "number" } } } },
    ],
  },
  notion: {
    domain: "pages",
    actions: [
      { name: "search", description: "Search Notion pages", parameters: { type: "object", properties: { query: { type: "string" } } } },
      { name: "create", description: "Create a Notion page", parameters: { type: "object", properties: { parent_id: { type: "string" }, title: { type: "string" } }, required: ["parent_id", "title"] } },
    ],
  },
  linear: {
    domain: "issues",
    actions: [
      { name: "list", description: "List Linear issues", parameters: { type: "object", properties: {} } },
      { name: "create", description: "Create a Linear issue", parameters: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title"] } },
    ],
  },
  hubspot: {
    domain: "crm",
    actions: [
      { name: "list_contacts", description: "List HubSpot contacts", parameters: { type: "object", properties: { limit: { type: "number" } } } },
      { name: "create_contact", description: "Create a HubSpot contact", parameters: { type: "object", properties: { email: { type: "string" }, firstname: { type: "string" }, lastname: { type: "string" } }, required: ["email"] } },
    ],
  },
  stripe: {
    domain: "payments",
    actions: [
      { name: "list_charges", description: "List Stripe charges", parameters: { type: "object", properties: { limit: { type: "number" } } } },
      { name: "create_invoice", description: "Create a Stripe invoice", parameters: { type: "object", properties: { customer: { type: "string" } }, required: ["customer"] } },
    ],
  },
};

// Map integration slugs to their edge function and action mappings
const INTEGRATION_FUNCTION_MAP: Record<string, { functionName: string; actionMap: Record<string, string> }> = {
  gmail: {
    functionName: "gmail-integration",
    actionMap: {
      list: "list",
      get: "get",
      send: "send",
    },
  },
  google_calendar: {
    functionName: "calendar-integration",
    actionMap: {
      list: "list",
      create: "create",
    },
  },
  shopify: {
    functionName: "shopify-integration",
    actionMap: {
      list: "list_orders",
      list_products: "list_products",
    },
  },
  stripe: {
    functionName: "stripe-integration",
    actionMap: {
      list_charges: "list_charges",
      create_invoice: "create_invoice",
    },
  },
};

// Execute real integration call
async function executeIntegrationCall(
  integrationSlug: string,
  action: string,
  input: Record<string, unknown>,
  userId: string,
  authHeader: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const mapping = INTEGRATION_FUNCTION_MAP[integrationSlug];
  
  if (!mapping) {
    console.log(`[MCP] No real integration mapping for ${integrationSlug}, returning mock data`);
    return { success: true, data: getMockResponse(action, input) };
  }

  const mappedAction = mapping.actionMap[action];
  if (!mappedAction) {
    console.log(`[MCP] No action mapping for ${integrationSlug}.${action}, returning mock data`);
    return { success: true, data: getMockResponse(action, input) };
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const functionUrl = `${supabaseUrl}/functions/v1/${mapping.functionName}`;

    console.log(`[MCP] Calling ${functionUrl} with action: ${mappedAction}`);

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        action: mappedAction,
        params: input,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[MCP] Integration call failed: ${response.status} - ${errorText}`);
      return { success: false, error: `Integration error: ${response.status}` };
    }

    const result = await response.json();
    console.log(`[MCP] Integration call succeeded for ${integrationSlug}.${action}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`[MCP] Error calling integration ${integrationSlug}:`, error);
    return { success: false, error: String(error) };
  }
}

// Get mock response for integrations without real implementation
function getMockResponse(action: string, input: Record<string, unknown>): Record<string, unknown> {
  if (action.includes("list") || action === "search") {
    return {
      items: [
        { id: crypto.randomUUID(), name: "Sample Item 1", created_at: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Sample Item 2", created_at: new Date().toISOString() },
      ],
      total: 2,
      has_more: false,
    };
  } else if (action.includes("create") || action === "send_message" || action === "send") {
    return {
      id: crypto.randomUUID(),
      created: true,
      created_at: new Date().toISOString(),
      ...input,
    };
  }
  return {
    success: true,
    executed_at: new Date().toISOString(),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/mcp", "");

  try {
    // Extract and validate token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.substring(7);
    
    // Validate token format
    if (!token.startsWith("elixa_")) {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenHash = await hashToken(token);

    // Create Supabase client with service role for auth bypass
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate token and get org context
    const { data: tokenData, error: tokenError } = await supabase
      .from("mcp_tokens")
      .select("id, org_id, scopes, created_by, revoked_at")
      .eq("token_hash", tokenHash)
      .single();

    if (tokenError || !tokenData) {
      console.error("Token lookup failed:", tokenError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (tokenData.revoked_at) {
      return new Response(
        JSON.stringify({ error: "Token has been revoked" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orgId = tokenData.org_id;
    const tokenId = tokenData.id;
    const tokenScopes = tokenData.scopes || [];
    const userId = tokenData.created_by;

    // Update last_used_at
    await supabase
      .from("mcp_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", tokenId);

    // Route handling
    if (path === "/tools" || path === "") {
      // GET /tools - List available tools based on connected org integrations
      const { data: orgIntegrations, error: intError } = await supabase
        .from("org_integrations")
        .select(`
          id,
          status,
          scopes,
          integration:integrations(id, slug, name, category)
        `)
        .eq("org_id", orgId)
        .eq("status", "connected");

      if (intError) {
        console.error("Failed to fetch org integrations:", intError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch integrations" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build tool list from connected integrations
      const tools: unknown[] = [];
      for (const orgInt of orgIntegrations || []) {
        // Handle both single object and array from join
        const integrationData = orgInt.integration;
        const integration = Array.isArray(integrationData) ? integrationData[0] : integrationData;
        if (!integration || !integration.slug) continue;

        const slug = integration.slug as string;
        const toolDef = TOOL_DEFINITIONS[slug];
        if (!toolDef) continue;

        // Filter by token scopes if specified
        for (const action of toolDef.actions) {
          const toolName = `${slug}.${toolDef.domain}.${action.name}`;
          if (tokenScopes.length === 0 || tokenScopes.includes("*") || tokenScopes.includes(slug)) {
            tools.push({
              name: toolName,
              description: action.description,
              parameters: action.parameters,
              integration: {
                slug,
                name: integration.name,
                category: integration.category,
              },
              realIntegration: !!INTEGRATION_FUNCTION_MAP[slug],
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          tools,
          org_id: orgId,
          token_scopes: tokenScopes,
          server: "elixa-mcp",
          version: "2.1.0",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path === "/call" && req.method === "POST") {
      // POST /call - Execute a tool
      const startTime = Date.now();
      const body = await req.json();
      const { tool_name, tool, input } = body;
      const targetTool = tool_name || tool;

      if (!targetTool) {
        return new Response(
          JSON.stringify({ error: "tool_name is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Parse tool name: integration_slug.domain.action
      const [integrationSlug, domain, action] = targetTool.split(".");

      if (!integrationSlug || !action) {
        return new Response(
          JSON.stringify({ error: "Invalid tool name format. Expected: integration.domain.action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check token scopes
      if (tokenScopes.length > 0 && !tokenScopes.includes("*") && !tokenScopes.includes(integrationSlug)) {
        return new Response(
          JSON.stringify({ error: `Token does not have access to ${integrationSlug}` }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Execute the integration call (real or mock)
      const result = await executeIntegrationCall(
        integrationSlug,
        action,
        input || {},
        userId,
        authHeader
      );

      const latencyMs = Date.now() - startTime;
      const status = result.success ? "success" : "error";

      // Log tool call using service role
      const { error: logError } = await supabase.from("tool_calls").insert({
        org_id: orgId,
        actor_token_id: tokenId,
        actor_user_id: userId,
        integration_slug: integrationSlug,
        tool_name: targetTool,
        input: input || {},
        output: result.data || { error: result.error },
        status,
        latency_ms: latencyMs,
      });

      if (logError) {
        console.error("Failed to log tool call:", logError);
      }

      if (!result.success) {
        return new Response(
          JSON.stringify({
            tool_name: targetTool,
            status: "error",
            error: result.error,
            latency_ms: latencyMs,
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          tool_name: targetTool,
          status: "success",
          result: result.data,
          latency_ms: latencyMs,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unknown endpoint
    return new Response(
      JSON.stringify({
        error: "Not found",
        available_endpoints: [
          "GET /tools - List available tools",
          "POST /call - Execute a tool",
        ],
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("MCP Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
