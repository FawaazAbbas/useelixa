import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Tool definitions available to the AI task runner
const AVAILABLE_TOOLS = [
  {
    type: "function",
    function: {
      name: "search_knowledge_base",
      description: "Search the organization's knowledge base for relevant documents and information",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_note",
      description: "Create a note to store findings or results",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Note title" },
          content: { type: "string", description: "Note content in markdown" },
        },
        required: ["title", "content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_subtask",
      description: "Create a subtask for follow-up work",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Subtask title" },
          description: { type: "string", description: "Subtask description" },
          priority: { type: "string", enum: ["low", "medium", "high"], description: "Priority level" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_calendar_events",
      description: "List upcoming calendar events for context",
      parameters: {
        type: "object",
        properties: {
          days_ahead: { type: "number", description: "Number of days to look ahead (default 7)" },
        },
      },
    },
  },
];

const SYSTEM_PROMPT = `You are an AI task executor with access to tools. Your job is to complete tasks assigned to you.

When given a task:
1. Analyze what needs to be done
2. Use available tools to gather information or take actions
3. Execute the task step by step
4. Provide a clear summary of what you accomplished

You have access to:
- Knowledge base search for finding relevant documents
- Note creation for storing results
- Subtask creation for follow-up work
- Calendar access for scheduling context

Always provide thorough, accurate results and use tools when they would help complete the task better.`;

interface ToolResult {
  error?: string;
  success?: boolean;
  results?: unknown[];
  count?: number;
  note_id?: string;
  task_id?: string;
  title?: string;
  events?: unknown[];
  period?: string;
  message?: string;
}

// Execute tool calls
async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  userId: string,
  workspaceId: string | null
): Promise<ToolResult> {
  console.log(`[AITaskRunner] Executing tool: ${toolName}`, args);

  switch (toolName) {
    case "search_knowledge_base": {
      const query = args.query as string;
      
      // Generate embedding for query
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: query,
        }),
      });

      if (!embeddingResponse.ok) {
        return { error: "Failed to generate embedding", results: [] };
      }

      const embeddingData = await embeddingResponse.json();
      const embedding = embeddingData.data?.[0]?.embedding;

      if (!embedding || !workspaceId) {
        return { results: [], message: "No embedding or workspace available" };
      }

      // Search documents using direct fetch to avoid type issues
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/match_documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          query_embedding: embedding,
          match_threshold: 0.7,
          match_count: 5,
          p_workspace_id: workspaceId,
        }),
      });

      const documents = await rpcResponse.json();

      return {
        results: documents || [],
        count: Array.isArray(documents) ? documents.length : 0,
      };
    }

    case "create_note": {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          user_id: userId,
          title: args.title as string,
          content: args.content as string,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: errorText };
      }
      
      const notes = await response.json();
      const note = notes[0];
      return { success: true, note_id: note?.id, title: note?.title };
    }

    case "create_subtask": {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const response = await fetch(`${supabaseUrl}/rest/v1/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": supabaseServiceKey,
          "Authorization": `Bearer ${supabaseServiceKey}`,
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          user_id: userId,
          title: args.title as string,
          description: args.description as string || null,
          priority: args.priority as string || "medium",
          status: "todo",
          assigned_to: "user",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: errorText };
      }
      
      const tasks = await response.json();
      const task = tasks[0];
      return { success: true, task_id: task?.id, title: task?.title };
    }

    case "list_calendar_events": {
      const daysAhead = (args.days_ahead as number) || 7;
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/calendar_events?user_id=eq.${userId}&start_time=gte.${startDate}&start_time=lte.${endDate}&order=start_time.asc&limit=20`,
        {
          headers: {
            "apikey": supabaseServiceKey,
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
        }
      );

      const events = await response.json();

      return {
        events: events || [],
        count: Array.isArray(events) ? events.length : 0,
        period: `Next ${daysAhead} days`,
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

interface Message {
  role: string;
  content?: string;
  tool_calls?: Array<{
    id: string;
    function: { name: string; arguments: string };
  }>;
  tool_call_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log("[AITaskRunner] Starting task runner...");

    const now = new Date().toISOString();

    // Fetch tasks assigned to AI that are ready to run
    const { data: tasks, error: fetchError } = await serviceSupabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", "ai")
      .eq("status", "todo")
      .or(`scheduled_at.is.null,scheduled_at.lte.${now}`)
      .limit(5);

    if (fetchError) {
      console.error("[AITaskRunner] Error fetching tasks:", fetchError);
      throw fetchError;
    }

    if (!tasks || tasks.length === 0) {
      console.log("[AITaskRunner] No AI tasks to process");
      return new Response(
        JSON.stringify({ message: "No tasks to process", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[AITaskRunner] Found ${tasks.length} tasks to process`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const results: Array<{
      taskId: string;
      title: string;
      success: boolean;
      executionTimeMs?: number;
      error?: string;
    }> = [];

    for (const task of tasks) {
      const startTime = Date.now();
      
      try {
        console.log(`[AITaskRunner] Processing task: ${task.id} - ${task.title}`);

        // Update task to in_progress and set last_run_at
        await serviceSupabase
          .from("tasks")
          .update({ status: "in_progress", last_run_at: now })
          .eq("id", task.id);

        // Get user's workspace for knowledge base access
        const { data: workspaceMember } = await serviceSupabase
          .from("workspace_members")
          .select("workspace_id")
          .eq("user_id", task.user_id)
          .limit(1)
          .single();

        const workspaceId = workspaceMember?.workspace_id || null;

        // Build context from task-specific settings
        let contextInfo = "";
        if (task.ai_context) {
          contextInfo += `\nAdditional context: ${task.ai_context}`;
        }

        // Filter tools based on ai_tools_allowed
        const allowedTools = task.ai_tools_allowed?.length > 0
          ? AVAILABLE_TOOLS.filter((t) => 
              task.ai_tools_allowed.includes(t.function.name)
            )
          : AVAILABLE_TOOLS;

        // Construct the prompt for the AI
        const taskPrompt = `
Task Title: ${task.title}
Task Description: ${task.description || "No description provided"}
Priority: ${task.priority || "medium"}
Due Date: ${task.due_date || "Not specified"}
${contextInfo}

Please complete this task using the available tools when helpful. Provide a detailed summary of what you accomplished.
`;

        // Initial AI call with tools
        const messages: Message[] = [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: taskPrompt },
        ];

        let finalResult = "";
        let toolCallCount = 0;
        const maxToolCalls = 5;

        while (toolCallCount < maxToolCalls) {
          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-3-flash-preview",
              messages,
              tools: allowedTools.length > 0 ? allowedTools : undefined,
              max_tokens: 2000,
            }),
          });

          if (!response.ok) {
            throw new Error(`AI API error: ${response.status}`);
          }

          const aiResponse = await response.json();
          const choice = aiResponse.choices?.[0];
          const message = choice?.message;

          if (!message) {
            throw new Error("No response from AI");
          }

          // Check for tool calls
          if (message.tool_calls && message.tool_calls.length > 0) {
            messages.push(message as Message);

            // Execute each tool call
            for (const toolCall of message.tool_calls) {
              const toolName = toolCall.function.name;
              const toolArgs = JSON.parse(toolCall.function.arguments || "{}");

              const toolResult = await executeTool(
                toolName,
                toolArgs,
                task.user_id,
                workspaceId
              );

              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(toolResult),
              });
            }

            toolCallCount++;
          } else {
            // No tool calls - we have the final response
            finalResult = message.content || "Task completed";
            break;
          }
        }

        if (!finalResult) {
          finalResult = "Task completed (max tool calls reached)";
        }

        // Update task to done and add the AI's result to description
        const updatedDescription = `${task.description || ""}\n\n---\n**AI Execution Result (${new Date().toLocaleDateString()}):**\n${finalResult}`;
        
        await serviceSupabase
          .from("tasks")
          .update({ 
            status: "done",
            description: updatedDescription.substring(0, 5000),
          })
          .eq("id", task.id);

        // Log the execution
        await serviceSupabase.from("tool_execution_log").insert({
          user_id: task.user_id,
          tool_name: "ai_task_runner",
          credential_type: "internal",
          success: true,
          execution_time_ms: Date.now() - startTime,
          input_summary: `Task: ${task.title}`,
          output_summary: finalResult.substring(0, 500),
        });

        // Create notification for completed task
        await serviceSupabase.from("notifications").insert({
          user_id: task.user_id,
          type: "task_complete",
          title: `AI Task Completed: ${task.title}`,
          message: finalResult.substring(0, 200),
          metadata: { task_id: task.id, tool_calls: toolCallCount },
          action_url: "/tasks",
        });

        results.push({
          taskId: task.id,
          title: task.title,
          success: true,
          executionTimeMs: Date.now() - startTime,
        });

        console.log(`[AITaskRunner] Completed task: ${task.id} with ${toolCallCount} tool calls`);

      } catch (taskError) {
        console.error(`[AITaskRunner] Error processing task ${task.id}:`, taskError);

        // Revert to todo on failure
        await serviceSupabase
          .from("tasks")
          .update({ status: "todo" })
          .eq("id", task.id);

        // Log the failure
        await serviceSupabase.from("tool_execution_log").insert({
          user_id: task.user_id,
          tool_name: "ai_task_runner",
          credential_type: "internal",
          success: false,
          execution_time_ms: Date.now() - startTime,
          input_summary: `Task: ${task.title}`,
          output_summary: taskError instanceof Error ? taskError.message : "Unknown error",
        });

        // Create notification for failed task
        await serviceSupabase.from("notifications").insert({
          user_id: task.user_id,
          type: "integration_error",
          title: `AI Task Failed: ${task.title}`,
          message: taskError instanceof Error ? taskError.message : "Unknown error",
          metadata: { task_id: task.id },
          action_url: "/tasks",
        });

        results.push({
          taskId: task.id,
          title: task.title,
          success: false,
          error: taskError instanceof Error ? taskError.message : "Unknown error",
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} tasks`,
        processed: results.length,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[AITaskRunner] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
