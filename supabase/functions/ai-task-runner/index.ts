import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an AI task executor. Your job is to complete tasks assigned to you.

When given a task, analyze what needs to be done and execute it step by step.
If the task requires creating content, produce high-quality output.
If the task requires research or analysis, provide thorough and accurate results.

Always provide a clear summary of what you accomplished.`;

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

    // Fetch tasks assigned to AI that are in 'todo' status
    const { data: tasks, error: fetchError } = await serviceSupabase
      .from("tasks")
      .select("*")
      .eq("assigned_to", "ai")
      .eq("status", "todo")
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

    const results: any[] = [];

    for (const task of tasks) {
      const startTime = Date.now();
      
      try {
        console.log(`[AITaskRunner] Processing task: ${task.id} - ${task.title}`);

        // Update task to in_progress
        await serviceSupabase
          .from("tasks")
          .update({ status: "in_progress" })
          .eq("id", task.id);

        // Construct the prompt for the AI
        const taskPrompt = `
Task Title: ${task.title}
Task Description: ${task.description || "No description provided"}
Priority: ${task.priority || "medium"}
Due Date: ${task.due_date || "Not specified"}

Please complete this task and provide a detailed summary of what you accomplished.
`;

        // Call Lovable AI to process the task
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: taskPrompt },
            ],
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          throw new Error(`AI API error: ${response.status}`);
        }

        const aiResponse = await response.json();
        const result = aiResponse.choices?.[0]?.message?.content || "Task completed";

        // Update task to done and add the AI's result to description
        const updatedDescription = `${task.description || ""}\n\n---\n**AI Execution Result:**\n${result}`;
        
        await serviceSupabase
          .from("tasks")
          .update({ 
            status: "done",
            description: updatedDescription.substring(0, 5000), // Limit length
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
          output_summary: result.substring(0, 500),
        });

        // Create notification for completed task
        await serviceSupabase.from("notifications").insert({
          user_id: task.user_id,
          type: "task_complete",
          title: `AI Task Completed: ${task.title}`,
          message: result.substring(0, 200),
          metadata: { task_id: task.id },
          action_url: "/tasks",
        });

        results.push({
          taskId: task.id,
          title: task.title,
          success: true,
          executionTimeMs: Date.now() - startTime,
        });

        console.log(`[AITaskRunner] Completed task: ${task.id}`);

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
