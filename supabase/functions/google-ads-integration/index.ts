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

    let result;

    switch (action) {
      case "list_customers": {
        // List accessible customer accounts
        const response = await fetch(`${GOOGLE_ADS_API_BASE}/customers:listAccessibleCustomers`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "developer-token": developerToken,
          },
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[Google Ads] List customers error:", error);
          throw new Error(`Google Ads API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        result = {
          resourceNames: data.resourceNames || [],
          customers: (data.resourceNames || []).map((name: string) => ({
            resourceName: name,
            customerId: name.replace("customers/", ""),
          })),
        };
        break;
      }

      case "get_customer": {
        // Get customer account details
        const customerId = params?.customerId;
        if (!customerId) throw new Error("customerId is required");

        const response = await fetch(
          `${GOOGLE_ADS_API_BASE}/customers/${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "developer-token": developerToken,
            },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[Google Ads] Get customer error:", error);
          throw new Error(`Google Ads API error: ${response.status}`);
        }

        result = await response.json();
        break;
      }

      case "get_campaigns": {
        // Get campaigns with performance metrics
        const customerId = params?.customerId;
        if (!customerId) throw new Error("customerId is required");

        const startDate = params?.startDate || getDefaultStartDate();
        const endDate = params?.endDate || getDefaultEndDate();

        const query = `
          SELECT
            campaign.id,
            campaign.name,
            campaign.status,
            campaign.advertising_channel_type,
            campaign.bidding_strategy_type,
            campaign_budget.amount_micros,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value,
            metrics.ctr,
            metrics.average_cpc
          FROM campaign
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
          ORDER BY metrics.cost_micros DESC
          LIMIT ${params?.limit || 50}
        `;

        const response = await fetch(
          `${GOOGLE_ADS_API_BASE}/customers/${customerId}/googleAds:search`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "developer-token": developerToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[Google Ads] Get campaigns error:", error);
          throw new Error(`Google Ads API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
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
        break;
      }

      case "get_ad_groups": {
        // Get ad groups with performance metrics
        const customerId = params?.customerId;
        if (!customerId) throw new Error("customerId is required");

        const campaignId = params?.campaignId;
        const startDate = params?.startDate || getDefaultStartDate();
        const endDate = params?.endDate || getDefaultEndDate();

        let query = `
          SELECT
            ad_group.id,
            ad_group.name,
            ad_group.status,
            ad_group.type,
            campaign.id,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.ctr,
            metrics.average_cpc
          FROM ad_group
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        `;

        if (campaignId) {
          query += ` AND campaign.id = ${campaignId}`;
        }

        query += ` ORDER BY metrics.cost_micros DESC LIMIT ${params?.limit || 50}`;

        const response = await fetch(
          `${GOOGLE_ADS_API_BASE}/customers/${customerId}/googleAds:search`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "developer-token": developerToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[Google Ads] Get ad groups error:", error);
          throw new Error(`Google Ads API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
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
        break;
      }

      case "get_ads": {
        // Get ads with performance metrics
        const customerId = params?.customerId;
        if (!customerId) throw new Error("customerId is required");

        const startDate = params?.startDate || getDefaultStartDate();
        const endDate = params?.endDate || getDefaultEndDate();

        let query = `
          SELECT
            ad_group_ad.ad.id,
            ad_group_ad.ad.type,
            ad_group_ad.ad.final_urls,
            ad_group_ad.status,
            ad_group_ad.ad.responsive_search_ad.headlines,
            ad_group_ad.ad.responsive_search_ad.descriptions,
            ad_group.id,
            ad_group.name,
            campaign.id,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.ctr
          FROM ad_group_ad
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        `;

        if (params?.adGroupId) {
          query += ` AND ad_group.id = ${params.adGroupId}`;
        }
        if (params?.campaignId) {
          query += ` AND campaign.id = ${params.campaignId}`;
        }

        query += ` ORDER BY metrics.cost_micros DESC LIMIT ${params?.limit || 50}`;

        const response = await fetch(
          `${GOOGLE_ADS_API_BASE}/customers/${customerId}/googleAds:search`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "developer-token": developerToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[Google Ads] Get ads error:", error);
          throw new Error(`Google Ads API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
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
        break;
      }

      case "get_keywords": {
        // Get keywords with performance metrics
        const customerId = params?.customerId;
        if (!customerId) throw new Error("customerId is required");

        const startDate = params?.startDate || getDefaultStartDate();
        const endDate = params?.endDate || getDefaultEndDate();

        let query = `
          SELECT
            ad_group_criterion.keyword.text,
            ad_group_criterion.keyword.match_type,
            ad_group_criterion.status,
            ad_group_criterion.quality_info.quality_score,
            ad_group.id,
            ad_group.name,
            campaign.id,
            campaign.name,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.ctr,
            metrics.average_cpc
          FROM keyword_view
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
        `;

        if (params?.adGroupId) {
          query += ` AND ad_group.id = ${params.adGroupId}`;
        }
        if (params?.campaignId) {
          query += ` AND campaign.id = ${params.campaignId}`;
        }

        query += ` ORDER BY metrics.cost_micros DESC LIMIT ${params?.limit || 50}`;

        const response = await fetch(
          `${GOOGLE_ADS_API_BASE}/customers/${customerId}/googleAds:search`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "developer-token": developerToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[Google Ads] Get keywords error:", error);
          throw new Error(`Google Ads API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          keywords: (data.results || []).map((row: any) => ({
            text: row.adGroupCriterion?.keyword?.text,
            matchType: row.adGroupCriterion?.keyword?.matchType,
            status: row.adGroupCriterion?.status,
            qualityScore: row.adGroupCriterion?.qualityInfo?.qualityScore,
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
        break;
      }

      case "get_budget_summary": {
        // Get budget summary across campaigns
        const customerId = params?.customerId;
        if (!customerId) throw new Error("customerId is required");

        const query = `
          SELECT
            campaign_budget.id,
            campaign_budget.name,
            campaign_budget.amount_micros,
            campaign_budget.status,
            campaign_budget.type,
            campaign_budget.delivery_method,
            metrics.cost_micros
          FROM campaign_budget
          WHERE campaign_budget.status = 'ENABLED'
          ORDER BY campaign_budget.amount_micros DESC
          LIMIT ${params?.limit || 50}
        `;

        const response = await fetch(
          `${GOOGLE_ADS_API_BASE}/customers/${customerId}/googleAds:search`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "developer-token": developerToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[Google Ads] Get budget summary error:", error);
          throw new Error(`Google Ads API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
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
        break;
      }

      case "get_account_performance": {
        // Get overall account performance metrics
        const customerId = params?.customerId;
        if (!customerId) throw new Error("customerId is required");

        const startDate = params?.startDate || getDefaultStartDate();
        const endDate = params?.endDate || getDefaultEndDate();

        const query = `
          SELECT
            segments.date,
            metrics.impressions,
            metrics.clicks,
            metrics.cost_micros,
            metrics.conversions,
            metrics.conversions_value,
            metrics.ctr,
            metrics.average_cpc,
            metrics.cost_per_conversion
          FROM customer
          WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
          ORDER BY segments.date DESC
        `;

        const response = await fetch(
          `${GOOGLE_ADS_API_BASE}/customers/${customerId}/googleAds:search`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "developer-token": developerToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[Google Ads] Get account performance error:", error);
          throw new Error(`Google Ads API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Aggregate totals
        let totals = {
          impressions: 0,
          clicks: 0,
          cost: 0,
          conversions: 0,
          conversionsValue: 0,
        };

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
            impressions,
            clicks,
            cost,
            conversions,
            conversionsValue,
            ctr: Number(row.metrics?.ctr || 0),
            averageCpc: row.metrics?.averageCpc ? Number(row.metrics.averageCpc) / 1000000 : 0,
            costPerConversion: row.metrics?.costPerConversion ? Number(row.metrics.costPerConversion) / 1000000 : 0,
          };
        });

        result = {
          totals: {
            ...totals,
            ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
            averageCpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0,
            costPerConversion: totals.conversions > 0 ? totals.cost / totals.conversions : 0,
          },
          dailyData,
          dateRange: { startDate, endDate },
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}. Available actions: list_customers, get_customer, get_campaigns, get_ad_groups, get_ads, get_keywords, get_budget_summary, get_account_performance`);
    }

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

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split("T")[0];
}

function getDefaultEndDate(): string {
  return new Date().toISOString().split("T")[0];
}

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
    
    // Update stored token
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
