import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GAParams {
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  dimensions?: string[];
  metrics?: string[];
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
    console.log("[Google Analytics] Token expired or expiring soon, refreshing...");
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const response = await fetch(`${supabaseUrl}/functions/v1/refresh-oauth-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        credentialType: "googleOAuth2Api",
        bundleType: "analytics_reporting",
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.accessToken) {
        return result.accessToken;
      }
    }
    console.error("[Google Analytics] Failed to refresh token");
  }
  
  return credential.access_token;
}

// List GA4 properties the user has access to
async function listProperties(accessToken: string): Promise<any> {
  const response = await fetch(
    "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error("[Google Analytics] Failed to list properties:", error);
    throw new Error(`Failed to list properties: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Extract properties from account summaries
  const properties: any[] = [];
  for (const account of data.accountSummaries || []) {
    for (const prop of account.propertySummaries || []) {
      properties.push({
        propertyId: prop.property.split("/")[1],
        displayName: prop.displayName,
        accountId: account.account.split("/")[1],
        accountName: account.displayName,
      });
    }
  }
  
  return { properties };
}

// Run a GA4 Data API report
async function runReport(
  accessToken: string,
  propertyId: string,
  dimensions: string[],
  metrics: string[],
  startDate: string,
  endDate: string,
  limit = 100
): Promise<any> {
  const response = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: dimensions.map(d => ({ name: d })),
        metrics: metrics.map(m => ({ name: m })),
        limit,
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    console.error("[Google Analytics] Failed to run report:", error);
    throw new Error(`Failed to run report: ${response.status}`);
  }
  
  return response.json();
}

// Get traffic overview report
async function getTrafficReport(
  accessToken: string,
  propertyId: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const start = startDate || thirtyDaysAgo.toISOString().split("T")[0];
  const end = endDate || today.toISOString().split("T")[0];
  
  const report = await runReport(
    accessToken,
    propertyId,
    ["date"],
    ["sessions", "activeUsers", "screenPageViews", "bounceRate", "averageSessionDuration"],
    start,
    end,
    100
  );
  
  // Calculate totals
  let totalSessions = 0;
  let totalUsers = 0;
  let totalPageviews = 0;
  let totalBounceRate = 0;
  let totalDuration = 0;
  let count = 0;
  
  for (const row of report.rows || []) {
    totalSessions += parseInt(row.metricValues?.[0]?.value || 0);
    totalUsers += parseInt(row.metricValues?.[1]?.value || 0);
    totalPageviews += parseInt(row.metricValues?.[2]?.value || 0);
    totalBounceRate += parseFloat(row.metricValues?.[3]?.value || 0);
    totalDuration += parseFloat(row.metricValues?.[4]?.value || 0);
    count++;
  }
  
  return {
    dateRange: { start, end },
    summary: {
      sessions: totalSessions,
      activeUsers: totalUsers,
      pageviews: totalPageviews,
      averageBounceRate: count > 0 ? (totalBounceRate / count * 100).toFixed(2) + "%" : "0%",
      averageSessionDuration: count > 0 ? Math.round(totalDuration / count) + "s" : "0s",
    },
    dailyData: (report.rows || []).map((row: any) => ({
      date: row.dimensionValues?.[0]?.value,
      sessions: parseInt(row.metricValues?.[0]?.value || 0),
      users: parseInt(row.metricValues?.[1]?.value || 0),
      pageviews: parseInt(row.metricValues?.[2]?.value || 0),
    })),
  };
}

// Get traffic sources report
async function getSourcesReport(
  accessToken: string,
  propertyId: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const start = startDate || thirtyDaysAgo.toISOString().split("T")[0];
  const end = endDate || today.toISOString().split("T")[0];
  
  const report = await runReport(
    accessToken,
    propertyId,
    ["sessionSourceMedium"],
    ["sessions", "activeUsers", "bounceRate"],
    start,
    end,
    20
  );
  
  return {
    dateRange: { start, end },
    sources: (report.rows || []).map((row: any) => ({
      sourceMedium: row.dimensionValues?.[0]?.value,
      sessions: parseInt(row.metricValues?.[0]?.value || 0),
      users: parseInt(row.metricValues?.[1]?.value || 0),
      bounceRate: (parseFloat(row.metricValues?.[2]?.value || 0) * 100).toFixed(2) + "%",
    })),
  };
}

// Get top pages report
async function getTopPagesReport(
  accessToken: string,
  propertyId: string,
  startDate?: string,
  endDate?: string,
  limit = 20
): Promise<any> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const start = startDate || thirtyDaysAgo.toISOString().split("T")[0];
  const end = endDate || today.toISOString().split("T")[0];
  
  const report = await runReport(
    accessToken,
    propertyId,
    ["pagePath"],
    ["screenPageViews", "activeUsers", "averageSessionDuration"],
    start,
    end,
    limit
  );
  
  return {
    dateRange: { start, end },
    pages: (report.rows || []).map((row: any) => ({
      pagePath: row.dimensionValues?.[0]?.value,
      pageviews: parseInt(row.metricValues?.[0]?.value || 0),
      users: parseInt(row.metricValues?.[1]?.value || 0),
      avgDuration: Math.round(parseFloat(row.metricValues?.[2]?.value || 0)) + "s",
    })),
  };
}

// Get geographic report
async function getGeoReport(
  accessToken: string,
  propertyId: string,
  startDate?: string,
  endDate?: string
): Promise<any> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const start = startDate || thirtyDaysAgo.toISOString().split("T")[0];
  const end = endDate || today.toISOString().split("T")[0];
  
  const report = await runReport(
    accessToken,
    propertyId,
    ["country"],
    ["sessions", "activeUsers"],
    start,
    end,
    20
  );
  
  return {
    dateRange: { start, end },
    countries: (report.rows || []).map((row: any) => ({
      country: row.dimensionValues?.[0]?.value,
      sessions: parseInt(row.metricValues?.[0]?.value || 0),
      users: parseInt(row.metricValues?.[1]?.value || 0),
    })),
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

    const { action, params = {} } = await req.json() as { action: string; params: GAParams };

    console.log(`[Google Analytics] Action: ${action}, User: ${user.id}`);

    // Get user's Google credentials for analytics_reporting bundle
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: credential } = await serviceSupabase
      .from("user_credentials")
      .select("*")
      .eq("user_id", user.id)
      .eq("credential_type", "googleOAuth2Api")
      .eq("bundle_type", "analytics_reporting")
      .single();

    if (!credential) {
      return new Response(
        JSON.stringify({ 
          error: "Google Analytics not connected. Please connect your Google Analytics account first.",
          needsConnection: true,
          bundleType: "analytics_reporting"
        }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const accessToken = await refreshTokenIfNeeded(supabase, user.id, credential);
    
    let result: any;

    switch (action) {
      case "list_properties":
        result = await listProperties(accessToken);
        break;

      case "get_traffic": {
        let propertyId: string = params.propertyId || "";
        if (!propertyId) {
          const props = await listProperties(accessToken);
          const firstProperty = props.properties?.[0];
          if (!firstProperty?.propertyId) {
            throw new Error("No Google Analytics properties accessible");
          }
          propertyId = firstProperty.propertyId;
        }
        result = await getTrafficReport(
          accessToken,
          propertyId,
          params.startDate,
          params.endDate
        );
        break;
      }

      case "get_sources": {
        let propertyId: string = params.propertyId || "";
        if (!propertyId) {
          const props = await listProperties(accessToken);
          const firstProperty = props.properties?.[0];
          if (!firstProperty?.propertyId) {
            throw new Error("No Google Analytics properties accessible");
          }
          propertyId = firstProperty.propertyId;
        }
        result = await getSourcesReport(
          accessToken,
          propertyId,
          params.startDate,
          params.endDate
        );
        break;
      }

      case "get_top_pages": {
        let propertyId: string = params.propertyId || "";
        if (!propertyId) {
          const props = await listProperties(accessToken);
          const firstProperty = props.properties?.[0];
          if (!firstProperty?.propertyId) {
            throw new Error("No Google Analytics properties accessible");
          }
          propertyId = firstProperty.propertyId;
        }
        result = await getTopPagesReport(
          accessToken,
          propertyId,
          params.startDate,
          params.endDate,
          params.limit
        );
        break;
      }

      case "get_geo": {
        let propertyId: string = params.propertyId || "";
        if (!propertyId) {
          const props = await listProperties(accessToken);
          const firstProperty = props.properties?.[0];
          if (!firstProperty?.propertyId) {
            throw new Error("No Google Analytics properties accessible");
          }
          propertyId = firstProperty.propertyId;
        }
        result = await getGeoReport(
          accessToken,
          propertyId,
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
      tool_name: `google_analytics_${action}`,
      parameters: params,
      result: { success: true },
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[Google Analytics] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
