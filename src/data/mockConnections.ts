export interface MockConnection {
  id: string;
  type: string;
  connected: boolean;
  lastConnected?: string;
  accountEmail?: string;
  accountLabel?: string;
}

export const mockConnections: MockConnection[] = [
  // Google OAuth
  {
    id: "conn-1",
    type: "googleOAuth2Api",
    connected: true,
    lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "demo@example.com",
    accountLabel: "Work Account",
  },
  // Notion
  {
    id: "conn-2",
    type: "notionApi",
    connected: true,
    lastConnected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "demo@example.com",
    accountLabel: "Main Workspace",
  },
  // Slack
  {
    id: "conn-3",
    type: "slackOAuth2Api",
    connected: true,
    lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "demo@company.slack.com",
    accountLabel: "Company Workspace",
  },
  // Marketing Integrations
  {
    id: "conn-4",
    type: "klaviyoApi",
    connected: true,
    lastConnected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "marketing@techreborn.com",
    accountLabel: "Tech Reborn Marketing",
  },
  {
    id: "conn-5",
    type: "mailchimpOAuth2Api",
    connected: true,
    lastConnected: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "marketing@techreborn.com",
    accountLabel: "Main Account",
  },
  {
    id: "conn-6",
    type: "omnisendApi",
    connected: true,
    lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "marketing@techreborn.com",
    accountLabel: "Ecommerce Store",
  },
  {
    id: "conn-7",
    type: "tiktokAdsApi",
    connected: true,
    lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "ads@techreborn.com",
    accountLabel: "Tech Reborn Ads",
  },
  // Analytics
  {
    id: "conn-8",
    type: "tripleWhaleApi",
    connected: true,
    lastConnected: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "analytics@techreborn.com",
    accountLabel: "Main Dashboard",
  },
  {
    id: "conn-9",
    type: "northbeamApi",
    connected: true,
    lastConnected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "analytics@techreborn.com",
    accountLabel: "Attribution Account",
  },
  {
    id: "conn-10",
    type: "bigQueryApi",
    connected: true,
    lastConnected: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "data@techreborn.com",
    accountLabel: "Production Dataset",
  },
  // Influencer & Affiliate
  {
    id: "conn-11",
    type: "grinApi",
    connected: true,
    lastConnected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "influencer@techreborn.com",
    accountLabel: "Creator Program",
  },
  {
    id: "conn-12",
    type: "aspireApi",
    connected: true,
    lastConnected: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "influencer@techreborn.com",
    accountLabel: "Ambassador Network",
  },
  {
    id: "conn-13",
    type: "impactApi",
    connected: true,
    lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "affiliates@techreborn.com",
    accountLabel: "Partner Program",
  },
  {
    id: "conn-14",
    type: "awinApi",
    connected: true,
    lastConnected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "affiliates@techreborn.com",
    accountLabel: "UK Affiliates",
  },
  // Reviews
  {
    id: "conn-15",
    type: "trustpilotApi",
    connected: true,
    lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "reviews@techreborn.com",
    accountLabel: "Tech Reborn Store",
  },
  {
    id: "conn-16",
    type: "yotpoApi",
    connected: true,
    lastConnected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "reviews@techreborn.com",
    accountLabel: "Product Reviews",
  },
  // Finance Integrations
  {
    id: "conn-17",
    type: "xeroApi",
    connected: true,
    lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "finance@techreborn.com",
    accountLabel: "Tech Reborn Ltd",
  },
  {
    id: "conn-18",
    type: "quickbooksApi",
    connected: true,
    lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "finance@techreborn.com",
    accountLabel: "US Operations",
  },
  {
    id: "conn-19",
    type: "stripeApi",
    connected: true,
    lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "payments@techreborn.com",
    accountLabel: "Live Account",
  },
  {
    id: "conn-20",
    type: "paypalApi",
    connected: true,
    lastConnected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "payments@techreborn.com",
    accountLabel: "Business Account",
  },
  {
    id: "conn-21",
    type: "klarnaApi",
    connected: true,
    lastConnected: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "payments@techreborn.com",
    accountLabel: "EU Store",
  },
  {
    id: "conn-22",
    type: "clearpayApi",
    connected: true,
    lastConnected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "payments@techreborn.com",
    accountLabel: "UK Store",
  },
  {
    id: "conn-23",
    type: "laybuyApi",
    connected: true,
    lastConnected: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "payments@techreborn.com",
    accountLabel: "ANZ Store",
  },
  {
    id: "conn-24",
    type: "truelayerApi",
    connected: true,
    lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "finance@techreborn.com",
    accountLabel: "Open Banking",
  },
  {
    id: "conn-25",
    type: "plaidApi",
    connected: true,
    lastConnected: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "finance@techreborn.com",
    accountLabel: "Bank Connections",
  },
  {
    id: "conn-26",
    type: "hmrcApi",
    connected: true,
    lastConnected: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "tax@techreborn.com",
    accountLabel: "VAT Returns",
  },
  // Disconnected ones
  {
    id: "conn-27",
    type: "calendlyApi",
    connected: false,
  },
  {
    id: "conn-28",
    type: "shopifyOAuth2Api",
    connected: false,
  },
];
