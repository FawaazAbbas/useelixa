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
    const executionStartTime = Date.now();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { employeeId, message, userId } = await req.json();

    // Fetch employee — check agent_submissions first for hosting info
    const { data: submission } = await supabase
      .from("agent_submissions")
      .select("*")
      .eq("id", employeeId)
      .single();

    // Fallback to ai_employees table
    const { data: employee } = await supabase
      .from("ai_employees")
      .select("*")
      .eq("id", employeeId)
      .single();

    const agent = submission || employee;
    if (!agent) {
      throw new Error("Employee not found");
    }

    let responseData: { response: string; tools_used?: string[] };

    // Route based on hosting type
    const hostingType = submission?.hosting_type || "platform";

    if (hostingType === "self_hosted" && submission?.external_endpoint_url) {
      // Self-hosted: call the developer's external endpoint
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (submission.external_auth_header && submission.external_auth_token) {
        headers[submission.external_auth_header] = submission.external_auth_token;
      }

      const externalRes = await fetch(submission.external_endpoint_url, {
        method: "POST",
        headers,
        body: JSON.stringify({ message, user_id: userId, context: {} }),
      });

      if (!externalRes.ok) {
        throw new Error(`External agent returned ${externalRes.status}: ${await externalRes.text()}`);
      }

      responseData = await externalRes.json();
    } else if (hostingType === "platform" && submission?.code_file_url) {
      // Platform-hosted with uploaded code: execute via Python runner
      const { data, error } = await supabase.functions.invoke("execute-python-agent", {
        body: {
          code_file_url: submission.code_file_url,
          entry_function: submission.entry_function || "handle",
          requirements: submission.requirements || "",
          message,
          user_id: userId,
          context: {},
          agent_id: submission.id,
        },
      });

      if (error) throw error;
      responseData = { response: data?.response || "No response from agent.", tools_used: data?.tools_used };
    } else {
      // Legacy platform-hosted (no code file) or native: use internal chat function
      const systemPrompt = agent.system_prompt || `You are ${agent.name}, a ${agent.role || "helpful assistant"}.`;
      const allowedTools = agent.allowed_tools || [];

      const { data, error } = await supabase.functions.invoke("chat", {
        body: {
          messages: [{ role: "user", content: message }],
          systemPrompt,
          allowedTools,
        },
      });

      if (error) throw error;
      responseData = { response: data?.response || "I'm ready to help!", tools_used: data?.tools_used };
    }

    // Log the interaction
    await supabase.from("ai_employee_messages").insert({
      from_employee_id: employeeId,
      to_employee_id: null,
      initiated_by_user: userId,
      message_type: "response",
      content: responseData.response,
      metadata: { tools_used: responseData.tools_used || [] },
    });

    // Log execution for developer analytics
    const executionEndTime = Date.now();
    if (submission?.developer_id) {
      await supabase.from("agent_execution_logs").insert({
        agent_id: employeeId,
        developer_id: submission.developer_id,
        user_id: userId,
        input_message: message,
        output_response: responseData.response,
        status: "success",
        execution_time_ms: executionEndTime - executionStartTime,
      }).then(() => {}).catch(() => {}); // fire-and-forget
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Best-effort error log
    try {
      const supabaseForLog = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const body = await req.clone().json().catch(() => ({}));
      if (body.employeeId) {
        const { data: sub } = await supabaseForLog.from("agent_submissions").select("developer_id").eq("id", body.employeeId).maybeSingle();
        if (sub?.developer_id) {
          await supabaseForLog.from("agent_execution_logs").insert({
            agent_id: body.employeeId,
            developer_id: sub.developer_id,
            user_id: body.userId || null,
            input_message: body.message || null,
            status: "error",
            error_message: errorMessage,
          });
        }
      }
    } catch (_) { /* ignore logging errors */ }

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
