/**
 * OAuth Client IDs for third-party integrations
 * These are public client IDs and safe to commit to version control
 * For Google, use the environment variable to ensure frontend and backend use the same Client ID
 */

export const OAUTH_CLIENT_IDS = {
  GOOGLE: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  NOTION: import.meta.env.VITE_NOTION_CLIENT_ID || '2bad872b-594c-8087-a5e1-00374ca27750',
  SLACK: '8186913077078.8224803663382',
  MICROSOFT: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '9ebd49b8-d209-4881-94f6-ad7d587b9962',
  CALENDLY: import.meta.env.VITE_CALENDLY_CLIENT_ID || 'Nnj-dmLFXc9lRSx6m7I5g2xEv33H4AEUCeQJA6rW-fI',
  MAILCHIMP: import.meta.env.VITE_MAILCHIMP_CLIENT_ID || '334313964170',
  SHOPIFY: import.meta.env.VITE_SHOPIFY_CLIENT_ID || '44ad1408b7b236bb6dfe4d8ee9efff5d',
  META: 'your-meta-client-id',
  TWILIO: 'your-twilio-client-id',
  TYPEFORM: 'your-typeform-client-id',
} as const;

const REDIRECT_URI = `${window.location.origin}/oauth/callback`;

/**
 * Get OAuth URL for a provider
 */
export function getOAuthUrl(provider: string, bundleType?: string): string | null {
  const state = JSON.stringify({ 
    provider, 
    bundleType,
    returnTo: window.location.pathname 
  });
  const encodedState = encodeURIComponent(btoa(state));

  switch (provider) {
    case 'google': {
      if (!OAUTH_CLIENT_IDS.GOOGLE) {
        // If this happens, the frontend environment variable isn't injected into the build.
        // Returning null lets the caller show a friendly error.
        console.error('[OAuth] Missing VITE_GOOGLE_CLIENT_ID (OAUTH_CLIENT_IDS.GOOGLE is empty)');
        return null;
      }
      const scopes = getGoogleScopes(bundleType);
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(OAUTH_CLIENT_IDS.GOOGLE)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodedState}`;
    }
    case 'microsoft': {
      const scopes = getMicrosoftScopes(bundleType);
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${OAUTH_CLIENT_IDS.MICROSOFT}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}&state=${encodedState}`;
    }
    case 'notion':
      return `https://api.notion.com/v1/oauth/authorize?client_id=${OAUTH_CLIENT_IDS.NOTION}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&owner=user&state=${encodedState}`;
    case 'slack':
      return `https://slack.com/oauth/v2/authorize?client_id=${OAUTH_CLIENT_IDS.SLACK}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=channels:read,chat:write,users:read&state=${encodedState}`;
    case 'calendly':
      return `https://auth.calendly.com/oauth/authorize?client_id=${OAUTH_CLIENT_IDS.CALENDLY}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${encodedState}`;
    case 'mailchimp':
      return `https://login.mailchimp.com/oauth2/authorize?client_id=${OAUTH_CLIENT_IDS.MAILCHIMP}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${encodedState}`;
    case 'shopify':
      // Shopify requires a shop domain - would need additional UI
      return null;
    default:
      return null;
  }
}

function getGoogleScopes(bundleType?: string): string {
  const baseScopes = 'openid email profile';
  
  switch (bundleType) {
    case 'email_workspace':
      return `${baseScopes} https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive`;
    case 'ads_marketing':
      return `${baseScopes} https://www.googleapis.com/auth/adwords`;
    case 'analytics_reporting':
      return `${baseScopes} https://www.googleapis.com/auth/analytics.readonly`;
    case 'cloud_data':
      return `${baseScopes} https://www.googleapis.com/auth/bigquery`;
    case 'firebase_infra':
      return `${baseScopes} https://www.googleapis.com/auth/firebase`;
    case 'android_play':
      return `${baseScopes} https://www.googleapis.com/auth/androidpublisher`;
    default:
      return baseScopes;
  }
}

function getMicrosoftScopes(bundleType?: string): string {
  const baseScopes = 'openid email profile offline_access';
  
  switch (bundleType) {
    case 'email_calendar':
      return `${baseScopes} Mail.Read Mail.Send Calendars.ReadWrite`;
    case 'files':
      return `${baseScopes} Files.Read Files.ReadWrite`;
    case 'full':
      return `${baseScopes} Mail.Read Mail.Send Calendars.ReadWrite Files.Read Files.ReadWrite User.Read`;
    default:
      return `${baseScopes} Mail.Read Mail.Send Calendars.ReadWrite Files.Read User.Read`;
  }
}
