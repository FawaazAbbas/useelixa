import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encryptToken, isEncryptionAvailable } from "../_shared/crypto.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, credentialType, userId, bundleType, scopes, correlationId, codeVerifier } = await req.json();

    // Use client-provided correlation ID or generate one server-side
    const corrId = correlationId || `srv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

    if (!code || !credentialType || !userId) {
      console.error(`[${corrId}] Missing parameters:`, { code: !!code, credentialType, userId: !!userId });
      throw new Error("Missing required parameters");
    }

    console.log(`[${corrId}] 🔐 Exchanging OAuth code for ${credentialType}`, { 
      userId,
      bundleType: bundleType || 'null',
      scopes: scopes || 'null',
      codePrefix: code?.slice(0, 10),
      redirectUri: getRedirectUri(),
      siteUrl: Deno.env.get("SITE_URL")
    });

    // Get OAuth configuration based on credential type
    const tokenUrl = getTokenUrl(credentialType);
    const secretNames = getSecretNames(credentialType);
    // Defensive: secrets often get copied with trailing newlines/spaces.
    // That will make Google return `unauthorized_client` even though values "look" correct.
    const clientId = Deno.env.get(secretNames.clientIdKey)?.trim();
    const clientSecret = Deno.env.get(secretNames.clientSecretKey)?.trim();

    if (!clientId || !clientSecret) {
      console.error(`[${corrId}] Missing OAuth config for ${credentialType}:`, { 
        hasClientId: !!clientId, 
        hasClientSecret: !!clientSecret 
      });
      throw new Error(`OAuth credentials not configured for ${credentialType}`);
    }

    // Safe diagnostics (do NOT log secrets): detect hidden whitespace / formatting issues
    const rawClientId = Deno.env.get(secretNames.clientIdKey);
    const rawClientSecret = Deno.env.get(secretNames.clientSecretKey);
    const hasClientIdWhitespace = rawClientId ? rawClientId !== rawClientId.trim() : false;
    const hasClientSecretWhitespace = rawClientSecret ? rawClientSecret !== rawClientSecret.trim() : false;
    if (hasClientIdWhitespace || hasClientSecretWhitespace) {
      console.warn(`[${corrId}] ⚠️ OAuth secrets contain leading/trailing whitespace`, {
        credentialType,
        hasClientIdWhitespace,
        hasClientSecretWhitespace,
      });
    }
    
    console.log(`[${corrId}] ✓ OAuth config found for ${credentialType}`);

    // Exchange authorization code for access token
    let tokenResponse;
    
    if (credentialType === "notionApi") {
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
    } else if (credentialType === "googleOAuth2Api") {
      // Google uses form-urlencoded
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
      // Calendly requires PKCE
      if (!codeVerifier) {
        console.error(`[${corrId}] Missing code_verifier for Calendly PKCE flow`);
        throw new Error("Missing code_verifier for Calendly - PKCE is required");
      }
      
      const params = new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: getRedirectUri(),
        grant_type: "authorization_code",
        code_verifier: codeVerifier,
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
      const providerStatus = tokenResponse.status;
      const providerText = await tokenResponse.text();
      let providerBody: unknown = providerText;

      try {
        providerBody = JSON.parse(providerText);
      } catch {
        // Keep raw text if not JSON
      }

      console.error(`[${corrId}] ❌ Token exchange failed (${providerStatus}):`, providerText);

      return new Response(
        JSON.stringify({
          success: false,
          correlationId: corrId,
          stage: "token_exchange",
          credentialType,
          provider_status: providerStatus,
          provider_body: providerBody,
          redirect_uri: getRedirectUri(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    console.log(`[${corrId}] ✓ Token exchange successful`);

    const tokens = await tokenResponse.json();

    let accountEmail = null;
    let actualGrantedScopes = scopes;
    
    // For Google, fetch user info to get email
    if (credentialType === "googleOAuth2Api" && tokens.access_token) {
      try {
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          accountEmail = userInfo.email;
          console.log(`[${corrId}] ✓ Google user email: ${accountEmail}`);
        }
      } catch (e) {
        console.warn(`[${corrId}] Failed to fetch Google user info:`, e);
      }
    }
    
    console.log(`[${corrId}] 📝 Credential storage data:`, { 
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

    // Encrypt tokens if encryption is available
    let accessTokenToStore = tokens.access_token;
    let refreshTokenToStore = tokens.refresh_token;
    let isEncrypted = false;
    let encryptedAccessToken = null;
    let encryptedRefreshToken = null;

    if (isEncryptionAvailable()) {
      try {
        encryptedAccessToken = await encryptToken(tokens.access_token);
        if (tokens.refresh_token) {
          encryptedRefreshToken = await encryptToken(tokens.refresh_token);
        }
        isEncrypted = true;
        accessTokenToStore = null;
        refreshTokenToStore = null;
        console.log(`[${corrId}] ✓ Tokens encrypted successfully`);
      } catch (encryptError) {
        console.error(`[${corrId}] ⚠️ Encryption failed, storing plaintext:`, encryptError);
      }
    } else {
      console.warn(`[${corrId}] ⚠️ Encryption not available, storing tokens in plaintext`);
    }

    const credentialData = {
      user_id: userId,
      credential_type: credentialType,
      bundle_type: bundleType || null,
      account_email: accountEmail || null,
      account_label: accountEmail || null,
      scopes: actualGrantedScopes ? actualGrantedScopes.split(' ') : null,
      access_token: accessTokenToStore,
      refresh_token: refreshTokenToStore,
      encrypted_access_token: encryptedAccessToken,
      encrypted_refresh_token: encryptedRefreshToken,
      is_encrypted: isEncrypted,
      expires_at: tokens.expires_in 
        ? new Date(Date.now() + tokens.expires_in * 1000).toISOString()
        : null,
      token_type: tokens.token_type || "Bearer",
    };

    console.log(`[${corrId}] 🔍 Checking for existing credential...`);
    
    const query = supabaseClient
      .from('user_credentials')
      .select('id')
      .eq('user_id', userId)
      .eq('credential_type', credentialType);
    
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
      console.log(`[${corrId}] 📝 Updating existing credential (id: ${existing.id})...`);
      const { error: updateError } = await supabaseClient
        .from("user_credentials")
        .update(credentialData)
        .eq('id', existing.id);

      if (updateError) {
        console.error(`[${corrId}] ❌ Error updating credentials:`, updateError);
        throw updateError;
      }
      console.log(`[${corrId}] ✅ Updated ${credentialType} credential${bundleType ? ` (bundle: ${bundleType})` : ''}${accountEmail ? ` for ${accountEmail}` : ''}`);
    } else {
      console.log(`[${corrId}] 📝 Inserting new credential...`);
      const { error: insertError } = await supabaseClient
        .from("user_credentials")
        .insert(credentialData);

      if (insertError) {
        console.error(`[${corrId}] ❌ Error inserting credentials:`, insertError);
        throw insertError;
      }
      console.log(`[${corrId}] ✅ Inserted new ${credentialType} credential${bundleType ? ` (bundle: ${bundleType})` : ''}${accountEmail ? ` for ${accountEmail}` : ''}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        correlationId: corrId,
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
        stage: "internal_error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getTokenUrl(credentialType: string): string {
  const urls: Record<string, string> = {
    googleOAuth2Api: "https://oauth2.googleapis.com/token",
    notionApi: "https://api.notion.com/v1/oauth/token",
    slackOAuth2Api: "https://slack.com/api/oauth.v2.access",
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
  const baseUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";
  return `${baseUrl}/oauth/callback`;
}
