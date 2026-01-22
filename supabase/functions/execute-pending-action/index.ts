import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { actionId, decision } = await req.json();
    console.log(`[PendingAction] Processing action ${actionId} with decision: ${decision}`);

    if (!actionId || !decision) {
      return new Response(
        JSON.stringify({ error: "actionId and decision are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["approved", "denied"].includes(decision)) {
      return new Response(
        JSON.stringify({ error: "decision must be 'approved' or 'denied'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the pending action
    const { data: action, error: fetchError } = await supabase
      .from("pending_actions")
      .select("*")
      .eq("id", actionId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .single();

    if (fetchError || !action) {
      return new Response(
        JSON.stringify({ error: "Pending action not found or already processed" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // If denied, update status and return
    if (decision === "denied") {
      await serviceSupabase
        .from("pending_actions")
        .update({ 
          status: "denied", 
          resolved_at: new Date().toISOString() 
        })
        .eq("id", actionId);

      // Create notification for denied action
      await serviceSupabase.from("notifications").insert({
        user_id: user.id,
        type: "pending_action",
        title: `Action Denied: ${action.tool_display_name}`,
        message: "You denied this pending action.",
        metadata: { action_id: actionId, tool_name: action.tool_name },
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Action was denied and will not be executed." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Execute the approved action
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const toolName = action.tool_name;
    const toolArgs = action.parameters;
    let result: any;
    let executionError: string | null = null;

    try {
      switch (toolName) {
        case "gmail_send_email": {
          const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "send", params: toolArgs }),
          });
          result = await response.json();
          break;
        }

        case "calendar_create_event": {
          const response = await fetch(`${supabaseUrl}/functions/v1/calendar-integration`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "create", params: toolArgs }),
          });
          result = await response.json();
          break;
        }

        case "notes_create": {
          const response = await fetch(`${supabaseUrl}/functions/v1/notes-integration`, {
            method: "POST",
            headers: {
              Authorization: authHeader,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action: "create", params: toolArgs }),
          });
          result = await response.json();
          break;
        }

        default:
          executionError = `Unknown tool: ${toolName}`;
      }
    } catch (error) {
      executionError = error instanceof Error ? error.message : "Execution failed";
    }

    // Update the pending action status
    await serviceSupabase
      .from("pending_actions")
      .update({ 
        status: executionError ? "failed" : "approved",
        result: result,
        error_message: executionError,
        resolved_at: new Date().toISOString() 
      })
      .eq("id", actionId);

    // Log the execution
    await serviceSupabase.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: toolName,
      credential_type: "oauth",
      success: !executionError,
      input_summary: JSON.stringify(toolArgs).substring(0, 500),
      output_summary: executionError || JSON.stringify(result).substring(0, 500),
    });

    // Create notification for completed/failed action
    await serviceSupabase.from("notifications").insert({
      user_id: user.id,
      type: executionError ? "integration_error" : "task_complete",
      title: executionError 
        ? `Action Failed: ${action.tool_display_name}` 
        : `Action Completed: ${action.tool_display_name}`,
      message: executionError || "The action was executed successfully.",
      metadata: { action_id: actionId, tool_name: toolName, result },
      action_url: "/logs",
    });

    if (executionError) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: executionError 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully executed ${action.tool_display_name}`,
        result 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[PendingAction] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
