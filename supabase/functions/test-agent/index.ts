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
      throw new Error("Authentication required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { agent_id, message } = await req.json();
    if (!agent_id) {
      throw new Error("agent_id is required");
    }

    // Fetch agent with runtime info
    const { data: agent, error: agentError } = await supabase
      .from("agent_submissions")
      .select("*, developer_profiles!inner(user_id)")
      .eq("id", agent_id)
      .single();

    if (agentError || !agent) {
      throw new Error("Agent not found");
    }

    const runtime = agent.runtime || "python";

    // --- TypeScript agents: execute directly in Deno ---
    if (runtime === "typescript") {
      if (!agent.code_file_url) {
        throw new Error("No code file uploaded for this agent");
      }

      // Download the code
      const codeResponse = await fetch(agent.code_file_url);
      if (!codeResponse.ok) {
        throw new Error(`Failed to download code file: ${codeResponse.status}`);
      }
      const code = await codeResponse.text();

      const entryFn = agent.entry_function || "handle";

      // Dynamic import via data URI
      const blob = new Blob([code], { type: "application/typescript" });
      const url = URL.createObjectURL(blob);

      try {
        const mod = await import(url);
        const handler = mod[entryFn] || mod.default;

        if (typeof handler !== "function") {
          throw new Error(`Entry function "${entryFn}" not found in agent code. Available exports: ${Object.keys(mod).join(", ")}`);
        }

        const input = {
          message: message || "",
          user_id: user.id,
          context: {},
        };

        const result = await handler(input);

        // Normalize response
        let responseData: { response: string; tools_used?: string[] };
        if (typeof result === "string") {
          responseData = { response: result, tools_used: [] };
        } else if (result && typeof result === "object") {
          responseData = {
            response: result.response ?? JSON.stringify(result),
            tools_used: result.tools_used ?? [],
          };
        } else {
          responseData = { response: String(result), tools_used: [] };
        }

        return new Response(JSON.stringify(responseData), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } finally {
        URL.revokeObjectURL(url);
      }
    }

    // --- Python agents: proxy to execute-python-agent ---
    const execResponse = await fetch(
      `${Deno.env.get("SUPABASE_URL")}/functions/v1/execute-python-agent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({
          code_file_url: agent.code_file_url,
          entry_function: agent.entry_function || "handle",
          requirements: agent.requirements,
          message: message || "",
          user_id: user.id,
          context: {},
          agent_id: agent.id,
        }),
      }
    );

    const result = await execResponse.json();

    if (!execResponse.ok) {
      return new Response(JSON.stringify({ error: result.error || "Execution failed" }), {
        status: execResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
