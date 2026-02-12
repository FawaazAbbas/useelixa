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

    const { actorType, actorId, employeeId, message, userId } = await req.json();

    let responseData: { response: string; tools_used?: string[]; actions?: unknown[]; receipts?: unknown[]; requestId?: string };

    if (actorType === "installed_agent" && actorId) {
      // ── Deterministic installation-based routing ──
      const { data: installation, error: instErr } = await supabase
        .from("agent_installations")
        .select("*, agent_submissions(*)")
        .eq("id", actorId)
        .single();

      if (instErr || !installation) {
        throw new Error("Installation not found");
      }

      const submission = installation.agent_submissions as any;
      if (!submission) {
        throw new Error("Agent submission not found for installation");
      }

      const execMode = submission.execution_mode || "native";

      if (execMode === "endpoint" && submission.endpoint_base_url) {
        const { data, error } = await supabase.functions.invoke("endpoint-invoke", {
          body: {
            agentId: submission.id,
            installationId: actorId,
            message,
            userId,
            workspaceId: installation.workspace_id,
          },
        });
        if (error) {
          // Extract actual error message from the response
          const errorDetail = data?.error || error?.message || String(error);
          console.error("endpoint-invoke error:", errorDetail);
          throw new Error(`Endpoint agent error: ${errorDetail}`);
        }
        responseData = {
          response: data?.response || data?.assistantMessage || "No response from agent.",
          tools_used: [],
          actions: data?.actions || [],
          receipts: data?.receipts || [],
          requestId: data?.requestId,
        };
      } else {
        // Fallback to internal chat for native/legacy agents
        const systemPrompt = submission.system_prompt || `You are ${submission.name}, a helpful assistant.`;
        const allowedTools = submission.allowed_tools || [];
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

      // Log interaction
      if (submission.developer_id) {
        await supabase.from("agent_execution_logs").insert({
          agent_id: submission.id,
          developer_id: submission.developer_id,
          user_id: userId,
          input_message: message,
          output_response: responseData.response,
          status: "success",
          execution_time_ms: Date.now() - executionStartTime,
        }).then(() => {}).catch(() => {});
      }
    } else {
      // ── Legacy flow using employeeId ──
      const { data: submission } = await supabase
        .from("agent_submissions")
        .select("*")
        .eq("id", employeeId)
        .single();

      const { data: employee } = await supabase
        .from("ai_employees")
        .select("*")
        .eq("id", employeeId)
        .single();

      const agent = submission || employee;
      if (!agent) {
        throw new Error("Employee not found");
      }

      const executionMode = submission?.execution_mode || "native";
      const hostingType = submission?.hosting_type || "platform";

      if (executionMode === "endpoint" && submission?.endpoint_base_url) {
        const { data, error } = await supabase.functions.invoke("endpoint-invoke", {
          body: {
            agentId: employeeId,
            message,
            userId,
            workspaceId: null,
            threadId: null,
            installationId: null,
          },
        });
        if (error) {
          const errorDetail = data?.error || error?.message || String(error);
          console.error("endpoint-invoke error (legacy):", errorDetail);
          throw new Error(`Endpoint agent error: ${errorDetail}`);
        }
        responseData = { response: data?.response || data?.assistantMessage || "No response from endpoint agent.", tools_used: [] };
      } else if (hostingType === "self_hosted" && submission?.external_endpoint_url) {
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
        }).then(() => {}).catch(() => {});
      }
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
