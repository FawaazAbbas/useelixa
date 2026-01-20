/**
 * OAuth Client IDs for third-party integrations
 * These are public client IDs and safe to commit to version control
 */

export const OAUTH_CLIENT_IDS = {
  GOOGLE: '983139658776-0arasasoa08a2ggpvgfso1g2fgeqjkeu.apps.googleusercontent.com',
  NOTION: '2bad872b-594c-8087-a5e1-00374ca27750',
  SLACK: '8186913077078.8224803663382',
  MICROSOFT: '9ebd49b8-d209-4881-94f6-ad7d587b9962',
  CALENDLY: 'Nnj-dmLFXc9lRSx6m7I5g2xEv33H4AEUCeQJA6rW-fI',
  MAILCHIMP: '334313964170',
  SHOPIFY: '44ad1408b7b236bb6dfe4d8ee9efff5d',
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
      const scopes = getGoogleScopes(bundleType);
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${OAUTH_CLIENT_IDS.GOOGLE}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodedState}`;
    }
    case 'notion':
      return `https://api.notion.com/v1/oauth/authorize?client_id=${OAUTH_CLIENT_IDS.NOTION}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&owner=user&state=${encodedState}`;
    case 'slack':
      return `https://slack.com/oauth/v2/authorize?client_id=${OAUTH_CLIENT_IDS.SLACK}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=channels:read,chat:write,users:read&state=${encodedState}`;
    case 'microsoft':
      return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${OAUTH_CLIENT_IDS.MICROSOFT}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent('openid profile email offline_access https://graph.microsoft.com/.default')}&state=${encodedState}`;
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
