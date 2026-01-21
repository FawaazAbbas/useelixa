import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generate secure token with prefix
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const token = Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `elixa_${token}`;
}

// Hash token for storage
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

    // LIST TOKENS - Get tokens for user's orgs
    if (req.method === "GET" && action === "list") {
      // Get user's org memberships
      const { data: memberships, error: memError } = await serviceClient
        .from("org_members")
        .select("org_id, role, orgs:org_id(id, name)")
        .eq("user_id", user.id);

      if (memError) {
        console.error("Membership lookup error:", memError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch memberships" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const orgIds = memberships?.map((m) => m.org_id) || [];

      if (orgIds.length === 0) {
        return new Response(
          JSON.stringify({ tokens: [], orgs: [] }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get tokens for these orgs
      const { data: tokens, error: tokError } = await serviceClient
        .from("mcp_tokens")
        .select("id, org_id, label, scopes, created_at, last_used_at, revoked_at, created_by")
        .in("org_id", orgIds)
        .order("created_at", { ascending: false });

      if (tokError) {
        console.error("Token lookup error:", tokError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch tokens" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get org details
      const { data: orgs } = await serviceClient
        .from("orgs")
        .select("id, name, plan")
        .in("id", orgIds);

      return new Response(
        JSON.stringify({
          tokens: tokens || [],
          orgs: orgs || [],
          memberships: memberships?.map((m) => ({ org_id: m.org_id, role: m.role })) || [],
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // CREATE TOKEN
    if (req.method === "POST" && action === "create") {
      const body = await req.json();
      const { label, org_id, scopes = [] } = body;

      if (!label || !org_id) {
        return new Response(
          JSON.stringify({ error: "label and org_id are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user is admin of the org
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
          JSON.stringify({ error: "Only admins can create tokens" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generate and hash token
      const token = generateToken();
      const tokenHash = await hashToken(token);

      // Insert using service role
      const { data: newToken, error: insertError } = await serviceClient
        .from("mcp_tokens")
        .insert({
          org_id,
          created_by: user.id,
          label,
          token_hash: tokenHash,
          scopes,
        })
        .select("id, label, scopes, created_at")
        .single();

      if (insertError) {
        console.error("Token creation error:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create token" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return token ONCE - won't be shown again
      return new Response(
        JSON.stringify({
          token, // Plain token - only shown once
          id: newToken.id,
          label: newToken.label,
          scopes: newToken.scopes,
          created_at: newToken.created_at,
          message: "Save this token securely. It won't be shown again.",
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // REVOKE TOKEN
    if (req.method === "POST" && action === "revoke") {
      const body = await req.json();
      const { tokenId } = body;

      if (!tokenId) {
        return new Response(
          JSON.stringify({ error: "tokenId is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get token to verify org membership
      const { data: tokenData, error: tokenError } = await serviceClient
        .from("mcp_tokens")
        .select("org_id")
        .eq("id", tokenId)
        .single();

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ error: "Token not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Verify user is admin of the org
      const { data: membership, error: memError } = await serviceClient
        .from("org_members")
        .select("role")
        .eq("org_id", tokenData.org_id)
        .eq("user_id", user.id)
        .single();

      if (memError || !membership || !["owner", "admin"].includes(membership.role)) {
        return new Response(
          JSON.stringify({ error: "Only admins can revoke tokens" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Revoke token
      const { error: updateError } = await serviceClient
        .from("mcp_tokens")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", tokenId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to revoke token" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Token revoked" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use ?action=list|create|revoke" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("MCP Tokens Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
