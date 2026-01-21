import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service client for writes
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // LIST ALL INTEGRATIONS (global catalog)
    if (req.method === "GET" && action === "catalog") {
      const { data: integrations, error } = await serviceClient
        .from("integrations")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch integrations" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ integrations: integrations || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // LIST ORG INTEGRATIONS
    if (req.method === "GET" && action === "list") {
      const orgId = url.searchParams.get("org_id");

      if (!orgId) {
        return new Response(
          JSON.stringify({ error: "org_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user is member of org
      const { data: membership, error: memError } = await serviceClient
        .from("org_members")
        .select("role")
        .eq("org_id", orgId)
        .eq("user_id", user.id)
        .single();

      if (memError || !membership) {
        return new Response(
          JSON.stringify({ error: "Not a member of this organization" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get org integrations with full integration details
      const { data: orgIntegrations, error: intError } = await serviceClient
        .from("org_integrations")
        .select(`
          id,
          status,
          external_account_id,
          scopes,
          connected_at,
          updated_at,
          integration:integrations(id, name, slug, category, logo_url, auth_type, status, description)
        `)
        .eq("org_id", orgId);

      if (intError) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch org integrations" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          org_integrations: orgIntegrations || [],
          role: membership.role,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CONNECT INTEGRATION
    if (req.method === "POST" && action === "connect") {
      const body = await req.json();
      const { org_id, integration_id, external_account_id, scopes = [] } = body;

      if (!org_id || !integration_id) {
        return new Response(
          JSON.stringify({ error: "org_id and integration_id are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user is admin of org
      const { data: membership, error: memError } = await serviceClient
        .from("org_members")
        .select("role")
        .eq("org_id", org_id)
        .eq("user_id", user.id)
        .single();

      if (memError || !membership) {
        return new Response(
          JSON.stringify({ error: "Not a member of this organization" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!["owner", "admin"].includes(membership.role)) {
        return new Response(
          JSON.stringify({ error: "Only admins can connect integrations" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check if already connected (with same external_account_id)
      const { data: existing } = await serviceClient
        .from("org_integrations")
        .select("id, status")
        .eq("org_id", org_id)
        .eq("integration_id", integration_id)
        .eq("external_account_id", external_account_id || "")
        .maybeSingle();

      if (existing) {
        // Update existing connection
        const { data: updated, error: updateError } = await serviceClient
          .from("org_integrations")
          .update({
            status: "connected",
            scopes,
            connected_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to update integration" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ org_integration: updated, message: "Integration reconnected" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create new connection
      const { data: orgIntegration, error: insertError } = await serviceClient
        .from("org_integrations")
        .insert({
          org_id,
          integration_id,
          status: "connected",
          external_account_id: external_account_id || null,
          scopes,
          connected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("Integration connection error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to connect integration" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ org_integration: orgIntegration, message: "Integration connected" }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // DISCONNECT INTEGRATION
    if (req.method === "POST" && action === "disconnect") {
      const body = await req.json();
      const { org_integration_id } = body;

      if (!org_integration_id) {
        return new Response(
          JSON.stringify({ error: "org_integration_id is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get the org_integration to verify org membership
      const { data: orgInt, error: orgIntError } = await serviceClient
        .from("org_integrations")
        .select("org_id")
        .eq("id", org_integration_id)
        .single();

      if (orgIntError || !orgInt) {
        return new Response(
          JSON.stringify({ error: "Integration not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user is admin
      const { data: membership, error: memError } = await serviceClient
        .from("org_members")
        .select("role")
        .eq("org_id", orgInt.org_id)
        .eq("user_id", user.id)
        .single();

      if (memError || !membership || !["owner", "admin"].includes(membership.role)) {
        return new Response(
          JSON.stringify({ error: "Only admins can disconnect integrations" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update status to disconnected (soft delete)
      const { error: updateError } = await serviceClient
        .from("org_integrations")
        .update({ status: "disconnected" })
        .eq("id", org_integration_id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to disconnect integration" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Integration disconnected" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use ?action=catalog|list|connect|disconnect" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("MCP Integrations Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
