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
    const { code, credentialType, installationId } = await req.json();

    if (!code || !credentialType || !installationId) {
      throw new Error("Missing required parameters");
    }

    console.log(`Exchanging OAuth code for ${credentialType}`);

    // Get OAuth configuration based on credential type
    const tokenUrl = getTokenUrl(credentialType);
    const clientId = Deno.env.get(`${credentialType.toUpperCase()}_CLIENT_ID`);
    const clientSecret = Deno.env.get(`${credentialType.toUpperCase()}_CLIENT_SECRET`);

    if (!clientId || !clientSecret) {
      throw new Error(`OAuth credentials not configured for ${credentialType}`);
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(),
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokens = await tokenResponse.json();

    // Store tokens in agent_configurations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existingConfig } = await supabase
      .from("agent_configurations")
      .select("configuration")
      .eq("agent_installation_id", installationId)
      .maybeSingle();

    const newConfig = {
      ...existingConfig?.configuration,
      credentials: {
        ...existingConfig?.configuration?.credentials,
        [credentialType]: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + (tokens.expires_in || 3600) * 1000,
          token_type: tokens.token_type,
        },
      },
    };

    await supabase
      .from("agent_configurations")
      .upsert({
        agent_installation_id: installationId,
        configuration: newConfig,
      });

    // Get agent ID for redirect
    const { data: installation } = await supabase
      .from("agent_installations")
      .select("agent_id")
      .eq("id", installationId)
      .single();

    console.log(`Successfully stored ${credentialType} credentials`);

    return new Response(
      JSON.stringify({
        success: true,
        agentId: installation?.agent_id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("OAuth token exchange error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getTokenUrl(credentialType: string): string {
  const urls: Record<string, string> = {
    notionApi: "https://api.notion.com/v1/oauth/token",
    slackOAuth2Api: "https://slack.com/api/oauth.v2.access",
    googleOAuth2Api: "https://oauth2.googleapis.com/token",
  };

  return urls[credentialType] || "";
}

function getRedirectUri(): string {
  // In production, this should be your actual domain
  const baseUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";
  return `${baseUrl}/oauth/callback`;
}
