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
      throw new Error("Authorization header required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { action, params } = await req.json();
    console.log(`[Calendar] Action: ${action}, User: ${user.id}`);

    let result;

    switch (action) {
      case "list":
      case "list_local": {
        const timeMin = params?.timeMin || new Date().toISOString();
        const timeMax = params?.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id)
          .gte("start_time", timeMin)
          .lte("end_time", timeMax)
          .order("start_time", { ascending: true });

        if (error) throw error;

        result = {
          events: (data || []).map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            start: e.start_time,
            end: e.end_time,
            allDay: e.all_day,
            color: e.color,
          })),
          source: "local",
        };
        break;
      }

      case "create":
      case "create_local": {
        const { title, startTime, endTime, description, allDay, color } = params;
        
        const { data, error } = await supabase
          .from("calendar_events")
          .insert({
            user_id: user.id,
            title,
            description: description || "",
            start_time: startTime,
            end_time: endTime,
            all_day: allDay || false,
            color: color || null,
          })
          .select()
          .single();

        if (error) throw error;

        result = {
          success: true,
          event: data,
          source: "local",
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log execution
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceSupabase.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: `calendar_${action}`,
      success: true,
      input_summary: JSON.stringify(params).substring(0, 500),
      output_summary: JSON.stringify(result).substring(0, 500),
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Calendar integration error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
