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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { employeeId, message, userId } = await req.json();

    // Fetch employee
    const { data: employee } = await supabase
      .from("ai_employees")
      .select("*")
      .eq("id", employeeId)
      .single();

    if (!employee) {
      throw new Error("Employee not found");
    }

    // Call main chat function with employee context
    const { data, error } = await supabase.functions.invoke("chat", {
      body: {
        messages: [{ role: "user", content: message }],
        systemPrompt: employee.system_prompt || `You are ${employee.name}, a ${employee.role}.`,
        allowedTools: employee.allowed_tools || [],
      },
    });

    if (error) throw error;

    // Log the interaction
    await supabase.from("ai_employee_messages").insert({
      from_employee_id: employeeId,
      to_employee_id: null,
      initiated_by_user: userId,
      message_type: "response",
      content: data?.response || "",
      metadata: { tools_used: data?.tools_used || [] },
    });

    return new Response(JSON.stringify({ response: data?.response || "I'm ready to help!", tools_used: data?.tools_used }), {
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
