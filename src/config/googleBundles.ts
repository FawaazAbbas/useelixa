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
  logo: string;
  companyName: string;
  serviceName: string;
  scopes: string[];
}

export const GOOGLE_BUNDLES: Record<string, GoogleBundle> = {
  email_workspace: {
    id: 'email_workspace',
    name: 'Email & Workspace',
    description: 'Gmail, Calendar, Drive, Docs, Sheets, Slides, Forms, Apps Script',
    icon: '📧',
    color: 'bg-blue-500',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg',
    companyName: 'Google',
    serviceName: 'Email & Workspace',
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
    description: 'Google Ads, AdSense, AdMob, Merchant Center (Shopping)',
    icon: '📢',
    color: 'bg-green-500',
    logo: 'https://www.gstatic.com/images/branding/product/1x/google_ads_512dp.png',
    companyName: 'Google',
    serviceName: 'Ads & Marketing',
    scopes: [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/adsense.readonly',
      'https://www.googleapis.com/auth/admob.readonly',
      'https://www.googleapis.com/auth/content',
    ],
  },
  analytics_reporting: {
    id: 'analytics_reporting',
    name: 'Analytics & Reporting',
    description: 'Google Analytics, YouTube Analytics (read-only), Search Console',
    icon: '📊',
    color: 'bg-purple-500',
    logo: 'https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg',
    companyName: 'Google',
    serviceName: 'Analytics & Reporting',
    scopes: [
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/webmasters.readonly',
    ],
  },
  cloud_data: {
    id: 'cloud_data',
    name: 'Cloud & Data Engineering',
    description: 'BigQuery (read-only), Cloud Storage, Datastore, Logging, Monitoring (read-only)',
    icon: '☁️',
    color: 'bg-orange-500',
    logo: 'https://www.gstatic.com/images/branding/product/1x/google_cloud_512dp.png',
    companyName: 'Google',
    serviceName: 'Cloud & Data',
    scopes: [
      'https://www.googleapis.com/auth/devstorage.read_write',
      'https://www.googleapis.com/auth/bigquery.readonly',
      'https://www.googleapis.com/auth/datastore',
      'https://www.googleapis.com/auth/logging.read',
      'https://www.googleapis.com/auth/monitoring.read',
    ],
  },
  firebase_app: {
    id: 'firebase_app',
    name: 'Firebase & App Infrastructure',
    description: 'Firebase (read-only access)',
    icon: '🔥',
    color: 'bg-yellow-500',
    logo: 'https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/2x/firebase_96dp.png',
    companyName: 'Google',
    serviceName: 'Firebase & Apps',
    scopes: [
      'https://www.googleapis.com/auth/firebase.readonly',
    ],
  },
  android_play: {
    id: 'android_play',
    name: 'Android & Play Services',
    description: 'Play Games, Play Developer Reporting',
    icon: '🤖',
    color: 'bg-green-600',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d7/Android_robot.svg',
    companyName: 'Google',
    serviceName: 'Android & Play',
    scopes: [
      'https://www.googleapis.com/auth/games',
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
