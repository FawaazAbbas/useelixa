import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  { type: "function", function: { name: "shopify_list_orders", description: "List Shopify orders", parameters: { type: "object", properties: { limit: { type: "number" }, status: { type: "string" } } } } },
  { type: "function", function: { name: "shopify_list_products", description: "List Shopify products", parameters: { type: "object", properties: { limit: { type: "number" } } } } },
  { type: "function", function: { name: "shopify_get_analytics", description: "Get Shopify analytics summary", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "notes_list", description: "List user's notes", parameters: { type: "object", properties: { limit: { type: "number" } } } } },
  { type: "function", function: { name: "notes_search", description: "Search notes by query", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
  { type: "function", function: { name: "notes_create", description: "Create a new note", parameters: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } }, required: ["title"] } } },
];

// Tools that require user confirmation before execution
const WRITE_TOOLS = ["gmail_send_email", "calendar_create_event"];

const SYSTEM_PROMPT = `You are Elixa, an intelligent AI assistant for the Elixa workspace platform. You help users manage their work, communications, and schedule.

You have access to the following capabilities:
- Read and send emails via Gmail (use gmail_list_emails, gmail_send_email)
- View and create calendar events (use calendar_list_events, calendar_create_event)
- Manage tasks (use create_task, list_tasks)
- Search knowledge base documents (use search_knowledge)

When using tools that modify data (sending emails, creating events), always clearly explain what you're about to do and confirm the details with the user before proceeding.

Be helpful, concise, and proactive. If you notice opportunities to help the user be more productive, suggest them.

Current date/time: ${new Date().toISOString()}`;

// Helper to execute tools
async function executeTool(
  toolName: string, 
  args: any, 
  supabase: any, 
  userId: string,
  authHeader: string
): Promise<any> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  
  console.log(`[Chat] Executing tool: ${toolName}`, args);

  try {
    switch (toolName) {
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

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[Chat] Tool execution error:`, error);
    return { error: error instanceof Error ? error.message : "Tool execution failed" };
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

    if (authHeader) {
      supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    }

    console.log(`[Chat] Processing request for user: ${userId}, session: ${sessionId}`);

    // Build the full message history with system prompt
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];

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
          // Return a pending action response
          const serviceSupabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
          );

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
        const result = await executeTool(toolName, toolArgs, supabase, userId, authHeader);
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
