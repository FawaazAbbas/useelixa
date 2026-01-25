import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials, updateRefreshedToken } from "../_shared/credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Ads API v17
const GOOGLE_ADS_API_VERSION = "v17";
const GOOGLE_ADS_API_BASE = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { action, params } = await req.json();
    console.log(`[Google Ads] Action: ${action}, User: ${user.id}`);

    // Get Google OAuth credentials
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const creds = await getDecryptedCredentials(serviceClient, user.id, "googleOAuth2Api", "google_ads");
    if (!creds) {
      throw new Error("Google Ads not connected. Please connect your Google Ads account first.");
    }

    let accessToken = creds.access_token;

    // Check if token is expired and refresh if needed
    if (creds.expires_at && new Date(creds.expires_at) < new Date()) {
      console.log("[Google Ads] Token expired, refreshing...");
      if (!creds.refresh_token) {
        throw new Error("No refresh token available. Please reconnect your Google Ads account.");
      }
      const refreshed = await refreshGoogleToken(serviceClient, user.id, creds.refresh_token);
      if (!refreshed) {
        throw new Error("Failed to refresh Google token. Please reconnect your account.");
      }
      accessToken = refreshed;
    }

    // Developer token is required for Google Ads API
    const developerToken = Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN");
    if (!developerToken) {
      throw new Error("Google Ads developer token not configured. Please contact support.");
    }

    const result = await handleAction(action, params, accessToken, developerToken);

    // Log execution
    await serviceClient.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: `google_ads_${action}`,
      success: true,
      input_summary: JSON.stringify(params).substring(0, 500),
      output_summary: JSON.stringify(result).substring(0, 500),
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Google Ads] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ==================== HELPER FUNCTIONS ====================

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split("T")[0];
}

function getDefaultEndDate(): string {
  return new Date().toISOString().split("T")[0];
}

async function googleAdsRequest(
  endpoint: string,
  accessToken: string,
  developerToken: string,
  options: { method?: string; body?: any } = {}
): Promise<any> {
  const response = await fetch(endpoint, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": developerToken,
      "Content-Type": "application/json",
    },
    ...(options.body && { body: JSON.stringify(options.body) }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`[Google Ads] API error:`, error);
    throw new Error(`Google Ads API error: ${response.status} - ${error}`);
  }

  return response.json();
}

async function searchQuery(
  customerId: string,
  query: string,
  accessToken: string,
  developerToken: string
): Promise<any> {
  return googleAdsRequest(
    `${GOOGLE_ADS_API_BASE}/customers/${customerId}/googleAds:search`,
    accessToken,
    developerToken,
    { method: "POST", body: { query } }
  );
}

async function mutateResource(
  customerId: string,
  resource: string,
  operations: any[],
  accessToken: string,
  developerToken: string
): Promise<any> {
  return googleAdsRequest(
    `${GOOGLE_ADS_API_BASE}/customers/${customerId}/${resource}:mutate`,
    accessToken,
    developerToken,
    { method: "POST", body: { operations } }
  );
}

// ==================== ACTION HANDLER ====================

async function handleAction(
  action: string,
  params: any,
  accessToken: string,
  developerToken: string
): Promise<any> {
  switch (action) {
    // ==================== ACCOUNT & CUSTOMERS ====================
    case "list_customers": {
      const data = await googleAdsRequest(
        `${GOOGLE_ADS_API_BASE}/customers:listAccessibleCustomers`,
        accessToken,
        developerToken
      );
      return {
        resourceNames: data.resourceNames || [],
        customers: (data.resourceNames || []).map((name: string) => ({
          resourceName: name,
          customerId: name.replace("customers/", ""),
        })),
      };
    }

    case "get_customer": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");
      return googleAdsRequest(
        `${GOOGLE_ADS_API_BASE}/customers/${customerId}`,
        accessToken,
        developerToken
      );
    }

    // ==================== CAMPAIGNS ====================
    case "get_campaigns": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const startDate = params?.startDate || getDefaultStartDate();
      const endDate = params?.endDate || getDefaultEndDate();

      const query = `
        SELECT
          campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
          campaign.bidding_strategy_type, campaign_budget.amount_micros,
          metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions,
          metrics.conversions_value, metrics.ctr, metrics.average_cpc
        FROM campaign
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        ORDER BY metrics.cost_micros DESC
        LIMIT ${params?.limit || 50}
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        campaigns: (data.results || []).map((row: any) => ({
          id: row.campaign?.id,
          name: row.campaign?.name,
          status: row.campaign?.status,
          channelType: row.campaign?.advertisingChannelType,
          biddingStrategy: row.campaign?.biddingStrategyType,
          budget: row.campaignBudget?.amountMicros ? Number(row.campaignBudget.amountMicros) / 1000000 : null,
          impressions: Number(row.metrics?.impressions || 0),
          clicks: Number(row.metrics?.clicks || 0),
          cost: row.metrics?.costMicros ? Number(row.metrics.costMicros) / 1000000 : 0,
          conversions: Number(row.metrics?.conversions || 0),
          conversionsValue: Number(row.metrics?.conversionsValue || 0),
          ctr: Number(row.metrics?.ctr || 0),
          averageCpc: row.metrics?.averageCpc ? Number(row.metrics.averageCpc) / 1000000 : 0,
        })),
        dateRange: { startDate, endDate },
      };
    }

    case "update_campaign_status": {
      const { customerId, campaignId, status } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!campaignId) throw new Error("campaignId is required");
      if (!status || !["ENABLED", "PAUSED", "REMOVED"].includes(status)) {
        throw new Error("status must be ENABLED, PAUSED, or REMOVED");
      }

      const operations = [{
        update: {
          resourceName: `customers/${customerId}/campaigns/${campaignId}`,
          status,
        },
        updateMask: "status",
      }];

      const data = await mutateResource(customerId, "campaigns", operations, accessToken, developerToken);
      return { success: true, campaignId, newStatus: status, results: data.results };
    }

    case "update_campaign_budget": {
      const { customerId, budgetId, amount, amountMicros: rawMicros } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!budgetId) throw new Error("budgetId is required");
      
      const amountMicros = rawMicros || (amount ? Math.round(amount * 1000000) : null);
      if (!amountMicros) throw new Error("amount or amountMicros is required");

      const operations = [{
        update: {
          resourceName: `customers/${customerId}/campaignBudgets/${budgetId}`,
          amountMicros: amountMicros.toString(),
        },
        updateMask: "amount_micros",
      }];

      const data = await mutateResource(customerId, "campaignBudgets", operations, accessToken, developerToken);
      return { success: true, budgetId, newAmount: amountMicros / 1000000, results: data.results };
    }

    case "create_campaign": {
      const { customerId, name, advertisingChannelType, budgetAmountMicros, biddingStrategyType, status } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!name) throw new Error("name is required");
      if (!budgetAmountMicros) throw new Error("budgetAmountMicros is required");

      // First create the budget
      const budgetOps = [{
        create: {
          name: `${name}_budget`,
          amountMicros: budgetAmountMicros.toString(),
          deliveryMethod: "STANDARD",
        },
      }];
      const budgetData = await mutateResource(customerId, "campaignBudgets", budgetOps, accessToken, developerToken);
      const budgetResourceName = budgetData.results[0].resourceName;

      // Then create the campaign
      const campaignOps = [{
        create: {
          name,
          advertisingChannelType: advertisingChannelType || "SEARCH",
          status: status || "PAUSED",
          campaignBudget: budgetResourceName,
          biddingStrategyType: biddingStrategyType || "MAXIMIZE_CLICKS",
          networkSettings: {
            targetGoogleSearch: true,
            targetSearchNetwork: true,
            targetContentNetwork: false,
          },
        },
      }];

      const data = await mutateResource(customerId, "campaigns", campaignOps, accessToken, developerToken);
      return { success: true, campaign: data.results[0], budget: budgetData.results[0] };
    }

    // ==================== AD GROUPS ====================
    case "get_ad_groups": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const startDate = params?.startDate || getDefaultStartDate();
      const endDate = params?.endDate || getDefaultEndDate();
      const campaignId = params?.campaignId;

      let query = `
        SELECT
          ad_group.id, ad_group.name, ad_group.status, ad_group.type,
          campaign.id, campaign.name,
          metrics.impressions, metrics.clicks, metrics.cost_micros,
          metrics.conversions, metrics.ctr, metrics.average_cpc
        FROM ad_group
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      `;
      if (campaignId) query += ` AND campaign.id = ${campaignId}`;
      query += ` ORDER BY metrics.cost_micros DESC LIMIT ${params?.limit || 50}`;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        adGroups: (data.results || []).map((row: any) => ({
          id: row.adGroup?.id,
          name: row.adGroup?.name,
          status: row.adGroup?.status,
          type: row.adGroup?.type,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
          impressions: Number(row.metrics?.impressions || 0),
          clicks: Number(row.metrics?.clicks || 0),
          cost: row.metrics?.costMicros ? Number(row.metrics.costMicros) / 1000000 : 0,
          conversions: Number(row.metrics?.conversions || 0),
          ctr: Number(row.metrics?.ctr || 0),
          averageCpc: row.metrics?.averageCpc ? Number(row.metrics.averageCpc) / 1000000 : 0,
        })),
        dateRange: { startDate, endDate },
      };
    }

    case "update_ad_group_status": {
      const { customerId, adGroupId, status } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!adGroupId) throw new Error("adGroupId is required");
      if (!status || !["ENABLED", "PAUSED", "REMOVED"].includes(status)) {
        throw new Error("status must be ENABLED, PAUSED, or REMOVED");
      }

      const operations = [{
        update: {
          resourceName: `customers/${customerId}/adGroups/${adGroupId}`,
          status,
        },
        updateMask: "status",
      }];

      const data = await mutateResource(customerId, "adGroups", operations, accessToken, developerToken);
      return { success: true, adGroupId, newStatus: status, results: data.results };
    }

    case "create_ad_group": {
      const { customerId, campaignId, name, cpcBidMicros, status } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!campaignId) throw new Error("campaignId is required");
      if (!name) throw new Error("name is required");

      const operations = [{
        create: {
          name,
          campaign: `customers/${customerId}/campaigns/${campaignId}`,
          status: status || "ENABLED",
          type: "SEARCH_STANDARD",
          cpcBidMicros: (cpcBidMicros || 1000000).toString(),
        },
      }];

      const data = await mutateResource(customerId, "adGroups", operations, accessToken, developerToken);
      return { success: true, adGroup: data.results[0] };
    }

    // ==================== ADS ====================
    case "get_ads": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const startDate = params?.startDate || getDefaultStartDate();
      const endDate = params?.endDate || getDefaultEndDate();

      let query = `
        SELECT
          ad_group_ad.ad.id, ad_group_ad.ad.type, ad_group_ad.ad.final_urls,
          ad_group_ad.status, ad_group_ad.ad.responsive_search_ad.headlines,
          ad_group_ad.ad.responsive_search_ad.descriptions,
          ad_group.id, ad_group.name, campaign.id, campaign.name,
          metrics.impressions, metrics.clicks, metrics.cost_micros,
          metrics.conversions, metrics.ctr
        FROM ad_group_ad
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      `;
      if (params?.adGroupId) query += ` AND ad_group.id = ${params.adGroupId}`;
      if (params?.campaignId) query += ` AND campaign.id = ${params.campaignId}`;
      query += ` ORDER BY metrics.cost_micros DESC LIMIT ${params?.limit || 50}`;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        ads: (data.results || []).map((row: any) => ({
          id: row.adGroupAd?.ad?.id,
          type: row.adGroupAd?.ad?.type,
          status: row.adGroupAd?.status,
          finalUrls: row.adGroupAd?.ad?.finalUrls || [],
          headlines: row.adGroupAd?.ad?.responsiveSearchAd?.headlines?.map((h: any) => h.text) || [],
          descriptions: row.adGroupAd?.ad?.responsiveSearchAd?.descriptions?.map((d: any) => d.text) || [],
          adGroupId: row.adGroup?.id,
          adGroupName: row.adGroup?.name,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
          impressions: Number(row.metrics?.impressions || 0),
          clicks: Number(row.metrics?.clicks || 0),
          cost: row.metrics?.costMicros ? Number(row.metrics.costMicros) / 1000000 : 0,
          conversions: Number(row.metrics?.conversions || 0),
          ctr: Number(row.metrics?.ctr || 0),
        })),
        dateRange: { startDate, endDate },
      };
    }

    case "update_ad_status": {
      const { customerId, adGroupId, adId, status } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!adGroupId) throw new Error("adGroupId is required");
      if (!adId) throw new Error("adId is required");
      if (!status || !["ENABLED", "PAUSED", "REMOVED"].includes(status)) {
        throw new Error("status must be ENABLED, PAUSED, or REMOVED");
      }

      const operations = [{
        update: {
          resourceName: `customers/${customerId}/adGroupAds/${adGroupId}~${adId}`,
          status,
        },
        updateMask: "status",
      }];

      const data = await mutateResource(customerId, "adGroupAds", operations, accessToken, developerToken);
      return { success: true, adId, adGroupId, newStatus: status, results: data.results };
    }

    case "create_responsive_search_ad": {
      const { customerId, adGroupId, finalUrls, headlines, descriptions } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!adGroupId) throw new Error("adGroupId is required");
      if (!finalUrls?.length) throw new Error("finalUrls is required");
      if (!headlines?.length || headlines.length < 3) throw new Error("At least 3 headlines required");
      if (!descriptions?.length || descriptions.length < 2) throw new Error("At least 2 descriptions required");

      const operations = [{
        create: {
          adGroup: `customers/${customerId}/adGroups/${adGroupId}`,
          status: "PAUSED",
          ad: {
            finalUrls,
            responsiveSearchAd: {
              headlines: headlines.map((text: string) => ({ text })),
              descriptions: descriptions.map((text: string) => ({ text })),
            },
          },
        },
      }];

      const data = await mutateResource(customerId, "adGroupAds", operations, accessToken, developerToken);
      return { success: true, ad: data.results[0] };
    }

    // ==================== KEYWORDS ====================
    case "get_keywords": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const startDate = params?.startDate || getDefaultStartDate();
      const endDate = params?.endDate || getDefaultEndDate();

      let query = `
        SELECT
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
          ad_group_criterion.status, ad_group_criterion.quality_info.quality_score,
          ad_group_criterion.effective_cpc_bid_micros,
          ad_group.id, ad_group.name, campaign.id, campaign.name,
          metrics.impressions, metrics.clicks, metrics.cost_micros,
          metrics.conversions, metrics.ctr, metrics.average_cpc
        FROM keyword_view
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      `;
      if (params?.adGroupId) query += ` AND ad_group.id = ${params.adGroupId}`;
      if (params?.campaignId) query += ` AND campaign.id = ${params.campaignId}`;
      query += ` ORDER BY metrics.cost_micros DESC LIMIT ${params?.limit || 50}`;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        keywords: (data.results || []).map((row: any) => ({
          criterionId: row.adGroupCriterion?.criterionId,
          text: row.adGroupCriterion?.keyword?.text,
          matchType: row.adGroupCriterion?.keyword?.matchType,
          status: row.adGroupCriterion?.status,
          qualityScore: row.adGroupCriterion?.qualityInfo?.qualityScore,
          bidMicros: row.adGroupCriterion?.effectiveCpcBidMicros,
          adGroupId: row.adGroup?.id,
          adGroupName: row.adGroup?.name,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
          impressions: Number(row.metrics?.impressions || 0),
          clicks: Number(row.metrics?.clicks || 0),
          cost: row.metrics?.costMicros ? Number(row.metrics.costMicros) / 1000000 : 0,
          conversions: Number(row.metrics?.conversions || 0),
          ctr: Number(row.metrics?.ctr || 0),
          averageCpc: row.metrics?.averageCpc ? Number(row.metrics.averageCpc) / 1000000 : 0,
        })),
        dateRange: { startDate, endDate },
      };
    }

    case "update_keyword_status": {
      const { customerId, adGroupId, criterionId, status } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!adGroupId) throw new Error("adGroupId is required");
      if (!criterionId) throw new Error("criterionId is required");
      if (!status || !["ENABLED", "PAUSED", "REMOVED"].includes(status)) {
        throw new Error("status must be ENABLED, PAUSED, or REMOVED");
      }

      const operations = [{
        update: {
          resourceName: `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`,
          status,
        },
        updateMask: "status",
      }];

      const data = await mutateResource(customerId, "adGroupCriteria", operations, accessToken, developerToken);
      return { success: true, criterionId, adGroupId, newStatus: status, results: data.results };
    }

    case "add_keyword": {
      const { customerId, adGroupId, keywordText, matchType, cpcBidMicros } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!adGroupId) throw new Error("adGroupId is required");
      if (!keywordText) throw new Error("keywordText is required");

      const validMatchTypes = ["EXACT", "PHRASE", "BROAD"];
      const finalMatchType = matchType && validMatchTypes.includes(matchType) ? matchType : "BROAD";

      const operations = [{
        create: {
          adGroup: `customers/${customerId}/adGroups/${adGroupId}`,
          status: "ENABLED",
          keyword: { text: keywordText, matchType: finalMatchType },
          ...(cpcBidMicros && { cpcBidMicros: cpcBidMicros.toString() }),
        },
      }];

      const data = await mutateResource(customerId, "adGroupCriteria", operations, accessToken, developerToken);
      return { success: true, keywordText, matchType: finalMatchType, adGroupId, results: data.results };
    }

    case "set_keyword_bid": {
      const { customerId, adGroupId, criterionId, cpcBidMicros } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!adGroupId) throw new Error("adGroupId is required");
      if (!criterionId) throw new Error("criterionId is required");
      if (!cpcBidMicros) throw new Error("cpcBidMicros is required");

      const operations = [{
        update: {
          resourceName: `customers/${customerId}/adGroupCriteria/${adGroupId}~${criterionId}`,
          cpcBidMicros: cpcBidMicros.toString(),
        },
        updateMask: "cpc_bid_micros",
      }];

      const data = await mutateResource(customerId, "adGroupCriteria", operations, accessToken, developerToken);
      return { success: true, criterionId, newBidMicros: cpcBidMicros, results: data.results };
    }

    // ==================== SEARCH TERMS & NEGATIVES ====================
    case "get_search_terms": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const startDate = params?.startDate || getDefaultStartDate();
      const endDate = params?.endDate || getDefaultEndDate();

      let query = `
        SELECT
          search_term_view.search_term, search_term_view.status,
          ad_group.id, ad_group.name, campaign.id, campaign.name,
          metrics.impressions, metrics.clicks, metrics.cost_micros,
          metrics.conversions, metrics.ctr
        FROM search_term_view
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      `;
      if (params?.campaignId) query += ` AND campaign.id = ${params.campaignId}`;
      if (params?.adGroupId) query += ` AND ad_group.id = ${params.adGroupId}`;
      query += ` ORDER BY metrics.impressions DESC LIMIT ${params?.limit || 100}`;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        searchTerms: (data.results || []).map((row: any) => ({
          searchTerm: row.searchTermView?.searchTerm,
          status: row.searchTermView?.status,
          adGroupId: row.adGroup?.id,
          adGroupName: row.adGroup?.name,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
          impressions: Number(row.metrics?.impressions || 0),
          clicks: Number(row.metrics?.clicks || 0),
          cost: row.metrics?.costMicros ? Number(row.metrics.costMicros) / 1000000 : 0,
          conversions: Number(row.metrics?.conversions || 0),
          ctr: Number(row.metrics?.ctr || 0),
        })),
        dateRange: { startDate, endDate },
      };
    }

    case "list_negative_keywords": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      let query = `
        SELECT
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
          ad_group_criterion.negative, ad_group.id, ad_group.name,
          campaign.id, campaign.name
        FROM ad_group_criterion
        WHERE ad_group_criterion.negative = TRUE
          AND ad_group_criterion.type = 'KEYWORD'
      `;
      if (params?.campaignId) query += ` AND campaign.id = ${params.campaignId}`;
      if (params?.adGroupId) query += ` AND ad_group.id = ${params.adGroupId}`;
      query += ` LIMIT ${params?.limit || 200}`;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        negativeKeywords: (data.results || []).map((row: any) => ({
          criterionId: row.adGroupCriterion?.criterionId,
          text: row.adGroupCriterion?.keyword?.text,
          matchType: row.adGroupCriterion?.keyword?.matchType,
          adGroupId: row.adGroup?.id,
          adGroupName: row.adGroup?.name,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
        })),
      };
    }

    case "add_negative_keyword": {
      const { customerId, adGroupId, keywordText, matchType } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!adGroupId) throw new Error("adGroupId is required");
      if (!keywordText) throw new Error("keywordText is required");

      const validMatchTypes = ["EXACT", "PHRASE", "BROAD"];
      const finalMatchType = matchType && validMatchTypes.includes(matchType) ? matchType : "BROAD";

      const operations = [{
        create: {
          adGroup: `customers/${customerId}/adGroups/${adGroupId}`,
          negative: true,
          keyword: { text: keywordText, matchType: finalMatchType },
        },
      }];

      const data = await mutateResource(customerId, "adGroupCriteria", operations, accessToken, developerToken);
      return { success: true, keywordText, matchType: finalMatchType, adGroupId, results: data.results };
    }

    case "add_campaign_negative_keyword": {
      const { customerId, campaignId, keywordText, matchType } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!campaignId) throw new Error("campaignId is required");
      if (!keywordText) throw new Error("keywordText is required");

      const validMatchTypes = ["EXACT", "PHRASE", "BROAD"];
      const finalMatchType = matchType && validMatchTypes.includes(matchType) ? matchType : "BROAD";

      const operations = [{
        create: {
          campaign: `customers/${customerId}/campaigns/${campaignId}`,
          keyword: { text: keywordText, matchType: finalMatchType },
        },
      }];

      const data = await mutateResource(customerId, "campaignCriteria", operations, accessToken, developerToken);
      return { success: true, keywordText, matchType: finalMatchType, campaignId, results: data.results };
    }

    // ==================== CONVERSIONS ====================
    case "list_conversions": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const query = `
        SELECT
          conversion_action.id, conversion_action.name, conversion_action.status,
          conversion_action.type, conversion_action.category,
          conversion_action.counting_type, conversion_action.value_settings.default_value,
          conversion_action.attribution_model_settings.attribution_model
        FROM conversion_action
        ORDER BY conversion_action.name
        LIMIT ${params?.limit || 100}
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        conversions: (data.results || []).map((row: any) => ({
          id: row.conversionAction?.id,
          name: row.conversionAction?.name,
          status: row.conversionAction?.status,
          type: row.conversionAction?.type,
          category: row.conversionAction?.category,
          countingType: row.conversionAction?.countingType,
          defaultValue: row.conversionAction?.valueSettings?.defaultValue,
          attributionModel: row.conversionAction?.attributionModelSettings?.attributionModel,
        })),
      };
    }

    case "get_conversion_stats": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const startDate = params?.startDate || getDefaultStartDate();
      const endDate = params?.endDate || getDefaultEndDate();

      const query = `
        SELECT
          segments.conversion_action, segments.conversion_action_name,
          segments.conversion_action_category,
          metrics.conversions, metrics.conversions_value,
          metrics.all_conversions, metrics.all_conversions_value
        FROM campaign
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        ORDER BY metrics.conversions DESC
        LIMIT ${params?.limit || 50}
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        conversionStats: (data.results || []).map((row: any) => ({
          conversionAction: row.segments?.conversionAction,
          conversionActionName: row.segments?.conversionActionName,
          category: row.segments?.conversionActionCategory,
          conversions: Number(row.metrics?.conversions || 0),
          conversionsValue: Number(row.metrics?.conversionsValue || 0),
          allConversions: Number(row.metrics?.allConversions || 0),
          allConversionsValue: Number(row.metrics?.allConversionsValue || 0),
        })),
        dateRange: { startDate, endDate },
      };
    }

    case "create_conversion": {
      const { customerId, name, type, category, countingType, defaultValue, includeInConversions } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!name) throw new Error("name is required");

      const operations = [{
        create: {
          name,
          type: type || "WEBPAGE",
          category: category || "DEFAULT",
          countingType: countingType || "ONE_PER_CLICK",
          status: "ENABLED",
          valueSettings: {
            defaultValue: defaultValue || 1,
            alwaysUseDefaultValue: defaultValue ? true : false,
          },
          primaryForGoal: includeInConversions !== false,
        },
      }];

      const data = await mutateResource(customerId, "conversionActions", operations, accessToken, developerToken);
      return { success: true, conversionAction: data.results[0] };
    }

    // ==================== BIDDING STRATEGIES ====================
    case "list_bidding_strategies": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const query = `
        SELECT
          bidding_strategy.id, bidding_strategy.name, bidding_strategy.status,
          bidding_strategy.type, bidding_strategy.campaign_count
        FROM bidding_strategy
        LIMIT ${params?.limit || 50}
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        biddingStrategies: (data.results || []).map((row: any) => ({
          id: row.biddingStrategy?.id,
          name: row.biddingStrategy?.name,
          status: row.biddingStrategy?.status,
          type: row.biddingStrategy?.type,
          campaignCount: row.biddingStrategy?.campaignCount,
        })),
      };
    }

    // ==================== TARGETING ====================
    case "get_location_targeting": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      let query = `
        SELECT
          campaign_criterion.criterion_id, campaign_criterion.location.geo_target_constant,
          campaign_criterion.bid_modifier, campaign_criterion.negative,
          campaign.id, campaign.name
        FROM campaign_criterion
        WHERE campaign_criterion.type = 'LOCATION'
      `;
      if (params?.campaignId) query += ` AND campaign.id = ${params.campaignId}`;
      query += ` LIMIT ${params?.limit || 100}`;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        locationTargets: (data.results || []).map((row: any) => ({
          criterionId: row.campaignCriterion?.criterionId,
          geoTargetConstant: row.campaignCriterion?.location?.geoTargetConstant,
          bidModifier: row.campaignCriterion?.bidModifier,
          negative: row.campaignCriterion?.negative,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
        })),
      };
    }

    case "set_location_targeting": {
      const { customerId, campaignId, geoTargetConstant, bidModifier, negative } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!campaignId) throw new Error("campaignId is required");
      if (!geoTargetConstant) throw new Error("geoTargetConstant is required");

      const operations = [{
        create: {
          campaign: `customers/${customerId}/campaigns/${campaignId}`,
          location: { geoTargetConstant },
          negative: negative || false,
          ...(bidModifier && { bidModifier: bidModifier.toString() }),
        },
      }];

      const data = await mutateResource(customerId, "campaignCriteria", operations, accessToken, developerToken);
      return { success: true, campaignId, geoTargetConstant, results: data.results };
    }

    case "get_device_targeting": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      let query = `
        SELECT
          campaign_criterion.criterion_id, campaign_criterion.device.type,
          campaign_criterion.bid_modifier, campaign.id, campaign.name
        FROM campaign_criterion
        WHERE campaign_criterion.type = 'DEVICE'
      `;
      if (params?.campaignId) query += ` AND campaign.id = ${params.campaignId}`;
      query += ` LIMIT ${params?.limit || 50}`;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        deviceTargets: (data.results || []).map((row: any) => ({
          criterionId: row.campaignCriterion?.criterionId,
          deviceType: row.campaignCriterion?.device?.type,
          bidModifier: row.campaignCriterion?.bidModifier,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
        })),
      };
    }

    case "set_device_bid_adjustment": {
      const { customerId, campaignId, criterionId, deviceType, bidModifier } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!campaignId) throw new Error("campaignId is required");
      if (!bidModifier) throw new Error("bidModifier is required");

      if (criterionId) {
        // Update existing
        const operations = [{
          update: {
            resourceName: `customers/${customerId}/campaignCriteria/${campaignId}~${criterionId}`,
            bidModifier: bidModifier.toString(),
          },
          updateMask: "bid_modifier",
        }];
        const data = await mutateResource(customerId, "campaignCriteria", operations, accessToken, developerToken);
        return { success: true, criterionId, bidModifier, results: data.results };
      } else if (deviceType) {
        // Create new
        const operations = [{
          create: {
            campaign: `customers/${customerId}/campaigns/${campaignId}`,
            device: { type: deviceType },
            bidModifier: bidModifier.toString(),
          },
        }];
        const data = await mutateResource(customerId, "campaignCriteria", operations, accessToken, developerToken);
        return { success: true, deviceType, bidModifier, results: data.results };
      } else {
        throw new Error("Either criterionId or deviceType is required");
      }
    }

    case "get_ad_schedule": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      let query = `
        SELECT
          campaign_criterion.criterion_id,
          campaign_criterion.ad_schedule.day_of_week,
          campaign_criterion.ad_schedule.start_hour,
          campaign_criterion.ad_schedule.end_hour,
          campaign_criterion.bid_modifier,
          campaign.id, campaign.name
        FROM campaign_criterion
        WHERE campaign_criterion.type = 'AD_SCHEDULE'
      `;
      if (params?.campaignId) query += ` AND campaign.id = ${params.campaignId}`;
      query += ` LIMIT ${params?.limit || 100}`;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        adSchedules: (data.results || []).map((row: any) => ({
          criterionId: row.campaignCriterion?.criterionId,
          dayOfWeek: row.campaignCriterion?.adSchedule?.dayOfWeek,
          startHour: row.campaignCriterion?.adSchedule?.startHour,
          endHour: row.campaignCriterion?.adSchedule?.endHour,
          bidModifier: row.campaignCriterion?.bidModifier,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
        })),
      };
    }

    case "set_ad_schedule": {
      const { customerId, campaignId, dayOfWeek, startHour, endHour, bidModifier } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!campaignId) throw new Error("campaignId is required");
      if (!dayOfWeek) throw new Error("dayOfWeek is required");

      const operations = [{
        create: {
          campaign: `customers/${customerId}/campaigns/${campaignId}`,
          adSchedule: {
            dayOfWeek,
            startHour: startHour || 0,
            startMinute: "ZERO",
            endHour: endHour || 24,
            endMinute: "ZERO",
          },
          ...(bidModifier && { bidModifier: bidModifier.toString() }),
        },
      }];

      const data = await mutateResource(customerId, "campaignCriteria", operations, accessToken, developerToken);
      return { success: true, campaignId, dayOfWeek, results: data.results };
    }

    // ==================== EXTENSIONS / ASSETS ====================
    case "list_extensions": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const query = `
        SELECT
          asset.id, asset.name, asset.type, asset.final_urls,
          asset.sitelink_asset.description1, asset.sitelink_asset.description2,
          asset.sitelink_asset.link_text,
          asset.callout_asset.callout_text,
          asset.call_asset.phone_number
        FROM asset
        WHERE asset.type IN ('SITELINK', 'CALLOUT', 'CALL', 'STRUCTURED_SNIPPET')
        LIMIT ${params?.limit || 100}
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        extensions: (data.results || []).map((row: any) => ({
          id: row.asset?.id,
          name: row.asset?.name,
          type: row.asset?.type,
          finalUrls: row.asset?.finalUrls,
          sitelinkText: row.asset?.sitelinkAsset?.linkText,
          sitelinkDesc1: row.asset?.sitelinkAsset?.description1,
          sitelinkDesc2: row.asset?.sitelinkAsset?.description2,
          calloutText: row.asset?.calloutAsset?.calloutText,
          phoneNumber: row.asset?.callAsset?.phoneNumber,
        })),
      };
    }

    case "create_sitelink": {
      const { customerId, linkText, finalUrl, description1, description2 } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!linkText) throw new Error("linkText is required");
      if (!finalUrl) throw new Error("finalUrl is required");

      const operations = [{
        create: {
          sitelinkAsset: {
            linkText,
            description1: description1 || "",
            description2: description2 || "",
          },
          finalUrls: [finalUrl],
        },
      }];

      const data = await mutateResource(customerId, "assets", operations, accessToken, developerToken);
      return { success: true, asset: data.results[0] };
    }

    case "create_callout": {
      const { customerId, calloutText } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!calloutText) throw new Error("calloutText is required");

      const operations = [{
        create: {
          calloutAsset: { calloutText },
        },
      }];

      const data = await mutateResource(customerId, "assets", operations, accessToken, developerToken);
      return { success: true, asset: data.results[0] };
    }

    case "create_call_extension": {
      const { customerId, phoneNumber, countryCode } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!phoneNumber) throw new Error("phoneNumber is required");

      const operations = [{
        create: {
          callAsset: {
            countryCode: countryCode || "US",
            phoneNumber,
          },
        },
      }];

      const data = await mutateResource(customerId, "assets", operations, accessToken, developerToken);
      return { success: true, asset: data.results[0] };
    }

    // ==================== AUDIENCES ====================
    case "list_audiences": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const query = `
        SELECT
          user_list.id, user_list.name, user_list.type, user_list.size_for_search,
          user_list.size_for_display, user_list.membership_status
        FROM user_list
        LIMIT ${params?.limit || 100}
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        audiences: (data.results || []).map((row: any) => ({
          id: row.userList?.id,
          name: row.userList?.name,
          type: row.userList?.type,
          sizeForSearch: row.userList?.sizeForSearch,
          sizeForDisplay: row.userList?.sizeForDisplay,
          membershipStatus: row.userList?.membershipStatus,
        })),
      };
    }

    case "add_audience_to_campaign": {
      const { customerId, campaignId, userListId, bidModifier } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!campaignId) throw new Error("campaignId is required");
      if (!userListId) throw new Error("userListId is required");

      const operations = [{
        create: {
          campaign: `customers/${customerId}/campaigns/${campaignId}`,
          userList: { userList: `customers/${customerId}/userLists/${userListId}` },
          ...(bidModifier && { bidModifier: bidModifier.toString() }),
        },
      }];

      const data = await mutateResource(customerId, "campaignCriteria", operations, accessToken, developerToken);
      return { success: true, campaignId, userListId, results: data.results };
    }

    // ==================== RECOMMENDATIONS ====================
    case "get_recommendations": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const query = `
        SELECT
          recommendation.resource_name, recommendation.type,
          recommendation.impact.base_metrics.impressions,
          recommendation.impact.potential_metrics.impressions,
          recommendation.campaign, recommendation.ad_group
        FROM recommendation
        LIMIT ${params?.limit || 50}
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        recommendations: (data.results || []).map((row: any) => ({
          resourceName: row.recommendation?.resourceName,
          type: row.recommendation?.type,
          baseImpressions: row.recommendation?.impact?.baseMetrics?.impressions,
          potentialImpressions: row.recommendation?.impact?.potentialMetrics?.impressions,
          campaign: row.recommendation?.campaign,
          adGroup: row.recommendation?.adGroup,
        })),
      };
    }

    case "apply_recommendation": {
      const { customerId, recommendationResourceName } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!recommendationResourceName) throw new Error("recommendationResourceName is required");

      const operations = [{ resourceName: recommendationResourceName }];

      const data = await googleAdsRequest(
        `${GOOGLE_ADS_API_BASE}/customers/${customerId}/recommendations:apply`,
        accessToken,
        developerToken,
        { method: "POST", body: { operations } }
      );
      return { success: true, results: data.results };
    }

    case "dismiss_recommendation": {
      const { customerId, recommendationResourceName } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!recommendationResourceName) throw new Error("recommendationResourceName is required");

      const operations = [{ resourceName: recommendationResourceName }];

      const data = await googleAdsRequest(
        `${GOOGLE_ADS_API_BASE}/customers/${customerId}/recommendations:dismiss`,
        accessToken,
        developerToken,
        { method: "POST", body: { operations } }
      );
      return { success: true, results: data.results };
    }

    // ==================== QUALITY SCORE ====================
    case "get_quality_score_insights": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      let query = `
        SELECT
          ad_group_criterion.keyword.text,
          ad_group_criterion.quality_info.quality_score,
          ad_group_criterion.quality_info.creative_quality_score,
          ad_group_criterion.quality_info.post_click_quality_score,
          ad_group_criterion.quality_info.search_predicted_ctr,
          ad_group.id, ad_group.name, campaign.id, campaign.name
        FROM keyword_view
        WHERE ad_group_criterion.quality_info.quality_score IS NOT NULL
      `;
      if (params?.campaignId) query += ` AND campaign.id = ${params.campaignId}`;
      query += ` ORDER BY ad_group_criterion.quality_info.quality_score ASC LIMIT ${params?.limit || 100}`;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        qualityScores: (data.results || []).map((row: any) => ({
          keyword: row.adGroupCriterion?.keyword?.text,
          qualityScore: row.adGroupCriterion?.qualityInfo?.qualityScore,
          creativeQuality: row.adGroupCriterion?.qualityInfo?.creativeQualityScore,
          postClickQuality: row.adGroupCriterion?.qualityInfo?.postClickQualityScore,
          expectedCtr: row.adGroupCriterion?.qualityInfo?.searchPredictedCtr,
          adGroupId: row.adGroup?.id,
          adGroupName: row.adGroup?.name,
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
        })),
      };
    }

    // ==================== LABELS ====================
    case "list_labels": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const query = `
        SELECT label.id, label.name, label.status, label.text_label.background_color
        FROM label
        LIMIT ${params?.limit || 100}
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        labels: (data.results || []).map((row: any) => ({
          id: row.label?.id,
          name: row.label?.name,
          status: row.label?.status,
          backgroundColor: row.label?.textLabel?.backgroundColor,
        })),
      };
    }

    case "create_label": {
      const { customerId, name, backgroundColor } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!name) throw new Error("name is required");

      const operations = [{
        create: {
          name,
          status: "ENABLED",
          textLabel: { backgroundColor: backgroundColor || "#FFFFFF" },
        },
      }];

      const data = await mutateResource(customerId, "labels", operations, accessToken, developerToken);
      return { success: true, label: data.results[0] };
    }

    case "apply_label_to_campaign": {
      const { customerId, campaignId, labelId } = params || {};
      if (!customerId) throw new Error("customerId is required");
      if (!campaignId) throw new Error("campaignId is required");
      if (!labelId) throw new Error("labelId is required");

      const operations = [{
        create: {
          campaign: `customers/${customerId}/campaigns/${campaignId}`,
          label: `customers/${customerId}/labels/${labelId}`,
        },
      }];

      const data = await mutateResource(customerId, "campaignLabels", operations, accessToken, developerToken);
      return { success: true, campaignId, labelId, results: data.results };
    }

    // ==================== CHANGE HISTORY ====================
    case "get_change_history": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const startDate = params?.startDate || getDefaultStartDate();
      const endDate = params?.endDate || getDefaultEndDate();

      const query = `
        SELECT
          change_event.change_date_time, change_event.change_resource_type,
          change_event.change_resource_name, change_event.client_type,
          change_event.user_email, change_event.old_resource, change_event.new_resource
        FROM change_event
        WHERE change_event.change_date_time >= '${startDate}'
          AND change_event.change_date_time <= '${endDate} 23:59:59'
        ORDER BY change_event.change_date_time DESC
        LIMIT ${params?.limit || 100}
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        changes: (data.results || []).map((row: any) => ({
          changeDateTime: row.changeEvent?.changeDateTime,
          resourceType: row.changeEvent?.changeResourceType,
          resourceName: row.changeEvent?.changeResourceName,
          clientType: row.changeEvent?.clientType,
          userEmail: row.changeEvent?.userEmail,
        })),
        dateRange: { startDate, endDate },
      };
    }

    // ==================== BUDGET & PERFORMANCE ====================
    case "get_budget_summary": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const query = `
        SELECT
          campaign_budget.id, campaign_budget.name, campaign_budget.amount_micros,
          campaign_budget.status, campaign_budget.type, campaign_budget.delivery_method,
          metrics.cost_micros
        FROM campaign_budget
        WHERE campaign_budget.status = 'ENABLED'
        ORDER BY campaign_budget.amount_micros DESC
        LIMIT ${params?.limit || 50}
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      return {
        budgets: (data.results || []).map((row: any) => ({
          id: row.campaignBudget?.id,
          name: row.campaignBudget?.name,
          amount: row.campaignBudget?.amountMicros ? Number(row.campaignBudget.amountMicros) / 1000000 : 0,
          status: row.campaignBudget?.status,
          type: row.campaignBudget?.type,
          deliveryMethod: row.campaignBudget?.deliveryMethod,
          spent: row.metrics?.costMicros ? Number(row.metrics.costMicros) / 1000000 : 0,
        })),
      };
    }

    case "get_account_performance": {
      const customerId = params?.customerId;
      if (!customerId) throw new Error("customerId is required");

      const startDate = params?.startDate || getDefaultStartDate();
      const endDate = params?.endDate || getDefaultEndDate();

      const query = `
        SELECT
          segments.date,
          metrics.impressions, metrics.clicks, metrics.cost_micros,
          metrics.conversions, metrics.conversions_value,
          metrics.ctr, metrics.average_cpc, metrics.cost_per_conversion
        FROM customer
        WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        ORDER BY segments.date DESC
      `;

      const data = await searchQuery(customerId, query, accessToken, developerToken);
      
      let totals = { impressions: 0, clicks: 0, cost: 0, conversions: 0, conversionsValue: 0 };

      const dailyData = (data.results || []).map((row: any) => {
        const impressions = Number(row.metrics?.impressions || 0);
        const clicks = Number(row.metrics?.clicks || 0);
        const cost = row.metrics?.costMicros ? Number(row.metrics.costMicros) / 1000000 : 0;
        const conversions = Number(row.metrics?.conversions || 0);
        const conversionsValue = Number(row.metrics?.conversionsValue || 0);

        totals.impressions += impressions;
        totals.clicks += clicks;
        totals.cost += cost;
        totals.conversions += conversions;
        totals.conversionsValue += conversionsValue;

        return {
          date: row.segments?.date,
          impressions, clicks, cost, conversions, conversionsValue,
          ctr: Number(row.metrics?.ctr || 0),
          averageCpc: row.metrics?.averageCpc ? Number(row.metrics.averageCpc) / 1000000 : 0,
          costPerConversion: row.metrics?.costPerConversion ? Number(row.metrics.costPerConversion) / 1000000 : 0,
        };
      });

      return {
        totals: {
          ...totals,
          ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
          averageCpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0,
          costPerConversion: totals.conversions > 0 ? totals.cost / totals.conversions : 0,
        },
        dailyData,
        dateRange: { startDate, endDate },
      };
    }

    default:
      throw new Error(`Unknown action: ${action}. Use list_customers, get_campaigns, get_ad_groups, get_ads, get_keywords, get_search_terms, list_conversions, get_recommendations, list_audiences, get_quality_score_insights, and more.`);
  }
}

// ==================== TOKEN REFRESH ====================

async function refreshGoogleToken(
  supabase: any,
  userId: string,
  refreshToken: string
): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLEOAUTH2API_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLEOAUTH2API_CLIENT_SECRET");

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("[Google Ads] Missing refresh credentials");
    return null;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }).toString(),
    });

    if (!response.ok) {
      console.error("[Google Ads] Token refresh failed:", await response.text());
      return null;
    }

    const tokens = await response.json();
    
    await updateRefreshedToken(
      supabase,
      userId,
      "googleOAuth2Api",
      tokens.access_token,
      tokens.expires_in,
      "google_ads"
    );

    console.log("[Google Ads] Token refreshed successfully");
    return tokens.access_token;
  } catch (e) {
    console.error("[Google Ads] Refresh error:", e);
    return null;
  }
}
