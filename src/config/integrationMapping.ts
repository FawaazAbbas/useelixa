/**
 * Shared mapping between Tool Gateway integration names and OAuth credential types.
 * Used by both frontend (pre-install checks) and referenced by backend (tool-gateway).
 */

export interface IntegrationMapping {
  /** The key used in Tool Gateway requests (e.g. "gmail") */
  gatewayKey: string;
  /** Human-readable label */
  label: string;
  /** The credential_type stored in user_credentials */
  credentialType: string;
  /** The bundle_type for Google-bundled OAuth credentials */
  bundleType: string | null;
  /** Logo path for UI display */
  logoUrl: string;
  /** Short description of what this integration enables */
  description: string;
  /** Example actions available through the Tool Gateway */
  exampleActions: string[];
}

export const INTEGRATION_MAPPINGS: IntegrationMapping[] = [
  {
    gatewayKey: "gmail",
    label: "Gmail",
    credentialType: "googleOAuth2Api",
    bundleType: "gmail",
    logoUrl: "/logos/GoogleDriveLogo.png",
    description: "Read, send, and manage emails via Gmail API",
    exampleActions: ["list_messages", "get_message", "send_email", "list_labels"],
  },
  {
    gatewayKey: "google_ads",
    label: "Google Ads",
    credentialType: "googleOAuth2Api",
    bundleType: "google_ads",
    logoUrl: "/logos/GoogleDriveLogo.png",
    description: "Manage campaigns, ad groups, keywords, and reporting",
    exampleActions: ["get_campaigns", "get_ad_groups", "get_keywords", "get_reports"],
  },
  {
    gatewayKey: "google_analytics",
    label: "Google Analytics",
    credentialType: "googleOAuth2Api",
    bundleType: "google_analytics",
    logoUrl: "/logos/GoogleDriveLogo.png",
    description: "Fetch analytics data, reports, and audience insights",
    exampleActions: ["run_report", "get_realtime_data", "list_properties"],
  },
  {
    gatewayKey: "google_sheets",
    label: "Google Sheets",
    credentialType: "googleOAuth2Api",
    bundleType: "google_sheets",
    logoUrl: "/logos/GoogleDriveLogo.png",
    description: "Read and write spreadsheet data",
    exampleActions: ["read_range", "write_range", "create_spreadsheet"],
  },
  {
    gatewayKey: "shopify",
    label: "Shopify",
    credentialType: "shopifyApi",
    bundleType: null,
    logoUrl: "/logos/ShopifyLogo.svg",
    description: "Manage products, orders, customers, and inventory",
    exampleActions: ["list_products", "get_orders", "update_inventory"],
  },
  {
    gatewayKey: "stripe",
    label: "Stripe",
    credentialType: "stripeApi",
    bundleType: null,
    logoUrl: "/logos/StripeLogo.png",
    description: "Manage payments, subscriptions, and invoices",
    exampleActions: ["list_charges", "create_invoice", "get_subscription"],
  },
  {
    gatewayKey: "notion",
    label: "Notion",
    credentialType: "notionApi",
    bundleType: null,
    logoUrl: "/logos/NotionLogo.svg",
    description: "Read and write pages, databases, and blocks",
    exampleActions: ["search", "get_page", "create_page", "query_database"],
  },
];

/** Look up a mapping by its gateway key */
export function getIntegrationByGatewayKey(key: string): IntegrationMapping | undefined {
  return INTEGRATION_MAPPINGS.find((m) => m.gatewayKey === key);
}

/** Get all gateway keys */
export function getAllGatewayKeys(): string[] {
  return INTEGRATION_MAPPINGS.map((m) => m.gatewayKey);
}
