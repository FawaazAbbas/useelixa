import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function verifySessionToken(token: string, secret: string): Promise<Record<string, unknown> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    // Verify HMAC
    const data = `${parts[0]}.${parts[1]}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const sigBytes = Uint8Array.from(atob(parts[2].replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(data));
    return valid ? payload : null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Extract session token
    const authHeader = req.headers.get("authorization") || "";
    const sessionToken = authHeader.replace("Bearer ", "");
    const tokenPayload = await verifySessionToken(sessionToken, secret);
    if (!tokenPayload) {
      return new Response(JSON.stringify({ error: "Invalid or expired session token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { integration, action, params } = await req.json();

    // Check permissions from token
    const permissions = (tokenPayload.permissions || {}) as Record<string, unknown>;
    // For now, allow if the integration is in permissions or permissions is empty (allow all)
    const hasPermission = Object.keys(permissions).length === 0 || permissions[integration];
    if (!hasPermission) {
      return new Response(JSON.stringify({ error: `No permission for integration: ${integration}` }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if this is a mutation that requires approval
    const isMutation = action === "mutate" || action === "update" || action === "delete" || action === "create";
    const installationId = tokenPayload.installationId as string;

    if (isMutation && installationId) {
      const { data: inst } = await supabase
        .from("agent_installations")
        .select("requires_approval")
        .eq("id", installationId)
        .single();

      if (inst?.requires_approval) {
        // Store as pending proposal
        const { data: proposal } = await supabase.from("agent_proposals").insert({
          installation_id: installationId,
          request_id: crypto.randomUUID(),
          user_id: tokenPayload.userId as string,
          title: `${integration}/${action}`,
          data: { integration, action, params },
          status: "pending",
        }).select("id").single();

        return new Response(JSON.stringify({
          status: "pending_approval",
          proposalId: proposal?.id,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // Route to the appropriate integration edge function
    const integrationFnMap: Record<string, string> = {
      google_ads: "google-ads-integration",
      google_analytics: "google-analytics-integration",
      google_sheets: "google-sheets-integration",
      gmail: "gmail-integration",
      shopify: "shopify-integration",
      stripe: "stripe-integration",
      notion: "notion-integration",
    };

    const fnName = integrationFnMap[integration];
    if (!fnName) {
      return new Response(JSON.stringify({ error: `Unsupported integration: ${integration}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Phase 3: Credential existence check ──
    const credentialMapping: Record<string, { credentialType: string; bundleType?: string }> = {
      gmail: { credentialType: "googleOAuth2Api", bundleType: "gmail" },
      google_ads: { credentialType: "googleOAuth2Api", bundleType: "google_ads" },
      google_analytics: { credentialType: "googleOAuth2Api", bundleType: "google_analytics" },
      google_sheets: { credentialType: "googleOAuth2Api", bundleType: "google_sheets" },
      shopify: { credentialType: "shopifyApi" },
      stripe: { credentialType: "stripeApi" },
      notion: { credentialType: "notionApi" },
    };

    const credMap = credentialMapping[integration];
    if (credMap) {
      let credQuery = supabase
        .from("user_credentials")
        .select("id, expires_at")
        .eq("user_id", tokenPayload.userId as string)
        .eq("credential_type", credMap.credentialType);

      if (credMap.bundleType) {
        credQuery = credQuery.eq("bundle_type", credMap.bundleType);
      }

      const { data: creds } = await credQuery.limit(1);
      if (!creds || creds.length === 0) {
        const integrationLabel = integration.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
        return new Response(JSON.stringify({
          error: "missing_connection",
          integration,
          message: `User has not connected ${integrationLabel}. Please connect it in Settings > Connections.`,
        }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { data, error } = await supabase.functions.invoke(fnName, {
      body: { action, ...params, userId: tokenPayload.userId },
    });

    if (error) throw error;

    // Log tool call
    await supabase.from("tool_execution_log").insert({
      user_id: tokenPayload.userId as string,
      tool_name: `${integration}/${action}`,
      success: true,
      input_summary: JSON.stringify(params).slice(0, 500),
      output_summary: JSON.stringify(data).slice(0, 500),
    }).then(() => {}).catch(() => {});

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
