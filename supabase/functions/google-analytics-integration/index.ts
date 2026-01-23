import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials, updateRefreshedToken } from "../_shared/credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Analytics Data API (GA4)
const GA_API_BASE = "https://analyticsdata.googleapis.com/v1beta";
const GA_ADMIN_API_BASE = "https://analyticsadmin.googleapis.com/v1beta";

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
    console.log(`[Google Analytics] Action: ${action}, User: ${user.id}`);

    // Get Google OAuth credentials
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const creds = await getDecryptedCredentials(serviceClient, user.id, "googleOAuth2Api", "google_analytics");
    if (!creds) {
      throw new Error("Google Analytics not connected. Please connect your Google Analytics account first.");
    }

    let accessToken = creds.access_token;

    // Check if token is expired and refresh if needed
    if (creds.expires_at && new Date(creds.expires_at) < new Date()) {
      console.log("[Google Analytics] Token expired, refreshing...");
      if (!creds.refresh_token) {
        throw new Error("No refresh token available. Please reconnect your Google Analytics account.");
      }
      const refreshed = await refreshGoogleToken(serviceClient, user.id, creds.refresh_token);
      if (!refreshed) {
        throw new Error("Failed to refresh Google token. Please reconnect your account.");
      }
      accessToken = refreshed;
    }

    let result;

    switch (action) {
      case "list_accounts": {
        // List all accessible GA4 accounts
        const response = await fetch(`${GA_ADMIN_API_BASE}/accounts`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] List accounts error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          accounts: data.accounts || [],
        };
        break;
      }

      case "list_properties": {
        // List all accessible GA4 properties
        const accountId = params?.accountId;
        let url = `${GA_ADMIN_API_BASE}/properties`;
        if (accountId) {
          url += `?filter=parent:accounts/${accountId}`;
        }

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] List properties error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          properties: data.properties || [],
        };
        break;
      }

      case "get_traffic": {
        // Get website traffic data (pageviews, sessions, users)
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const startDate = params?.startDate || "30daysAgo";
        const endDate = params?.endDate || "today";

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "date" }],
            metrics: [
              { name: "screenPageViews" },
              { name: "sessions" },
              { name: "totalUsers" },
              { name: "newUsers" },
              { name: "activeUsers" },
            ],
            orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get traffic error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          dimensionHeaders: data.dimensionHeaders,
          metricHeaders: data.metricHeaders,
          rows: data.rows || [],
          rowCount: data.rowCount,
          metadata: data.metadata,
          _hint: (data.rows || []).length === 0 
            ? "No data returned. This could mean: (1) The connected Google account lacks read access to this property, (2) There is no data for the requested date range, or (3) You may need to connect the specific Google account that owns this property."
            : undefined,
        };
        break;
      }

      case "get_user_behavior": {
        // Get user behavior data (engagement, bounce rate, session duration)
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const startDate = params?.startDate || "30daysAgo";
        const endDate = params?.endDate || "today";

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "date" }],
            metrics: [
              { name: "averageSessionDuration" },
              { name: "bounceRate" },
              { name: "engagementRate" },
              { name: "engagedSessions" },
              { name: "sessionsPerUser" },
            ],
            orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get user behavior error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          dimensionHeaders: data.dimensionHeaders,
          metricHeaders: data.metricHeaders,
          rows: data.rows || [],
          rowCount: data.rowCount,
          _hint: (data.rows || []).length === 0 
            ? "No data returned. This could mean: (1) The connected Google account lacks read access to this property, (2) There is no data for the requested date range, or (3) You may need to connect the specific Google account that owns this property."
            : undefined,
        };
        break;
      }

      case "get_conversions": {
        // Get conversion data
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const startDate = params?.startDate || "30daysAgo";
        const endDate = params?.endDate || "today";

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "eventName" }],
            metrics: [
              { name: "conversions" },
              { name: "eventCount" },
              { name: "eventValue" },
              { name: "totalRevenue" },
            ],
            dimensionFilter: {
              filter: {
                fieldName: "eventName",
                stringFilter: {
                  matchType: "CONTAINS",
                  value: params?.eventFilter || "",
                },
              },
            },
            orderBys: [{ metric: { metricName: "conversions" }, desc: true }],
            limit: params?.limit || 20,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get conversions error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          dimensionHeaders: data.dimensionHeaders,
          metricHeaders: data.metricHeaders,
          rows: data.rows || [],
          rowCount: data.rowCount,
          _hint: (data.rows || []).length === 0 
            ? "No data returned. This could mean: (1) The connected Google account lacks read access to this property, (2) There is no data for the requested date range, or (3) You may need to connect the specific Google account that owns this property."
            : undefined,
        };
        break;
      }

      case "get_top_pages": {
        // Get top pages by pageviews
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const startDate = params?.startDate || "30daysAgo";
        const endDate = params?.endDate || "today";

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
            metrics: [
              { name: "screenPageViews" },
              { name: "activeUsers" },
              { name: "averageSessionDuration" },
              { name: "bounceRate" },
            ],
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            limit: params?.limit || 20,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get top pages error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          dimensionHeaders: data.dimensionHeaders,
          metricHeaders: data.metricHeaders,
          rows: data.rows || [],
          rowCount: data.rowCount,
          _hint: (data.rows || []).length === 0 
            ? "No data returned. This could mean: (1) The connected Google account lacks read access to this property, (2) There is no data for the requested date range, or (3) You may need to connect the specific Google account that owns this property."
            : undefined,
        };
        break;
      }

      case "get_traffic_sources": {
        // Get traffic sources breakdown
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const startDate = params?.startDate || "30daysAgo";
        const endDate = params?.endDate || "today";

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate, endDate }],
            dimensions: [
              { name: "sessionDefaultChannelGroup" },
              { name: "sessionSource" },
              { name: "sessionMedium" },
            ],
            metrics: [
              { name: "sessions" },
              { name: "totalUsers" },
              { name: "conversions" },
              { name: "engagementRate" },
            ],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: params?.limit || 20,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get traffic sources error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          dimensionHeaders: data.dimensionHeaders,
          metricHeaders: data.metricHeaders,
          rows: data.rows || [],
          rowCount: data.rowCount,
          _hint: (data.rows || []).length === 0 
            ? "No data returned. This could mean: (1) The connected Google account lacks read access to this property, (2) There is no data for the requested date range, or (3) You may need to connect the specific Google account that owns this property."
            : undefined,
        };
        break;
      }

      case "get_realtime": {
        // Get realtime data
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runRealtimeReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dimensions: [{ name: "country" }],
            metrics: [
              { name: "activeUsers" },
            ],
            limit: 10,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get realtime error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          dimensionHeaders: data.dimensionHeaders,
          metricHeaders: data.metricHeaders,
          rows: data.rows || [],
          rowCount: data.rowCount,
          _hint: (data.rows || []).length === 0 
            ? "No realtime data found. This could mean no users are currently active on the property, or the connected account lacks access."
            : undefined,
        };
        break;
      }

      case "get_demographics": {
        // Get user demographics data
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const startDate = params?.startDate || "30daysAgo";
        const endDate = params?.endDate || "today";

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "country" }, { name: "city" }],
            metrics: [
              { name: "totalUsers" },
              { name: "sessions" },
              { name: "engagementRate" },
            ],
            orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
            limit: params?.limit || 20,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get demographics error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          dimensionHeaders: data.dimensionHeaders,
          metricHeaders: data.metricHeaders,
          rows: data.rows || [],
          rowCount: data.rowCount,
          _hint: (data.rows || []).length === 0 
            ? "No data returned. This could mean: (1) The connected Google account lacks read access to this property, (2) There is no data for the requested date range, or (3) You may need to connect the specific Google account that owns this property."
            : undefined,
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}. Available actions: list_accounts, list_properties, get_traffic, get_user_behavior, get_conversions, get_top_pages, get_traffic_sources, get_realtime, get_demographics`);
    }

    // Log execution
    await serviceClient.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: `google_analytics_${action}`,
      success: true,
      input_summary: JSON.stringify(params).substring(0, 500),
      output_summary: JSON.stringify(result).substring(0, 500),
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Google Analytics] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function refreshGoogleToken(
  supabase: any,
  userId: string,
  refreshToken: string
): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLEOAUTH2API_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLEOAUTH2API_CLIENT_SECRET");

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("[Google Analytics] Missing refresh credentials");
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
      console.error("[Google Analytics] Token refresh failed:", await response.text());
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
      "google_analytics"
    );

    console.log("[Google Analytics] Token refreshed successfully");
    return tokens.access_token;
  } catch (e) {
    console.error("[Google Analytics] Refresh error:", e);
    return null;
  }
}
