import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { agentId } = await req.json();

    const { data: agent, error } = await supabase
      .from("agent_submissions")
      .select("endpoint_base_url, endpoint_health_path, endpoint_auth_type, endpoint_secret")
      .eq("id", agentId)
      .single();

    if (error || !agent?.endpoint_base_url) throw new Error("Agent not found or not an endpoint agent");

    const healthUrl = `${agent.endpoint_base_url.replace(/\/$/, "")}${agent.endpoint_health_path || "/health"}`;
    const headers: Record<string, string> = {};

    if (agent.endpoint_auth_type === "api_key" && agent.endpoint_secret) {
      headers["Authorization"] = `Bearer ${agent.endpoint_secret}`;
    }

    const start = Date.now();
    const res = await fetch(healthUrl, { method: "GET", headers });
    const latency = Date.now() - start;

    return new Response(JSON.stringify({
      status: res.ok ? "healthy" : "unhealthy",
      statusCode: res.status,
      latencyMs: latency,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ status: "error", error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
