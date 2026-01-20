import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server misconfigured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authHeader = req.headers.get("Authorization") ?? "";

    // Validate user (we do not rely on verify_jwt)
    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: userData, error: userError } = await authedClient.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Service role client bypasses RLS for setup tasks
    const admin = createClient(supabaseUrl, supabaseServiceRoleKey);

    // 1) Find membership
    const { data: member } = await admin
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (member?.workspace_id) {
      return new Response(JSON.stringify({ workspaceId: member.workspace_id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2) Create workspace
    const { data: workspace, error: workspaceError } = await admin
      .from("workspaces")
      .insert({ name: "My Workspace", owner_id: userId })
      .select("id")
      .single();

    if (workspaceError || !workspace?.id) {
      console.error("ensure-workspace: create workspace failed", workspaceError);
      return new Response(JSON.stringify({ error: "Failed to create workspace" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3) Create membership
    const { error: memberError } = await admin.from("workspace_members").insert({
      user_id: userId,
      workspace_id: workspace.id,
      role: "owner",
    });

    if (memberError) {
      console.error("ensure-workspace: create membership failed", memberError);
      return new Response(JSON.stringify({ error: "Failed to create membership" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ workspaceId: workspace.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ensure-workspace error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
