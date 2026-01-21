import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_MESSAGES_PER_MINUTE = 20;
const MONTHLY_AI_CALL_LIMIT = 1000; // Default limit per org

// Tool definitions for the AI
const TOOL_DEFINITIONS = [
  { type: "function", function: { name: "gmail_list_emails", description: "List recent emails from Gmail inbox", parameters: { type: "object", properties: { maxResults: { type: "number" }, query: { type: "string" } } } } },
  { type: "function", function: { name: "gmail_send_email", description: "Send an email. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { to: { type: "string" }, subject: { type: "string" }, body: { type: "string" } }, required: ["to", "subject", "body"] } } },
  { type: "function", function: { name: "calendar_list_events", description: "List upcoming calendar events", parameters: { type: "object", properties: { timeMin: { type: "string" }, timeMax: { type: "string" }, maxResults: { type: "number" } } } } },
  { type: "function", function: { name: "calendar_create_event", description: "Create a calendar event. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { title: { type: "string" }, startTime: { type: "string" }, endTime: { type: "string" }, description: { type: "string" } }, required: ["title", "startTime", "endTime"] } } },
  { type: "function", function: { name: "create_task", description: "Create a new task", parameters: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] }, dueDate: { type: "string" } }, required: ["title"] } } },
  { type: "function", function: { name: "list_tasks", description: "List user's tasks", parameters: { type: "object", properties: { status: { type: "string", enum: ["todo", "in_progress", "done"] } } } } },
  { type: "function", function: { name: "stripe_get_balance", description: "Get Stripe account balance", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "stripe_list_payments", description: "List recent Stripe payments", parameters: { type: "object", properties: { limit: { type: "number" } } } } },
  { type: "function", function: { name: "stripe_list_customers", description: "List Stripe customers", parameters: { type: "object", properties: { limit: { type: "number" }, email: { type: "string" } } } } },
  { type: "function", function: { name: "stripe_create_customer", description: "Create a new Stripe customer. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { email: { type: "string" }, name: { type: "string" }, description: { type: "string" } }, required: ["email"] } } },
  { type: "function", function: { name: "shopify_list_orders", description: "List Shopify orders", parameters: { type: "object", properties: { limit: { type: "number" }, status: { type: "string" } } } } },
  { type: "function", function: { name: "shopify_list_products", description: "List Shopify products", parameters: { type: "object", properties: { limit: { type: "number" } } } } },
  { type: "function", function: { name: "shopify_get_analytics", description: "Get Shopify analytics summary", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "shopify_create_product", description: "Create a new Shopify product. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, price: { type: "number" }, vendor: { type: "string" } }, required: ["title", "price"] } } },
  { type: "function", function: { name: "notes_list", description: "List user's notes", parameters: { type: "object", properties: { limit: { type: "number" } } } } },
  { type: "function", function: { name: "notes_search", description: "Search notes by query", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
  { type: "function", function: { name: "notes_create", description: "Create a new note. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } }, required: ["title"] } } },
  { type: "function", function: { name: "search_knowledge_base", description: "Search the organization's knowledge base documents for relevant information using semantic search", parameters: { type: "object", properties: { query: { type: "string", description: "The search query" } }, required: ["query"] } } },
];

// Tools that require user confirmation before execution
const WRITE_TOOLS = [
  "gmail_send_email", 
  "calendar_create_event", 
  "notes_create",
  "stripe_create_customer",
  "shopify_create_product",
];

const SYSTEM_PROMPT = `You are Elixa, an intelligent AI assistant for the Elixa workspace platform. You help users manage their work, communications, and schedule.

You have access to the following capabilities:
- Read and send emails via Gmail (use gmail_list_emails, gmail_send_email)
- View and create calendar events (use calendar_list_events, calendar_create_event)
- Manage tasks (use create_task, list_tasks)
- Access Stripe data (use stripe_get_balance, stripe_list_payments, stripe_list_customers, stripe_create_customer)
- Access Shopify data (use shopify_list_orders, shopify_list_products, shopify_get_analytics, shopify_create_product)
- Manage notes (use notes_list, notes_search, notes_create)
- Search knowledge base documents (use search_knowledge_base)

When using tools that modify data (sending emails, creating events, creating notes, creating customers, creating products), always clearly explain what you're about to do and ask for confirmation.

Be helpful, concise, and proactive. If you notice opportunities to help the user be more productive, suggest them.

Current date/time: ${new Date().toISOString()}`;

/**
 * Retrieve relevant conversation memories for context
 */
async function getConversationMemories(
  serviceSupabase: any,
  userId: string,
  currentMessage: string
): Promise<string> {
  try {
    // Get embedding for current message to find relevant memories
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: currentMessage,
      }),
    });

    if (!embeddingResponse.ok) {
      console.log("[Memory] Could not generate embedding for memory recall");
      return "";
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data?.[0]?.embedding;

    if (!queryEmbedding) {
      return "";
    }

    // Search for relevant past conversations
    const { data: memories, error } = await serviceSupabase.rpc(
      "match_conversation_memories",
      {
        query_embedding: queryEmbedding,
        match_user_id: userId,
        match_threshold: 0.6,
        match_count: 3,
      }
    );

    if (error || !memories || memories.length === 0) {
      return "";
    }

    // Format memories as context
    const memoryContext = memories
      .map((m: any) => `[Previous conversation about ${m.key_topics?.join(", ") || "various topics"}]: ${m.summary}`)
      .join("\n");

    console.log(`[Memory] Retrieved ${memories.length} relevant memories`);
    return `\n\nRelevant context from past conversations:\n${memoryContext}`;
  } catch (error) {
    console.error("[Memory] Error retrieving memories:", error);
    return "";
  }
}

// Helper to check rate limits
async function checkRateLimits(
  serviceSupabase: any, 
  userId: string, 
  orgId: string | null
): Promise<{ allowed: boolean; reason?: string }> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS).toISOString();
  
  // Check per-minute rate limit
  const { count: recentMessageCount } = await serviceSupabase
    .from("chat_messages_v2")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", oneMinuteAgo);

  if (recentMessageCount && recentMessageCount > MAX_MESSAGES_PER_MINUTE) {
    return { 
      allowed: false, 
      reason: "Rate limit exceeded. Please wait a moment before sending more messages." 
    };
  }

  // Check monthly usage limit
  if (orgId) {
    const currentMonth = now.toISOString().slice(0, 7) + "-01";
    
    const { data: usageData } = await serviceSupabase
      .from("usage_stats")
      .select("ai_calls")
      .eq("org_id", orgId)
      .eq("month", currentMonth)
      .single();

    if (usageData?.ai_calls && usageData.ai_calls >= MONTHLY_AI_CALL_LIMIT) {
      return { 
        allowed: false, 
        reason: "Monthly AI credit limit reached. Please upgrade your plan or wait until next month." 
      };
    }
  }

  return { allowed: true };
}

// Tool to credential type mapping
const TOOL_CREDENTIAL_MAP: Record<string, string> = {
  gmail_list_emails: "googleOAuth2Api",
  gmail_send_email: "googleOAuth2Api",
  calendar_list_events: "googleOAuth2Api",
  calendar_create_event: "googleOAuth2Api",
  stripe_get_balance: "stripe",
  stripe_list_payments: "stripe",
  stripe_list_customers: "stripe",
  stripe_create_customer: "stripe",
  shopify_list_orders: "shopify",
  shopify_list_products: "shopify",
  shopify_get_analytics: "shopify",
  shopify_create_product: "shopify",
  // Internal tools don't need credentials
  notes_list: "internal",
  notes_search: "internal",
  notes_create: "internal",
  create_task: "internal",
  list_tasks: "internal",
  search_knowledge_base: "internal",
  search_knowledge: "internal",
};

// Helper to verify user has required scopes for a tool
async function verifyToolScope(
  serviceSupabase: any,
  userId: string,
  toolName: string
): Promise<{ allowed: boolean; error?: string }> {
  const credentialType = TOOL_CREDENTIAL_MAP[toolName];
  
  // Internal tools don't need external credentials
  if (!credentialType || credentialType === "internal") {
    return { allowed: true };
  }

  // Get scope requirements for this tool
  const { data: scopeReq } = await serviceSupabase
    .from("tool_scope_requirements")
    .select("required_scopes")
    .eq("tool_name", toolName)
    .single();

  // If no scope requirements defined, allow (backward compatibility)
  if (!scopeReq || !scopeReq.required_scopes || scopeReq.required_scopes.length === 0) {
    // Still check if credential exists
    const { data: credential } = await serviceSupabase
      .from("user_credentials")
      .select("id")
      .eq("user_id", userId)
      .eq("credential_type", credentialType)
      .limit(1)
      .maybeSingle();

    if (!credential) {
      return { 
        allowed: false, 
        error: `${toolName.replace(/_/g, " ")} requires connecting your ${credentialType.replace(/Api$/, "").replace(/OAuth2/, "")} account first. Go to Connections to set this up.` 
      };
    }
    return { allowed: true };
  }

  // Check if user has the credential with required scopes
  const { data: credentials } = await serviceSupabase
    .from("user_credentials")
    .select("scopes")
    .eq("user_id", userId)
    .eq("credential_type", credentialType);

  if (!credentials || credentials.length === 0) {
    return { 
      allowed: false, 
      error: `${toolName.replace(/_/g, " ")} requires connecting your account first. Go to Connections to set this up.` 
    };
  }

  // Check if any credential has at least one of the required scopes
  const requiredScopes: string[] = scopeReq.required_scopes;
  const hasRequiredScope = credentials.some((cred: any) => {
    if (!cred.scopes) return false;
    return requiredScopes.some((required: string) => 
      cred.scopes.includes(required)
    );
  });

  if (!hasRequiredScope) {
    return { 
      allowed: false, 
      error: `${toolName.replace(/_/g, " ")} requires additional permissions. Please reconnect your account with the required scopes.` 
    };
  }

  return { allowed: true };
}

// Helper to execute tools
async function executeTool(
  toolName: string, 
  args: any, 
  supabase: any, 
  userId: string,
  authHeader: string,
  serviceSupabase: any
): Promise<any> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  
  console.log(`[Chat] Executing tool: ${toolName}`, args);

  try {
    switch (toolName) {
      // Gmail tools
      case "gmail_list_emails": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list", params: args }),
        });
        return await response.json();
      }

      case "gmail_send_email": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "send", params: args }),
        });
        return await response.json();
      }

      // Calendar tools
      case "calendar_list_events": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendar-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list", params: args }),
        });
        return await response.json();
      }

      case "calendar_create_event": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendar-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "create", params: args }),
        });
        return await response.json();
      }

      // Stripe tools
      case "stripe_get_balance": {
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "get_balance", params: args }),
        });
        return await response.json();
      }

      case "stripe_list_payments": {
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_charges", params: args }),
        });
        return await response.json();
      }

      case "stripe_list_customers": {
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_customers", params: args }),
        });
        return await response.json();
      }

      case "stripe_create_customer": {
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "create_customer", params: args }),
        });
        return await response.json();
      }

      // Shopify tools
      case "shopify_list_orders": {
        const response = await fetch(`${supabaseUrl}/functions/v1/shopify-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_orders", params: args }),
        });
        return await response.json();
      }

      case "shopify_list_products": {
        const response = await fetch(`${supabaseUrl}/functions/v1/shopify-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_products", params: args }),
        });
        return await response.json();
      }

      case "shopify_get_analytics": {
        const response = await fetch(`${supabaseUrl}/functions/v1/shopify-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "get_analytics_summary", params: args }),
        });
        return await response.json();
      }

      case "shopify_create_product": {
        const response = await fetch(`${supabaseUrl}/functions/v1/shopify-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "create_product", params: args }),
        });
        return await response.json();
      }

      // Notes tools
      case "notes_list": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notes-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list", params: args }),
        });
        return await response.json();
      }

      case "notes_search": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notes-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "search", params: args }),
        });
        return await response.json();
      }

      case "notes_create": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notes-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "create", params: args }),
        });
        return await response.json();
      }

      // Task tools
      case "create_task": {
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            user_id: userId,
            title: args.title,
            description: args.description || "",
            priority: args.priority || "medium",
            due_date: args.dueDate || null,
            status: "todo",
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, task: data };
      }

      case "list_tasks": {
        let query = supabase
          .from("tasks")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (args.status) {
          query = query.eq("status", args.status);
        }

        const { data, error } = await query.limit(20);
        if (error) throw error;
        return { tasks: data };
      }

      // Knowledge base search (legacy)
      case "search_knowledge": {
        const { data, error } = await supabase
          .from("workspace_documents")
          .select("id, title, extracted_content, created_at")
          .textSearch("extracted_content", args.query || "")
          .limit(5);

        if (error) {
          // Fallback to simple ILIKE search
          const { data: fallbackData } = await supabase
            .from("workspace_documents")
            .select("id, title, extracted_content, created_at")
            .ilike("extracted_content", `%${args.query}%`)
            .limit(5);
          return { documents: fallbackData || [] };
        }
        return { documents: data || [] };
      }

      // Knowledge base semantic search
      case "search_knowledge_base": {
        const response = await fetch(`${supabaseUrl}/functions/v1/search-knowledge-base`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: args.query, limit: args.limit || 5 }),
        });
        return await response.json();
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[Chat] Tool execution error:`, error);
    return { error: error instanceof Error ? error.message : "Tool execution failed" };
  }
}

// Helper to increment usage stats
async function incrementUsage(serviceSupabase: any, orgId: string, field: string) {
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
  
  try {
    // Try to update existing record
    const { data: existing } = await serviceSupabase
      .from("usage_stats")
      .select("id, " + field)
      .eq("org_id", orgId)
      .eq("month", currentMonth)
      .single();

    if (existing) {
      await serviceSupabase
        .from("usage_stats")
        .update({ [field]: (existing[field] || 0) + 1 })
        .eq("id", existing.id);
    } else {
      // Create new record for this month
      await serviceSupabase
        .from("usage_stats")
        .insert({
          org_id: orgId,
          month: currentMonth,
          [field]: 1,
        });
    }
  } catch (error) {
    console.error("[Chat] Error incrementing usage:", error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get authorization for user context
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let supabase: any = null;

    let orgId: string | null = null;

    if (authHeader) {
      supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;

      // Get user's org for usage tracking
      if (userId) {
        const { data: orgMember } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("user_id", userId)
          .limit(1)
          .single();
        orgId = orgMember?.org_id || null;
      }
    }

    console.log(`[Chat] Processing request for user: ${userId}, session: ${sessionId}`);

    // Create service client for usage tracking and rate limiting
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check rate limits
    if (userId) {
      const rateLimitCheck = await checkRateLimits(serviceSupabase, userId, orgId);
      if (!rateLimitCheck.allowed) {
        return new Response(
          JSON.stringify({ error: rateLimitCheck.reason }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Retrieve relevant conversation memories for context
    let memoryContext = "";
    if (userId && messages.length > 0) {
      const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
      if (lastUserMessage) {
        memoryContext = await getConversationMemories(serviceSupabase, userId, lastUserMessage.content);
      }
    }

    // Build the full message history with system prompt and memory context
    const systemPromptWithMemory = SYSTEM_PROMPT + memoryContext;
    const fullMessages = [
      { role: "system", content: systemPromptWithMemory },
      ...messages
    ];

    // Track AI call usage
    if (orgId) {
      await incrementUsage(serviceSupabase, orgId, "ai_calls");
    }

    // Call Lovable AI Gateway (non-streaming for tool handling)
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: fullMessages,
        tools: TOOL_DEFINITIONS,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limits reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const choice = aiResponse.choices?.[0];

    if (!choice) {
      throw new Error("No response from AI");
    }

    // Check if the AI wants to call tools
    if (choice.message?.tool_calls && choice.message.tool_calls.length > 0 && userId && supabase && authHeader) {
      const toolResults: any[] = [];

      for (const toolCall of choice.message.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

        // Check if this is a write tool that needs confirmation
        if (WRITE_TOOLS.includes(toolName)) {
          await serviceSupabase.from("pending_actions").insert({
            user_id: userId,
            session_id: sessionId,
            tool_name: toolName,
            tool_display_name: toolName.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
            parameters: toolArgs,
            status: "pending",
          });

          return new Response(
            JSON.stringify({
              content: `I'd like to ${toolName.replace(/_/g, " ")}. Here are the details:\n\n${JSON.stringify(toolArgs, null, 2)}\n\nPlease confirm this action.`,
              requiresConfirmation: true,
              toolName,
              toolArgs,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Execute read-only tools directly
        const result = await executeTool(toolName, toolArgs, supabase, userId, authHeader, serviceSupabase);
        
        // Track tool execution
        if (orgId) {
          await incrementUsage(serviceSupabase, orgId, "tool_executions");
        }

        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(result),
        });
      }

      // Make a follow-up call with tool results
      const followUpMessages = [
        ...fullMessages,
        choice.message,
        ...toolResults,
      ];

      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: followUpMessages,
          stream: false,
        }),
      });

      if (!followUpResponse.ok) {
        throw new Error("Failed to get follow-up response");
      }

      const followUpData = await followUpResponse.json();
      const finalContent = followUpData.choices?.[0]?.message?.content || "I encountered an issue processing the results.";

      return new Response(
        JSON.stringify({ content: finalContent }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No tool calls, return the direct response
    return new Response(
      JSON.stringify({ content: choice.message?.content || "" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});