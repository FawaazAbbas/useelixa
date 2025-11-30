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
    const { code, credentialType, userId, bundleType, scopes } = await req.json();

    if (!code || !credentialType || !userId) {
      console.error("Missing parameters:", { code: !!code, credentialType, userId: !!userId });
      throw new Error("Missing required parameters");
    }

    console.log(`🔐 Exchanging OAuth code for ${credentialType}`, { 
      userId,
      bundleType: bundleType || 'null',
      scopes: scopes || 'null',
      redirectUri: getRedirectUri(),
      siteUrl: Deno.env.get("SITE_URL")
    });

    // Get OAuth configuration based on credential type
    const tokenUrl = getTokenUrl(credentialType);
    const secretNames = getSecretNames(credentialType);
    const clientId = Deno.env.get(secretNames.clientIdKey);
    const clientSecret = Deno.env.get(secretNames.clientSecretKey);

    if (!clientId || !clientSecret) {
      console.error(`Missing OAuth config for ${credentialType}:`, { 
        hasClientId: !!clientId, 
        hasClientSecret: !!clientSecret 
      });
      throw new Error(`OAuth credentials not configured for ${credentialType}`);
    }
    
    console.log(`✓ OAuth config found for ${credentialType}`);

    // Exchange authorization code for access token
    let tokenResponse;
    
    if (credentialType === "googleOAuth2Api") {
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
          code,
          redirect_uri: getRedirectUri(),
          grant_type: "authorization_code",
        }),
      });
    } else if (credentialType === "microsoftOAuth2Api") {
      // Microsoft requires form-urlencoded
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
          code,
          client_id: clientId,
          redirect_uri: getRedirectUri(),
          grant_type: "authorization_code",
        }).toString(),
      });
    } else if (credentialType === "calendlyApi") {
      // Calendly uses form-urlencoded
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
      // Default: JSON for other providers
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

    // For Google OAuth, fetch user email and use ACTUAL GRANTED SCOPES from token response
    let accountEmail = null;
    let actualGrantedScopes = scopes; // Default to requested scopes
    
    if (credentialType === "googleOAuth2Api") {
      // CRITICAL: Use the scopes that Google ACTUALLY GRANTED, not what we requested
      if (tokens.scope) {
        actualGrantedScopes = tokens.scope; // Google returns space-separated string
        console.log(`✓ Google granted scopes: ${actualGrantedScopes}`);
        
        // Warn if granted scopes differ from requested
        if (scopes && actualGrantedScopes !== scopes) {
          console.warn(`⚠️ Scope mismatch! Requested: ${scopes.split(' ').length} scopes, Granted: ${actualGrantedScopes.split(' ').length} scopes`);
          console.warn(`   Requested but NOT granted: ${scopes.split(' ').filter((s: string) => !actualGrantedScopes.includes(s)).join(', ')}`);
        }
      }
      
      try {
        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v2/userinfo',
          { headers: { 'Authorization': `Bearer ${tokens.access_token}` }}
        );
        const userInfo = await userInfoResponse.json();
        accountEmail = userInfo.email;
        console.log(`✓ Fetched Google account email: ${accountEmail}`);
      } catch (emailError) {
        console.error("⚠️ Failed to fetch account email:", emailError);
        // Continue without email - we'll handle it below
      }
    }
    
    console.log(`📝 Credential storage data:`, { 
      credentialType, 
      bundleType: bundleType || 'null', 
      accountEmail: accountEmail || 'null',
      hasRefreshToken: !!tokens.refresh_token,
      scopeCount: actualGrantedScopes ? actualGrantedScopes.split(' ').length : 0
    });

    // Store tokens in user_credentials table
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Prepare credential data with ACTUAL GRANTED SCOPES
    const credentialData = {
      user_id: userId,
      credential_type: credentialType,
      bundle_type: bundleType || null,
      account_email: accountEmail || null,
      account_label: accountEmail || null,
      scopes: actualGrantedScopes ? actualGrantedScopes.split(' ') : null, // Use actual granted scopes!
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      token_type: tokens.token_type || "Bearer",
    };

    // Use select-then-insert/update pattern for all credential types
    console.log(`🔍 Checking for existing credential...`);
    
    const query = supabaseClient
      .from('user_credentials')
      .select('id')
      .eq('user_id', userId)
      .eq('credential_type', credentialType);
    
    // Add filters for bundle_type and account_email based on what we have
    if (bundleType) {
      query.eq('bundle_type', bundleType);
    } else {
      query.is('bundle_type', null);
    }
    
    if (accountEmail) {
      query.eq('account_email', accountEmail);
    } else {
      query.is('account_email', null);
    }
    
    const { data: existing } = await query.maybeSingle();

    if (existing) {
      // UPDATE existing credential
      console.log(`📝 Updating existing credential (id: ${existing.id})...`);
      const { error: updateError } = await supabaseClient
        .from("user_credentials")
        .update(credentialData)
        .eq('id', existing.id);

      if (updateError) {
        console.error("❌ Error updating credentials:", updateError);
        throw updateError;
      }
      console.log(`✅ Updated ${credentialType} credential${bundleType ? ` (bundle: ${bundleType})` : ''}${accountEmail ? ` for ${accountEmail}` : ''}`);
    } else {
      // INSERT new credential
      console.log(`📝 Inserting new credential...`);
      const { error: insertError } = await supabaseClient
        .from("user_credentials")
        .insert(credentialData);

      if (insertError) {
        console.error("❌ Error inserting credentials:", insertError);
        throw insertError;
      }
      console.log(`✅ Inserted new ${credentialType} credential${bundleType ? ` (bundle: ${bundleType})` : ''}${accountEmail ? ` for ${accountEmail}` : ''}`);
    }

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

function getSecretNames(credentialType: string): { clientIdKey: string; clientSecretKey: string } {
  const mappings: Record<string, { clientIdKey: string; clientSecretKey: string }> = {
    googleOAuth2Api: { clientIdKey: 'GOOGLEOAUTH2API_CLIENT_ID', clientSecretKey: 'GOOGLEOAUTH2API_CLIENT_SECRET' },
    notionApi: { clientIdKey: 'NOTION_OAUTH_CLIENT_ID', clientSecretKey: 'NOTION_OAUTH_CLIENT_SECRET' },
    microsoftOAuth2Api: { clientIdKey: 'MICROSOFT_OAUTH_APPLICATION_ID', clientSecretKey: 'MICROSOFT_OAUTH_CLIENT_SECRET' },
    calendlyApi: { clientIdKey: 'CALENDLY_OAUTH_CLIENT_ID', clientSecretKey: 'CALENDLY_OAUTH_CLIENT_SECRET' },
    mailchimpOAuth2Api: { clientIdKey: 'MAILCHIMP_OAUTH_CLIENT_ID', clientSecretKey: 'MAILCHIMP_OAUTH_CLIENT_SECRET' },
    shopifyApi: { clientIdKey: 'SHOPIFY_OAUTH_CLIENT_ID', clientSecretKey: 'SHOPIFY_OAUTH_CLIENT_SECRET' },
    slackOAuth2Api: { clientIdKey: 'SLACK_OAUTH_CLIENT_ID', clientSecretKey: 'SLACK_OAUTH_CLIENT_SECRET' },
    facebookOAuth2Api: { clientIdKey: 'META_OAUTH_CLIENT_ID', clientSecretKey: 'META_OAUTH_CLIENT_SECRET' },
    twilioApi: { clientIdKey: 'TWILIO_OAUTH_CLIENT_ID', clientSecretKey: 'TWILIO_OAUTH_CLIENT_SECRET' },
    typeformApi: { clientIdKey: 'TYPEFORM_OAUTH_CLIENT_ID', clientSecretKey: 'TYPEFORM_OAUTH_CLIENT_SECRET' },
  };
  
  return mappings[credentialType] || { 
    clientIdKey: `${credentialType.toUpperCase()}_CLIENT_ID`,
    clientSecretKey: `${credentialType.toUpperCase()}_CLIENT_SECRET`
  };
}

function getRedirectUri(): string {
  // In production, this should be your actual domain
  const baseUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";
  return `${baseUrl}/oauth/callback`;
}
