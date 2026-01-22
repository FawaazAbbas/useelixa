import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GoogleAdsParams {
  customerId?: string;
  campaignId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

// Helper to refresh token if expired
async function refreshTokenIfNeeded(
  supabase: any,
  userId: string,
  credential: any
): Promise<string> {
  const now = Date.now();
  const expiresAt = new Date(credential.expires_at).getTime();
  
  // Refresh if expires in less than 5 minutes
  if (expiresAt - now < 5 * 60 * 1000) {
    console.log("[Google Ads] Token expired or expiring soon, refreshing...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const response = await fetch(`${supabaseUrl}/functions/v1/refresh-oauth-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        credentialType: "googleOAuth2Api",
        bundleType: "ads_marketing",
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.accessToken) {
        return result.accessToken;
      }
    }
    console.error("[Google Ads] Failed to refresh token");
  }
  
  return credential.access_token;
}

// Get accessible Google Ads customer accounts
async function getAccessibleCustomers(accessToken: string): Promise<any> {
  const response = await fetch(
    "https://googleads.googleapis.com/v16/customers:listAccessibleCustomers",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN") || "",
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error("[Google Ads] Failed to get accessible customers:", error);
    throw new Error(`Failed to get accessible customers: ${response.status}`);
  }
  
  return response.json();
}

// Get campaigns for a customer
async function getCampaigns(
  accessToken: string,
  customerId: string,
  limit = 50
): Promise<any> {
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.cost_micros,
      metrics.conversions
    FROM campaign
    WHERE campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
    LIMIT ${limit}
  `;
  
  const response = await fetch(
    `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN") || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error("[Google Ads] Failed to get campaigns:", error);
    throw new Error(`Failed to get campaigns: ${response.status}`);
  }
  
  return response.json();
}

// Get campaign performance metrics
async function getCampaignPerformance(
  accessToken: string,
  customerId: string,
  campaignId: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const start = startDate || thirtyDaysAgo.toISOString().split("T")[0];
  const end = endDate || today.toISOString().split("T")[0];
  
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      segments.date,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.average_cpc,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value
    FROM campaign
    WHERE campaign.id = ${campaignId}
      AND segments.date BETWEEN '${start}' AND '${end}'
    ORDER BY segments.date DESC
  `;
  
  const response = await fetch(
    `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN") || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error("[Google Ads] Failed to get campaign performance:", error);
    throw new Error(`Failed to get campaign performance: ${response.status}`);
  }
  
  return response.json();
}

// Get account spend summary
async function getSpendSummary(
  accessToken: string,
  customerId: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const start = startDate || thirtyDaysAgo.toISOString().split("T")[0];
  const end = endDate || today.toISOString().split("T")[0];
  
  const query = `
    SELECT
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value,
      metrics.average_cpc,
      metrics.average_cpm
    FROM customer
    WHERE segments.date BETWEEN '${start}' AND '${end}'
  `;
  
  const response = await fetch(
    `https://googleads.googleapis.com/v16/customers/${customerId}/googleAds:search`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": Deno.env.get("GOOGLE_ADS_DEVELOPER_TOKEN") || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error("[Google Ads] Failed to get spend summary:", error);
    throw new Error(`Failed to get spend summary: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Aggregate metrics
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalCostMicros = 0;
  let totalConversions = 0;
  let totalConversionsValue = 0;
  
  for (const row of data.results || []) {
    totalImpressions += parseInt(row.metrics?.impressions || 0);
    totalClicks += parseInt(row.metrics?.clicks || 0);
    totalCostMicros += parseInt(row.metrics?.costMicros || 0);
    totalConversions += parseFloat(row.metrics?.conversions || 0);
    totalConversionsValue += parseFloat(row.metrics?.conversionsValue || 0);
  }
  
  return {
    dateRange: { start, end },
    impressions: totalImpressions,
    clicks: totalClicks,
    ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) + "%" : "0%",
    spend: (totalCostMicros / 1000000).toFixed(2),
    conversions: totalConversions.toFixed(1),
    conversionsValue: totalConversionsValue.toFixed(2),
    averageCpc: totalClicks > 0 ? (totalCostMicros / totalClicks / 1000000).toFixed(2) : "0",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { action, params = {} } = await req.json() as { action: string; params: GoogleAdsParams };

    console.log(`[Google Ads] Action: ${action}, User: ${user.id}`);

    // Get user's Google credentials for ads_marketing bundle
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: credential } = await serviceSupabase
      .from("user_credentials")
      .select("*")
      .eq("user_id", user.id)
      .eq("credential_type", "googleOAuth2Api")
      .eq("bundle_type", "ads_marketing")
      .single();

    if (!credential) {
      return new Response(
        JSON.stringify({ 
          error: "Google Ads not connected. Please connect your Google Ads account first.",
          needsConnection: true,
          bundleType: "ads_marketing"
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await refreshTokenIfNeeded(supabase, user.id, credential);
    
    let result: any;

    switch (action) {
      case "list_customers":
        result = await getAccessibleCustomers(accessToken);
        break;

      case "list_campaigns": {
        let customerId: string = params.customerId || "";
        if (!customerId) {
          // Try to get first accessible customer
          const customers = await getAccessibleCustomers(accessToken);
          const resourceName = customers.resourceNames?.[0];
          if (!resourceName) {
            throw new Error("No Google Ads accounts accessible");
          }
          customerId = resourceName.split("/")[1] || "";
        }
        if (!customerId) throw new Error("Could not determine customer ID");
        result = await getCampaigns(accessToken, customerId, params.limit);
        break;
      }

      case "get_campaign_performance": {
        if (!params.customerId || !params.campaignId) {
          throw new Error("customerId and campaignId are required");
        }
        result = await getCampaignPerformance(
          accessToken,
          params.customerId,
          params.campaignId,
          params.startDate,
          params.endDate
        );
        break;
      }

      case "get_spend_summary": {
        let customerId: string = params.customerId || "";
        if (!customerId) {
          const customers = await getAccessibleCustomers(accessToken);
          const resourceName = customers.resourceNames?.[0];
          if (!resourceName) {
            throw new Error("No Google Ads accounts accessible");
          }
          customerId = resourceName.split("/")[1] || "";
        }
        if (!customerId) throw new Error("Could not determine customer ID");
        result = await getSpendSummary(
          accessToken,
          customerId,
          params.startDate,
          params.endDate
        );
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log tool execution
    await serviceSupabase.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: `google_ads_${action}`,
      parameters: params,
      result: { success: true },
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Google Ads] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
