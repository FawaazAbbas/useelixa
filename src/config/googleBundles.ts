/**
 * Google OAuth Bundle Configuration
 * Each bundle represents a distinct set of Google APIs with specific OAuth scopes
 * Users can connect multiple Google accounts per bundle
 */

export interface GoogleBundle {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  scopes: string[];
}

export const GOOGLE_BUNDLES: Record<string, GoogleBundle> = {
  email_workspace: {
    id: 'email_workspace',
    name: 'Email & Workspace',
    description: 'Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Apps Script',
    icon: '📧',
    color: 'bg-blue-500',
    scopes: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/forms.body',
      'https://www.googleapis.com/auth/forms.body.readonly',
      'https://www.googleapis.com/auth/script.projects',
    ],
  },
  ads_marketing: {
    id: 'ads_marketing',
    name: 'Ads & Marketing',
    description: 'Google Ads, Campaign Manager, Search Ads, AdSense, AdMob, Shopping',
    icon: '📢',
    color: 'bg-green-500',
    scopes: [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/dfatrafficking',
      'https://www.googleapis.com/auth/doubleclicksearch',
      'https://www.googleapis.com/auth/adsense',
      'https://www.googleapis.com/auth/adsense.readonly',
      'https://www.googleapis.com/auth/admob.readonly',
      'https://www.googleapis.com/auth/admob.report',
      'https://www.googleapis.com/auth/content',
    ],
  },
  analytics_reporting: {
    id: 'analytics_reporting',
    name: 'Analytics & Reporting',
    description: 'GA4, Analytics, YouTube Analytics, Search Console, PageSpeed',
    icon: '📊',
    color: 'bg-purple-500',
    scopes: [
      'https://www.googleapis.com/auth/analytics',
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtubepartner',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/pagespeedonline',
    ],
  },
  cloud_data: {
    id: 'cloud_data',
    name: 'Cloud & Data Engineering',
    description: 'BigQuery, Cloud Storage, Cloud SQL, Datastore, Logging, Monitoring',
    icon: '☁️',
    color: 'bg-orange-500',
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/cloud-platform.read-only',
      'https://www.googleapis.com/auth/devstorage.read_write',
      'https://www.googleapis.com/auth/devstorage.full_control',
      'https://www.googleapis.com/auth/bigquery',
      'https://www.googleapis.com/auth/bigquery.readonly',
      'https://www.googleapis.com/auth/datastore',
      'https://www.googleapis.com/auth/logging.read',
      'https://www.googleapis.com/auth/logging.write',
      'https://www.googleapis.com/auth/monitoring',
      'https://www.googleapis.com/auth/monitoring.read',
      'https://www.googleapis.com/auth/trace.append',
    ],
  },
  firebase_app: {
    id: 'firebase_app',
    name: 'Firebase & App Infrastructure',
    description: 'Firebase Hosting, Remote Config, Management, Installations, Projects',
    icon: '🔥',
    color: 'bg-yellow-500',
    scopes: [
      'https://www.googleapis.com/auth/firebase',
      'https://www.googleapis.com/auth/firebase.readonly',
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/cloudplatformprojects',
      'https://www.googleapis.com/auth/cloudplatformprojects.readonly',
    ],
  },
  android_play: {
    id: 'android_play',
    name: 'Android & Play Services',
    description: 'Android Management, Play Developer, Play Games, Play Integrity',
    icon: '🤖',
    color: 'bg-green-600',
    scopes: [
      'https://www.googleapis.com/auth/androidmanagement',
      'https://www.googleapis.com/auth/androidpublisher',
      'https://www.googleapis.com/auth/androidpublisher.readonly',
      'https://www.googleapis.com/auth/games',
      'https://www.googleapis.com/auth/playintegrity',
      'https://www.googleapis.com/auth/playdeveloperreporting',
    ],
  },
};

// Helper function to get bundle by ID
export function getGoogleBundle(bundleId: string): GoogleBundle | undefined {
  return GOOGLE_BUNDLES[bundleId];
}

// Get all scopes for a bundle including base scopes
export function getBundleScopes(bundleId: string): string[] {
  const bundle = GOOGLE_BUNDLES[bundleId];
  if (!bundle) return [];
  
  // Always include openid and email to identify the account
  const baseScopes = ['openid', 'email', 'profile'];
  return [...baseScopes, ...bundle.scopes];
}

// Find which bundle(s) contain the required scopes
export function findBundlesForScopes(requiredScopes: string[]): GoogleBundle[] {
  return Object.values(GOOGLE_BUNDLES).filter(bundle =>
    requiredScopes.every(scope => bundle.scopes.includes(scope))
  );
}
