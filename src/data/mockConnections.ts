export interface MockConnection {
  id: string;
  type: string;
  connected: boolean;
  lastConnected?: string;
  accountEmail?: string;
  accountLabel?: string;
}

export const mockConnections: MockConnection[] = [
  {
    id: "conn-1",
    type: "googleOAuth2Api",
    connected: true,
    lastConnected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "demo@example.com",
    accountLabel: "Work Account",
  },
  {
    id: "conn-2",
    type: "notionApi",
    connected: true,
    lastConnected: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "demo@example.com",
    accountLabel: "Main Workspace",
  },
  {
    id: "conn-3",
    type: "slackOAuth2Api",
    connected: true,
    lastConnected: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    accountEmail: "demo@company.slack.com",
    accountLabel: "Company Workspace",
  },
  {
    id: "conn-4",
    type: "calendlyApi",
    connected: false,
  },
  {
    id: "conn-5",
    type: "shopifyOAuth2Api",
    connected: false,
  },
  {
    id: "conn-6",
    type: "mailchimpOAuth2Api",
    connected: false,
  },
];
