import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hash function for token verification
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Tool definitions by integration slug
const TOOL_DEFINITIONS: Record<string, { domain: string; actions: { name: string; description: string; parameters: Record<string, unknown> }[] }> = {
  slack: {
    domain: "messaging",
    actions: [
      { name: "send_message", description: "Send a message to a Slack channel", parameters: { type: "object", properties: { channel: { type: "string" }, text: { type: "string" } }, required: ["channel", "text"] } },
      { name: "list_channels", description: "List available Slack channels", parameters: { type: "object", properties: {} } },
    ],
  },
  google_calendar: {
    domain: "events",
    actions: [
      { name: "list", description: "List calendar events", parameters: { type: "object", properties: { calendar_id: { type: "string" }, max_results: { type: "number" } } } },
      { name: "create", description: "Create a calendar event", parameters: { type: "object", properties: { summary: { type: "string" }, start: { type: "string" }, end: { type: "string" } }, required: ["summary", "start", "end"] } },
    ],
  },
  gmail: {
    domain: "email",
    actions: [
      { name: "list", description: "List emails", parameters: { type: "object", properties: { max_results: { type: "number" }, query: { type: "string" } } } },
      { name: "get", description: "Get a specific email", parameters: { type: "object", properties: { message_id: { type: "string" } }, required: ["message_id"] } },
      { name: "send", description: "Send an email", parameters: { type: "object", properties: { to: { type: "string" }, subject: { type: "string" }, body: { type: "string" } }, required: ["to", "subject", "body"] } },
    ],
  },
  github: {
    domain: "repos",
    actions: [
      { name: "list", description: "List repositories", parameters: { type: "object", properties: {} } },
      { name: "create_issue", description: "Create an issue", parameters: { type: "object", properties: { repo: { type: "string" }, title: { type: "string" }, body: { type: "string" } }, required: ["repo", "title"] } },
    ],
  },
  shopify: {
    domain: "orders",
    actions: [
      { name: "list", description: "List recent orders", parameters: { type: "object", properties: { limit: { type: "number" }, status: { type: "string" } } } },
      { name: "list_products", description: "List products", parameters: { type: "object", properties: { limit: { type: "number" } } } },
    ],
  },
  notion: {
    domain: "pages",
    actions: [
      { name: "search", description: "Search Notion pages", parameters: { type: "object", properties: { query: { type: "string" } } } },
      { name: "create", description: "Create a Notion page", parameters: { type: "object", properties: { parent_id: { type: "string" }, title: { type: "string" } }, required: ["parent_id", "title"] } },
    ],
  },
  linear: {
    domain: "issues",
    actions: [
      { name: "list", description: "List Linear issues", parameters: { type: "object", properties: {} } },
      { name: "create", description: "Create a Linear issue", parameters: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title"] } },
    ],
  },
  hubspot: {
    domain: "crm",
    actions: [
      { name: "list_contacts", description: "List HubSpot contacts", parameters: { type: "object", properties: { limit: { type: "number" } } } },
      { name: "create_contact", description: "Create a HubSpot contact", parameters: { type: "object", properties: { email: { type: "string" }, firstname: { type: "string" }, lastname: { type: "string" } }, required: ["email"] } },
    ],
  },
  stripe: {
    domain: "payments",
    actions: [
      { name: "list_charges", description: "List Stripe charges", parameters: { type: "object", properties: { limit: { type: "number" } } } },
      { name: "create_invoice", description: "Create a Stripe invoice", parameters: { type: "object", properties: { customer: { type: "string" } }, required: ["customer"] } },
    ],
  },
  "google-analytics": {
    domain: "analytics",
    actions: [
      { name: "list_accounts", description: "List all accessible Google Analytics accounts", parameters: { type: "object", properties: {} } },
      { name: "list_properties", description: "List Google Analytics properties", parameters: { type: "object", properties: { accountId: { type: "string" } } } },
      { name: "get_traffic", description: "Get website traffic data (pageviews, sessions, users)", parameters: { type: "object", properties: { propertyId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } },
      { name: "get_user_behavior", description: "Get user behavior data (engagement, bounce rate, session duration)", parameters: { type: "object", properties: { propertyId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } },
      { name: "get_conversions", description: "Get conversion and event data", parameters: { type: "object", properties: { propertyId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, eventFilter: { type: "string" } }, required: ["propertyId"] } },
      { name: "get_top_pages", description: "Get top pages by pageviews", parameters: { type: "object", properties: { propertyId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } },
      { name: "get_traffic_sources", description: "Get traffic sources breakdown", parameters: { type: "object", properties: { propertyId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } },
      { name: "get_realtime", description: "Get realtime active users", parameters: { type: "object", properties: { propertyId: { type: "string" } }, required: ["propertyId"] } },
      { name: "get_demographics", description: "Get user demographics by location", parameters: { type: "object", properties: { propertyId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } },
    ],
  },
  "google-ads": {
    domain: "advertising",
    actions: [
      // Account & Customers
      { name: "list_customers", description: "List accessible Google Ads customer accounts", parameters: { type: "object", properties: {} } },
      { name: "get_customer", description: "Get Google Ads customer account details", parameters: { type: "object", properties: { customerId: { type: "string" } }, required: ["customerId"] } },
      // Campaigns
      { name: "get_campaigns", description: "Get campaigns with performance metrics", parameters: { type: "object", properties: { customerId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["customerId"] } },
      { name: "update_campaign_status", description: "Enable, pause, or remove a campaign (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, status: { type: "string", enum: ["ENABLED", "PAUSED", "REMOVED"] } }, required: ["customerId", "campaignId", "status"] } },
      { name: "update_campaign_budget", description: "Update campaign budget amount (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, budgetId: { type: "string" }, amount: { type: "number" } }, required: ["customerId", "budgetId", "amount"] } },
      { name: "create_campaign", description: "Create a new campaign (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, name: { type: "string" }, advertisingChannelType: { type: "string" }, budgetAmountMicros: { type: "number" }, biddingStrategyType: { type: "string" } }, required: ["customerId", "name", "budgetAmountMicros"] } },
      // Ad Groups
      { name: "get_ad_groups", description: "Get ad groups with performance metrics", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["customerId"] } },
      { name: "update_ad_group_status", description: "Enable, pause, or remove an ad group (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, adGroupId: { type: "string" }, status: { type: "string", enum: ["ENABLED", "PAUSED", "REMOVED"] } }, required: ["customerId", "adGroupId", "status"] } },
      { name: "create_ad_group", description: "Create a new ad group (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, name: { type: "string" }, cpcBidMicros: { type: "number" } }, required: ["customerId", "campaignId", "name"] } },
      // Ads
      { name: "get_ads", description: "Get ads with performance metrics", parameters: { type: "object", properties: { customerId: { type: "string" }, adGroupId: { type: "string" }, campaignId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["customerId"] } },
      { name: "update_ad_status", description: "Enable, pause, or remove an ad (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, adGroupId: { type: "string" }, adId: { type: "string" }, status: { type: "string", enum: ["ENABLED", "PAUSED", "REMOVED"] } }, required: ["customerId", "adGroupId", "adId", "status"] } },
      { name: "create_responsive_search_ad", description: "Create a responsive search ad (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, adGroupId: { type: "string" }, finalUrls: { type: "array" }, headlines: { type: "array" }, descriptions: { type: "array" } }, required: ["customerId", "adGroupId", "finalUrls", "headlines", "descriptions"] } },
      // Keywords
      { name: "get_keywords", description: "Get keywords with performance and quality score", parameters: { type: "object", properties: { customerId: { type: "string" }, adGroupId: { type: "string" }, campaignId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["customerId"] } },
      { name: "update_keyword_status", description: "Enable, pause, or remove a keyword (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, adGroupId: { type: "string" }, criterionId: { type: "string" }, status: { type: "string", enum: ["ENABLED", "PAUSED", "REMOVED"] } }, required: ["customerId", "adGroupId", "criterionId", "status"] } },
      { name: "add_keyword", description: "Add a keyword to an ad group (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, adGroupId: { type: "string" }, keywordText: { type: "string" }, matchType: { type: "string", enum: ["EXACT", "PHRASE", "BROAD"] }, cpcBidMicros: { type: "number" } }, required: ["customerId", "adGroupId", "keywordText"] } },
      { name: "set_keyword_bid", description: "Set CPC bid for a keyword (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, adGroupId: { type: "string" }, criterionId: { type: "string" }, cpcBidMicros: { type: "number" } }, required: ["customerId", "adGroupId", "criterionId", "cpcBidMicros"] } },
      // Search Terms & Negatives
      { name: "get_search_terms", description: "Get search terms report with performance metrics", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, adGroupId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["customerId"] } },
      { name: "list_negative_keywords", description: "List negative keywords", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, adGroupId: { type: "string" } }, required: ["customerId"] } },
      { name: "add_negative_keyword", description: "Add negative keyword to ad group (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, adGroupId: { type: "string" }, keywordText: { type: "string" }, matchType: { type: "string", enum: ["EXACT", "PHRASE", "BROAD"] } }, required: ["customerId", "adGroupId", "keywordText"] } },
      { name: "add_campaign_negative_keyword", description: "Add negative keyword to campaign (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, keywordText: { type: "string" }, matchType: { type: "string", enum: ["EXACT", "PHRASE", "BROAD"] } }, required: ["customerId", "campaignId", "keywordText"] } },
      // Conversions
      { name: "list_conversions", description: "List all conversion actions", parameters: { type: "object", properties: { customerId: { type: "string" }, limit: { type: "number" } }, required: ["customerId"] } },
      { name: "get_conversion_stats", description: "Get conversion metrics by action type", parameters: { type: "object", properties: { customerId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["customerId"] } },
      { name: "create_conversion", description: "Create a new conversion action (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, name: { type: "string" }, type: { type: "string" }, category: { type: "string" }, countingType: { type: "string" }, defaultValue: { type: "number" } }, required: ["customerId", "name"] } },
      // Bidding
      { name: "list_bidding_strategies", description: "List all bidding strategies", parameters: { type: "object", properties: { customerId: { type: "string" } }, required: ["customerId"] } },
      // Targeting
      { name: "get_location_targeting", description: "Get geographic targeting settings", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" } }, required: ["customerId"] } },
      { name: "set_location_targeting", description: "Add location targeting (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, geoTargetConstant: { type: "string" }, bidModifier: { type: "number" }, negative: { type: "boolean" } }, required: ["customerId", "campaignId", "geoTargetConstant"] } },
      { name: "get_device_targeting", description: "Get device bid adjustments", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" } }, required: ["customerId"] } },
      { name: "set_device_bid_adjustment", description: "Set device bid modifier (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, deviceType: { type: "string" }, bidModifier: { type: "number" } }, required: ["customerId", "campaignId", "bidModifier"] } },
      { name: "get_ad_schedule", description: "Get ad schedule settings", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" } }, required: ["customerId"] } },
      { name: "set_ad_schedule", description: "Add ad schedule (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, dayOfWeek: { type: "string" }, startHour: { type: "number" }, endHour: { type: "number" }, bidModifier: { type: "number" } }, required: ["customerId", "campaignId", "dayOfWeek"] } },
      // Extensions
      { name: "list_extensions", description: "List all ad extensions", parameters: { type: "object", properties: { customerId: { type: "string" }, limit: { type: "number" } }, required: ["customerId"] } },
      { name: "create_sitelink", description: "Create sitelink extension (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, linkText: { type: "string" }, finalUrl: { type: "string" }, description1: { type: "string" }, description2: { type: "string" } }, required: ["customerId", "linkText", "finalUrl"] } },
      { name: "create_callout", description: "Create callout extension (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, calloutText: { type: "string" } }, required: ["customerId", "calloutText"] } },
      { name: "create_call_extension", description: "Create call extension (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, phoneNumber: { type: "string" }, countryCode: { type: "string" } }, required: ["customerId", "phoneNumber"] } },
      // Audiences
      { name: "list_audiences", description: "List remarketing and custom audiences", parameters: { type: "object", properties: { customerId: { type: "string" }, limit: { type: "number" } }, required: ["customerId"] } },
      { name: "add_audience_to_campaign", description: "Add audience targeting to campaign (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, userListId: { type: "string" }, bidModifier: { type: "number" } }, required: ["customerId", "campaignId", "userListId"] } },
      // Recommendations
      { name: "get_recommendations", description: "Get Google's optimization recommendations", parameters: { type: "object", properties: { customerId: { type: "string" }, limit: { type: "number" } }, required: ["customerId"] } },
      { name: "apply_recommendation", description: "Apply an optimization recommendation (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, recommendationResourceName: { type: "string" } }, required: ["customerId", "recommendationResourceName"] } },
      { name: "dismiss_recommendation", description: "Dismiss an optimization recommendation (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, recommendationResourceName: { type: "string" } }, required: ["customerId", "recommendationResourceName"] } },
      // Quality Score
      { name: "get_quality_score_insights", description: "Get detailed quality score breakdown by keyword", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, limit: { type: "number" } }, required: ["customerId"] } },
      // Labels
      { name: "list_labels", description: "List all account labels", parameters: { type: "object", properties: { customerId: { type: "string" } }, required: ["customerId"] } },
      { name: "create_label", description: "Create a new label (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, name: { type: "string" }, backgroundColor: { type: "string" } }, required: ["customerId", "name"] } },
      { name: "apply_label_to_campaign", description: "Apply label to a campaign (HITL)", parameters: { type: "object", properties: { customerId: { type: "string" }, campaignId: { type: "string" }, labelId: { type: "string" } }, required: ["customerId", "campaignId", "labelId"] } },
      // Change History
      { name: "get_change_history", description: "View recent account changes", parameters: { type: "object", properties: { customerId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["customerId"] } },
      // Budget & Performance
      { name: "get_budget_summary", description: "Get budget summary across campaigns", parameters: { type: "object", properties: { customerId: { type: "string" } }, required: ["customerId"] } },
      { name: "get_account_performance", description: "Get overall account performance metrics", parameters: { type: "object", properties: { customerId: { type: "string" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["customerId"] } },
    ],
  },
};

// Map integration slugs to their edge function and action mappings
const INTEGRATION_FUNCTION_MAP: Record<string, { functionName: string; actionMap: Record<string, string> }> = {
  gmail: {
    functionName: "gmail-integration",
    actionMap: {
      list: "list",
      get: "get",
      send: "send",
    },
  },
  google_calendar: {
    functionName: "calendar-integration",
    actionMap: {
      list: "list",
      create: "create",
    },
  },
  shopify: {
    functionName: "shopify-integration",
    actionMap: {
      list: "list_orders",
      list_products: "list_products",
    },
  },
  stripe: {
    functionName: "stripe-integration",
    actionMap: {
      list_charges: "list_charges",
      create_invoice: "create_invoice",
    },
  },
  "google-analytics": {
    functionName: "google-analytics-integration",
    actionMap: {
      list_accounts: "list_accounts",
      list_properties: "list_properties",
      get_traffic: "get_traffic",
      get_user_behavior: "get_user_behavior",
      get_conversions: "get_conversions",
      get_top_pages: "get_top_pages",
      get_traffic_sources: "get_traffic_sources",
      get_realtime: "get_realtime",
      get_demographics: "get_demographics",
    },
  },
  "google-ads": {
    functionName: "google-ads-integration",
    actionMap: {
      // Account
      list_customers: "list_customers",
      get_customer: "get_customer",
      // Campaigns
      get_campaigns: "get_campaigns",
      update_campaign_status: "update_campaign_status",
      update_campaign_budget: "update_campaign_budget",
      create_campaign: "create_campaign",
      // Ad Groups
      get_ad_groups: "get_ad_groups",
      update_ad_group_status: "update_ad_group_status",
      create_ad_group: "create_ad_group",
      // Ads
      get_ads: "get_ads",
      update_ad_status: "update_ad_status",
      create_responsive_search_ad: "create_responsive_search_ad",
      // Keywords
      get_keywords: "get_keywords",
      update_keyword_status: "update_keyword_status",
      add_keyword: "add_keyword",
      set_keyword_bid: "set_keyword_bid",
      // Search Terms & Negatives
      get_search_terms: "get_search_terms",
      list_negative_keywords: "list_negative_keywords",
      add_negative_keyword: "add_negative_keyword",
      add_campaign_negative_keyword: "add_campaign_negative_keyword",
      // Conversions
      list_conversions: "list_conversions",
      get_conversion_stats: "get_conversion_stats",
      create_conversion: "create_conversion",
      // Bidding
      list_bidding_strategies: "list_bidding_strategies",
      // Targeting
      get_location_targeting: "get_location_targeting",
      set_location_targeting: "set_location_targeting",
      get_device_targeting: "get_device_targeting",
      set_device_bid_adjustment: "set_device_bid_adjustment",
      get_ad_schedule: "get_ad_schedule",
      set_ad_schedule: "set_ad_schedule",
      // Extensions
      list_extensions: "list_extensions",
      create_sitelink: "create_sitelink",
      create_callout: "create_callout",
      create_call_extension: "create_call_extension",
      // Audiences
      list_audiences: "list_audiences",
      add_audience_to_campaign: "add_audience_to_campaign",
      // Recommendations
      get_recommendations: "get_recommendations",
      apply_recommendation: "apply_recommendation",
      dismiss_recommendation: "dismiss_recommendation",
      // Quality Score
      get_quality_score_insights: "get_quality_score_insights",
      // Labels
      list_labels: "list_labels",
      create_label: "create_label",
      apply_label_to_campaign: "apply_label_to_campaign",
      // Change History
      get_change_history: "get_change_history",
      // Budget & Performance
      get_budget_summary: "get_budget_summary",
      get_account_performance: "get_account_performance",
    },
  },
};

// Execute real integration call
async function executeIntegrationCall(
  integrationSlug: string,
  action: string,
  input: Record<string, unknown>,
  userId: string,
  authHeader: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const mapping = INTEGRATION_FUNCTION_MAP[integrationSlug];
  
  if (!mapping) {
    console.log(`[MCP] No real integration mapping for ${integrationSlug}, returning mock data`);
    return { success: true, data: getMockResponse(action, input) };
  }

  const mappedAction = mapping.actionMap[action];
  if (!mappedAction) {
    console.log(`[MCP] No action mapping for ${integrationSlug}.${action}, returning mock data`);
    return { success: true, data: getMockResponse(action, input) };
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const functionUrl = `${supabaseUrl}/functions/v1/${mapping.functionName}`;

    console.log(`[MCP] Calling ${functionUrl} with action: ${mappedAction}`);

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        action: mappedAction,
        params: input,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[MCP] Integration call failed: ${response.status} - ${errorText}`);
      return { success: false, error: `Integration error: ${response.status}` };
    }

    const result = await response.json();
    console.log(`[MCP] Integration call succeeded for ${integrationSlug}.${action}`);
    return { success: true, data: result };
  } catch (error) {
    console.error(`[MCP] Error calling integration ${integrationSlug}:`, error);
    return { success: false, error: String(error) };
  }
}

// Get mock response for integrations without real implementation
function getMockResponse(action: string, input: Record<string, unknown>): Record<string, unknown> {
  if (action.includes("list") || action === "search") {
    return {
      items: [
        { id: crypto.randomUUID(), name: "Sample Item 1", created_at: new Date().toISOString() },
        { id: crypto.randomUUID(), name: "Sample Item 2", created_at: new Date().toISOString() },
      ],
      total: 2,
      has_more: false,
    };
  } else if (action.includes("create") || action === "send_message" || action === "send") {
    return {
      id: crypto.randomUUID(),
      created: true,
      created_at: new Date().toISOString(),
      ...input,
    };
  }
  return {
    success: true,
    executed_at: new Date().toISOString(),
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.replace("/mcp", "");

  try {
    // Extract and validate token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.substring(7);
    
    // Validate token format
    if (!token.startsWith("elixa_")) {
      return new Response(
        JSON.stringify({ error: "Invalid token format" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tokenHash = await hashToken(token);

    // Create Supabase client with service role for auth bypass
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate token and get org context
    const { data: tokenData, error: tokenError } = await supabase
      .from("mcp_tokens")
      .select("id, org_id, scopes, created_by, revoked_at")
      .eq("token_hash", tokenHash)
      .single();

    if (tokenError || !tokenData) {
      console.error("Token lookup failed:", tokenError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (tokenData.revoked_at) {
      return new Response(
        JSON.stringify({ error: "Token has been revoked" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orgId = tokenData.org_id;
    const tokenId = tokenData.id;
    const tokenScopes = tokenData.scopes || [];
    const userId = tokenData.created_by;

    // Update last_used_at
    await supabase
      .from("mcp_tokens")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", tokenId);

    // Route handling
    if (path === "/tools" || path === "") {
      // GET /tools - List available tools based on connected org integrations
      const { data: orgIntegrations, error: intError } = await supabase
        .from("org_integrations")
        .select(`
          id,
          status,
          scopes,
          integration:integrations(id, slug, name, category)
        `)
        .eq("org_id", orgId)
        .eq("status", "connected");

      if (intError) {
        console.error("Failed to fetch org integrations:", intError);
        return new Response(
          JSON.stringify({ error: "Failed to fetch integrations" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Build tool list from connected integrations
      const tools: unknown[] = [];
      for (const orgInt of orgIntegrations || []) {
        // Handle both single object and array from join
        const integrationData = orgInt.integration;
        const integration = Array.isArray(integrationData) ? integrationData[0] : integrationData;
        if (!integration || !integration.slug) continue;

        const slug = integration.slug as string;
        const toolDef = TOOL_DEFINITIONS[slug];
        if (!toolDef) continue;

        // Filter by token scopes if specified
        for (const action of toolDef.actions) {
          const toolName = `${slug}.${toolDef.domain}.${action.name}`;
          if (tokenScopes.length === 0 || tokenScopes.includes("*") || tokenScopes.includes(slug)) {
            tools.push({
              name: toolName,
              description: action.description,
              parameters: action.parameters,
              integration: {
                slug,
                name: integration.name,
                category: integration.category,
              },
              realIntegration: !!INTEGRATION_FUNCTION_MAP[slug],
            });
          }
        }
      }

      return new Response(
        JSON.stringify({
          tools,
          org_id: orgId,
          token_scopes: tokenScopes,
          server: "elixa-mcp",
          version: "2.1.0",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (path === "/call" && req.method === "POST") {
      // POST /call - Execute a tool
      const startTime = Date.now();
      const body = await req.json();
      const { tool_name, tool, input } = body;
      const targetTool = tool_name || tool;

      if (!targetTool) {
        return new Response(
          JSON.stringify({ error: "tool_name is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Parse tool name: integration_slug.domain.action
      const [integrationSlug, domain, action] = targetTool.split(".");

      if (!integrationSlug || !action) {
        return new Response(
          JSON.stringify({ error: "Invalid tool name format. Expected: integration.domain.action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check token scopes
      if (tokenScopes.length > 0 && !tokenScopes.includes("*") && !tokenScopes.includes(integrationSlug)) {
        return new Response(
          JSON.stringify({ error: `Token does not have access to ${integrationSlug}` }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Execute the integration call (real or mock)
      const result = await executeIntegrationCall(
        integrationSlug,
        action,
        input || {},
        userId,
        authHeader
      );

      const latencyMs = Date.now() - startTime;
      const status = result.success ? "success" : "error";

      // Log tool call using service role
      const { error: logError } = await supabase.from("tool_calls").insert({
        org_id: orgId,
        actor_token_id: tokenId,
        actor_user_id: userId,
        integration_slug: integrationSlug,
        tool_name: targetTool,
        input: input || {},
        output: result.data || { error: result.error },
        status,
        latency_ms: latencyMs,
      });

      if (logError) {
        console.error("Failed to log tool call:", logError);
      }

      if (!result.success) {
        return new Response(
          JSON.stringify({
            tool_name: targetTool,
            status: "error",
            error: result.error,
            latency_ms: latencyMs,
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          tool_name: targetTool,
          status: "success",
          result: result.data,
          latency_ms: latencyMs,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unknown endpoint
    return new Response(
      JSON.stringify({
        error: "Not found",
        available_endpoints: [
          "GET /tools - List available tools",
          "POST /call - Execute a tool",
        ],
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("MCP Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
