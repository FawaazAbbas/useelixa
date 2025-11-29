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
    const { code, credentialType, userId } = await req.json();

    if (!code || !credentialType || !userId) {
      console.error("Missing parameters:", { code: !!code, credentialType, userId: !!userId });
      throw new Error("Missing required parameters");
    }

    console.log(`🔐 Exchanging OAuth code for ${credentialType}`, { 
      userId, 
      redirectUri: getRedirectUri(),
      siteUrl: Deno.env.get("SITE_URL")
    });

    // Get OAuth configuration based on credential type
    const tokenUrl = getTokenUrl(credentialType);
    const clientId = Deno.env.get(`${credentialType.toUpperCase()}_CLIENT_ID`);
    const clientSecret = Deno.env.get(`${credentialType.toUpperCase()}_CLIENT_SECRET`);

    if (!clientId || !clientSecret) {
      console.error(`Missing OAuth config for ${credentialType}:`, { 
        hasClientId: !!clientId, 
        hasClientSecret: !!clientSecret 
      });
      throw new Error(`OAuth credentials not configured for ${credentialType}`);
    }
    
    console.log(`✓ OAuth config found for ${credentialType}`);

    // Exchange authorization code for access token
    const isGoogleProvider = credentialType === "googleOAuth2Api";
    
    let tokenResponse;
    if (isGoogleProvider) {
      // Google requires application/x-www-form-urlencoded
      const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(),
        grant_type: "authorization_code",
      });

      tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
    } else {
      // Other providers use JSON
      tokenResponse = await fetch(tokenUrl, {
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
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error(`❌ Token exchange failed (${tokenResponse.status}):`, errorText);
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorText}`);
    }
    
    console.log(`✓ Token exchange successful`);

    const tokens = await tokenResponse.json();

    // Store tokens in user_credentials table
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: upsertError } = await supabaseClient
      .from("user_credentials")
      .upsert({
        user_id: userId,
        credential_type: credentialType,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        token_type: tokens.token_type || "Bearer",
      }, {
        onConflict: "user_id,credential_type"
      });

    if (upsertError) {
      console.error("❌ Error storing credentials:", upsertError);
      throw upsertError;
    }

    console.log(`✅ Successfully stored ${credentialType} credentials for user`);

    return new Response(
      JSON.stringify({
        success: true
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
    quickbooksApi: "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    microsoftOAuth2Api: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    calendlyApi: "https://auth.calendly.com/oauth/token",
    hubspotOAuth2Api: "https://api.hubapi.com/oauth/v1/token",
    mailchimpOAuth2Api: "https://login.mailchimp.com/oauth2/token",
    facebookOAuth2Api: "https://graph.facebook.com/v18.0/oauth/access_token",
    stripeApi: "https://connect.stripe.com/oauth/token",
    twilioApi: "https://api.twilio.com/2010-04-01/oauth2/token",
    typeformApi: "https://api.typeform.com/oauth/token",
    shopifyApi: "https://shopify-dynamic.myshopify.com/admin/oauth/access_token",
  };

  return urls[credentialType] || "";
}

function getRedirectUri(): string {
  // In production, this should be your actual domain
  const baseUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";
  return `${baseUrl}/oauth/callback`;
}
