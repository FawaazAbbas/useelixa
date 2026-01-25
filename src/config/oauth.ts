/**
 * OAuth Client IDs for third-party integrations
 * These are public client IDs and safe to commit to version control
 */

export const OAUTH_CLIENT_IDS = {
  GOOGLE: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  NOTION: import.meta.env.VITE_NOTION_CLIENT_ID || "2bad872b-594c-8087-a5e1-00374ca27750",
  SLACK: "8186913077078.8224803663382",
  MICROSOFT: import.meta.env.VITE_MICROSOFT_CLIENT_ID || "9ebd49b8-d209-4881-94f6-ad7d587b9962",
  CALENDLY: import.meta.env.VITE_CALENDLY_CLIENT_ID || "Nnj-dmLFXc9lRSx6m7I5g2xEv33H4AEUCeQJA6rW-fI",
  MAILCHIMP: import.meta.env.VITE_MAILCHIMP_CLIENT_ID || "334313964170",
  SHOPIFY: import.meta.env.VITE_SHOPIFY_CLIENT_ID || "",
  META: "your-meta-client-id",
  TWILIO: "your-twilio-client-id",
  TYPEFORM: "your-typeform-client-id",
} as const;

// IMPORTANT:
// The redirect URI used in the initial authorization request MUST exactly match the
// redirect URI used during token exchange on the backend.
// Our backend constructs the redirect URI from the canonical SITE_URL.
// Using window.location.origin here breaks OAuth when running on preview domains.
const CANONICAL_SITE_URL = "https://workspace.elixa.app";
const REDIRECT_URI = `${CANONICAL_SITE_URL}/oauth/callback`;

/**
 * Generate PKCE code verifier and challenge for OAuth flows that require it
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Get OAuth URL for a provider
 */
export async function getOAuthUrl(provider: string, bundleType?: string): Promise<string | null> {
  const state = JSON.stringify({
    provider,
    bundleType,
    returnTo: window.location.pathname,
  });
  const encodedState = encodeURIComponent(btoa(state));

  switch (provider) {
    case "google": {
      const clientId = OAUTH_CLIENT_IDS.GOOGLE;
      if (!clientId) {
        console.error("Google OAuth Client ID not configured. Set VITE_GOOGLE_CLIENT_ID environment variable.");
        return null;
      }
      const scopes = getGoogleScopes(bundleType);
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodedState}`;
    }
    case "microsoft": {
      const scopes = getMicrosoftScopes(bundleType);
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${OAUTH_CLIENT_IDS.MICROSOFT}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${encodedState}`;
    }
    case "notion":
      return `https://api.notion.com/v1/oauth/authorize?client_id=${OAUTH_CLIENT_IDS.NOTION}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&owner=user&state=${encodedState}`;
    case "slack":
      return `https://slack.com/oauth/v2/authorize?client_id=${OAUTH_CLIENT_IDS.SLACK}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=channels:read,chat:write,users:read&state=${encodedState}`;
    case "calendly": {
      const clientId = OAUTH_CLIENT_IDS.CALENDLY;
      if (!clientId) {
        console.error("Calendly OAuth Client ID not configured. Set VITE_CALENDLY_CLIENT_ID environment variable.");
        return null;
      }
      // Calendly requires PKCE
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      // Store verifier in sessionStorage for token exchange
      sessionStorage.setItem('calendly_code_verifier', codeVerifier);
      return `https://auth.calendly.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256&state=${encodedState}`;
    }
    case "mailchimp":
      return `https://login.mailchimp.com/oauth2/authorize?client_id=${OAUTH_CLIENT_IDS.MAILCHIMP}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${encodedState}`;
    case "shopify":
      // Shopify requires a shop domain - handled by ShopifyConnectDialog
      // This returns null because Shopify OAuth needs shop-specific URLs
      return null;
    default:
      return null;
  }
}

/**
 * Get the stored PKCE code verifier for a provider
 */
export function getCodeVerifier(provider: string): string | null {
  if (provider === "calendly") {
    const verifier = sessionStorage.getItem('calendly_code_verifier');
    // Clear after retrieval (one-time use)
    sessionStorage.removeItem('calendly_code_verifier');
    return verifier;
  }
  return null;
}

function getGoogleScopes(bundleType?: string): string {
  const baseScopes = "openid email profile";

  switch (bundleType) {
    case "gmail":
      return `${baseScopes} https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send`;
    case "google_calendar":
      return `${baseScopes} https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events`;
    case "google_ads":
      return `${baseScopes} https://www.googleapis.com/auth/adwords`;
    case "google_analytics":
      return `${baseScopes} https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.edit`;
    case "google_sheets":
      return `${baseScopes} https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly`;
    case "youtube":
      return `${baseScopes} https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/yt-analytics-monetary.readonly`;
    case "tag_manager":
      return `${baseScopes} https://www.googleapis.com/auth/tagmanager.readonly https://www.googleapis.com/auth/tagmanager.edit.containers https://www.googleapis.com/auth/tagmanager.publish`;
    case "places":
      return `${baseScopes} https://www.googleapis.com/auth/cloud-platform`;
    default:
      return baseScopes;
  }
}

function getMicrosoftScopes(bundleType?: string): string {
  const baseScopes = "openid email profile offline_access";

  switch (bundleType) {
    case "outlook":
      return `${baseScopes} Mail.Read Mail.Send User.Read`;
    case "teams":
      return `${baseScopes} Calendars.ReadWrite User.Read`;
    case "onedrive":
      return `${baseScopes} Files.Read Files.ReadWrite User.Read`;
    default:
      return baseScopes;
  }
}
