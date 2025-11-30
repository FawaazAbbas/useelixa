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
    const { userId, credentialType, credentialId, bundleType, accountEmail } = await req.json();

    if (!userId || !credentialType) {
      throw new Error("Missing required parameters");
    }

    console.log(`Refreshing token for ${credentialType}`, { credentialId, bundleType, accountEmail });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get existing credentials with refresh_token
    let query = supabaseClient
      .from("user_credentials")
      .select("*")
      .eq("user_id", userId)
      .eq("credential_type", credentialType);

    // If credentialId is provided, use it for precise lookup
    if (credentialId) {
      query = query.eq("id", credentialId);
    } else if (bundleType && accountEmail) {
      // For Google bundles, match by bundle and account
      query = query.eq("bundle_type", bundleType).eq("account_email", accountEmail);
    }

    const { data: creds, error: fetchError } = await query.maybeSingle();

    if (fetchError || !creds || !creds.refresh_token) {
      throw new Error("No refresh token found. Please reconnect your account.");
    }

    // Get OAuth configuration
    const tokenUrl = getTokenUrl(credentialType);
    const secretNames = getSecretNames(credentialType);
    const clientId = Deno.env.get(secretNames.clientIdKey);
    const clientSecret = Deno.env.get(secretNames.clientSecretKey);

    if (!clientId || !clientSecret) {
      throw new Error(`OAuth credentials not configured for ${credentialType}`);
    }

    // Refresh the token
    let tokenResponse;
    
    if (credentialType === "googleOAuth2Api") {
      // Google uses form-urlencoded
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: creds.refresh_token,
        grant_type: "refresh_token",
      });

      tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
    } else if (credentialType === "notionApi") {
      // Notion uses Basic Auth
      const basicAuth = btoa(`${clientId}:${clientSecret}`);
      tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh_token: creds.refresh_token,
          grant_type: "refresh_token",
        }),
      });
    } else if (credentialType === "microsoftOAuth2Api") {
      // Microsoft uses form-urlencoded
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: creds.refresh_token,
        grant_type: "refresh_token",
      });

      tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
    } else if (credentialType === "mailchimpOAuth2Api") {
      // Mailchimp uses Basic Auth with form-urlencoded
      const basicAuth = btoa(`user:${clientSecret}`);
      tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: clientId,
          refresh_token: creds.refresh_token,
          grant_type: "refresh_token",
        }).toString(),
      });
    } else if (credentialType === "calendlyApi") {
      // Calendly uses form-urlencoded
      const params = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: creds.refresh_token,
        grant_type: "refresh_token",
      });

      tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
    } else {
      // Default: JSON for other providers
      tokenResponse = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: creds.refresh_token,
          grant_type: "refresh_token",
        }),
      });
    }

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Token refresh failed:", errorText);
      throw new Error(`Token refresh failed: ${errorText}`);
    }

    const tokens = await tokenResponse.json();

    // Update credentials with new access token
    let updateQuery = supabaseClient
      .from("user_credentials")
      .update({
        access_token: tokens.access_token,
        expires_at: tokens.expires_in 
          ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("credential_type", credentialType);

    if (credentialId) {
      updateQuery = updateQuery.eq("id", credentialId);
    } else if (bundleType && accountEmail) {
      updateQuery = updateQuery.eq("bundle_type", bundleType).eq("account_email", accountEmail);
    }

    const { error: updateError } = await updateQuery;

    if (updateError) {
      console.error("Error updating credentials:", updateError);
      throw updateError;
    }

    console.log(`✅ Successfully refreshed ${credentialType} token`);

    return new Response(
      JSON.stringify({
        success: true,
        access_token: tokens.access_token,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Token refresh error:", error);
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

function getSecretNames(credentialType: string): { clientIdKey: string; clientSecretKey: string } {
  const mappings: Record<string, { clientIdKey: string; clientSecretKey: string }> = {
    googleOAuth2Api: { clientIdKey: 'GOOGLEOAUTH2API_CLIENT_ID', clientSecretKey: 'GOOGLEOAUTH2API_CLIENT_SECRET' },
    notionApi: { clientIdKey: 'NOTION_OAUTH_CLIENT_ID', clientSecretKey: 'NOTION_OAUTH_CLIENT_SECRET' },
    microsoftOAuth2Api: { clientIdKey: 'MICROSOFT_OAUTH_APPLICATION_ID', clientSecretKey: 'MICROSOFT_OAUTH_CLIENT_SECRET' },
    calendlyApi: { clientIdKey: 'CALENDLY_OAUTH_CLIENT_ID', clientSecretKey: 'CALENDLY_OAUTH_CLIENT_SECRET' },
    mailchimpOAuth2Api: { clientIdKey: 'MAILCHIMP_OAUTH_CLIENT_ID', clientSecretKey: 'MAILCHIMP_OAUTH_CLIENT_SECRET' },
    shopifyApi: { clientIdKey: 'SHOPIFY_OAUTH_CLIENT_ID', clientSecretKey: 'SHOPIFY_OAUTH_CLIENT_SECRET' },
  };
  
  return mappings[credentialType] || { 
    clientIdKey: `${credentialType.toUpperCase()}_CLIENT_ID`,
    clientSecretKey: `${credentialType.toUpperCase()}_CLIENT_SECRET`
  };
}

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
