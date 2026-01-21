import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions for the AI
const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "gmail_list_emails",
      description: "List recent emails from the user's Gmail inbox",
      parameters: {
        type: "object",
        properties: {
          maxResults: { type: "number", description: "Maximum number of emails to return (default 10)" },
          query: { type: "string", description: "Search query to filter emails" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "gmail_send_email",
      description: "Send an email on behalf of the user. REQUIRES CONFIRMATION.",
      parameters: {
        type: "object",
        properties: {
          to: { type: "string", description: "Recipient email address" },
          subject: { type: "string", description: "Email subject" },
          body: { type: "string", description: "Email body content" }
        },
        required: ["to", "subject", "body"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "calendar_list_events",
      description: "List upcoming calendar events",
      parameters: {
        type: "object",
        properties: {
          timeMin: { type: "string", description: "Start time in ISO format" },
          timeMax: { type: "string", description: "End time in ISO format" },
          maxResults: { type: "number", description: "Maximum number of events" }
        }
      }
    }
  },
  {
    type: "function", 
    function: {
      name: "calendar_create_event",
      description: "Create a new calendar event. REQUIRES CONFIRMATION.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Event title" },
          startTime: { type: "string", description: "Start time in ISO format" },
          endTime: { type: "string", description: "End time in ISO format" },
          description: { type: "string", description: "Event description" }
        },
        required: ["title", "startTime", "endTime"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task in the user's task list",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Task title" },
          description: { type: "string", description: "Task description" },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "Task priority" },
          dueDate: { type: "string", description: "Due date in ISO format" }
        },
        required: ["title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "list_tasks",
      description: "List the user's tasks",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["todo", "in_progress", "done"], description: "Filter by status" }
        }
      }
    }
  }
];

// Tools that require user confirmation before execution
const WRITE_TOOLS = ["gmail_send_email", "calendar_create_event"];

const SYSTEM_PROMPT = `You are Elixa, an intelligent AI assistant for the Elixa workspace platform. You help users manage their work, communications, and schedule.

You have access to the following capabilities:
- Read and send emails via Gmail
- View and create calendar events
- Manage tasks

When using tools that modify data (sending emails, creating events), always clearly explain what you're about to do and confirm the details with the user before proceeding.

Be helpful, concise, and proactive. If you notice opportunities to help the user be more productive, suggest them.

Current date/time: ${new Date().toISOString()}`;

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

    if (authHeader) {
      const supabase = createClient(
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

    // Call Lovable AI Gateway with streaming
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
        stream: true,
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

    // Stream the response back
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
