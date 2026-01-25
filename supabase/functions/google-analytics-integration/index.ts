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
      // ============= ACCOUNT & PROPERTY MANAGEMENT =============
      case "list_accounts": {
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

      // ============= DATA API - TRAFFIC & REPORTING =============
      case "get_traffic": {
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
        result = formatReportResult(data);
        break;
      }

      case "get_user_behavior": {
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
        result = formatReportResult(data);
        break;
      }

      case "get_conversions": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const startDate = params?.startDate || "30daysAgo";
        const endDate = params?.endDate || "today";

        const requestBody: any = {
          dateRanges: [{ startDate, endDate }],
          dimensions: [{ name: "eventName" }],
          metrics: [
            { name: "conversions" },
            { name: "eventCount" },
            { name: "eventValue" },
            { name: "totalRevenue" },
          ],
          orderBys: [{ metric: { metricName: "conversions" }, desc: true }],
          limit: params?.limit || 20,
        };

        if (params?.eventFilter) {
          requestBody.dimensionFilter = {
            filter: {
              fieldName: "eventName",
              stringFilter: {
                matchType: "CONTAINS",
                value: params.eventFilter,
              },
            },
          };
        }

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get conversions error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_top_pages": {
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
              { name: "scrolledUsers" },
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
        result = formatReportResult(data);
        break;
      }

      case "get_exit_pages": {
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
            dimensions: [{ name: "exitPage" }],
            metrics: [
              { name: "sessions" },
              { name: "activeUsers" },
              { name: "bounceRate" },
              { name: "engagementRate" },
            ],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: params?.limit || 20,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get exit pages error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_traffic_sources": {
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
        result = formatReportResult(data);
        break;
      }

      case "get_realtime": {
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
            metrics: [{ name: "activeUsers" }],
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
          ...formatReportResult(data),
          _hint: (data.rows || []).length === 0
            ? "No realtime data found. This could mean no users are currently active on the property, or the connected account lacks access."
            : undefined,
        };
        break;
      }

      case "get_demographics": {
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
        result = formatReportResult(data);
        break;
      }

      case "get_devices": {
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
            dimensions: [{ name: "deviceCategory" }],
            metrics: [
              { name: "sessions" },
              { name: "totalUsers" },
              { name: "engagementRate" },
              { name: "averageSessionDuration" },
              { name: "bounceRate" },
            ],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get devices error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_ecommerce": {
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
              { name: "transactions" },
              { name: "purchaseRevenue" },
              { name: "totalPurchasers" },
              { name: "ecommercePurchases" },
              { name: "itemsPurchased" },
              { name: "averagePurchaseRevenue" },
            ],
            orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get ecommerce error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_landing_pages": {
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
            dimensions: [{ name: "landingPage" }],
            metrics: [
              { name: "sessions" },
              { name: "totalUsers" },
              { name: "bounceRate" },
              { name: "conversions" },
              { name: "engagementRate" },
            ],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: params?.limit || 20,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get landing pages error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      // ============= ADMIN API - CONVERSION EVENTS =============
      case "list_conversion_events": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/conversionEvents`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] List conversion events error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          conversionEvents: data.conversionEvents || [],
        };
        break;
      }

      case "create_conversion_event": {
        const propertyId = params?.propertyId;
        const eventName = params?.eventName;
        if (!propertyId) throw new Error("propertyId is required");
        if (!eventName) throw new Error("eventName is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/conversionEvents`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventName: eventName,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Create conversion event error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        result = {
          success: true,
          conversionEvent: data,
          message: `Successfully marked "${eventName}" as a conversion event`,
        };
        break;
      }

      // ============= ADMIN API - CUSTOM DIMENSIONS =============
      case "list_custom_dimensions": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/customDimensions`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] List custom dimensions error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          customDimensions: data.customDimensions || [],
        };
        break;
      }

      case "create_custom_dimension": {
        const propertyId = params?.propertyId;
        const parameterName = params?.parameterName;
        const displayName = params?.displayName;
        if (!propertyId) throw new Error("propertyId is required");
        if (!parameterName) throw new Error("parameterName is required");
        if (!displayName) throw new Error("displayName is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/customDimensions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              parameterName: parameterName,
              displayName: displayName,
              description: params?.description || "",
              scope: params?.scope || "EVENT",
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Create custom dimension error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        result = {
          success: true,
          customDimension: data,
          message: `Successfully created custom dimension "${displayName}"`,
        };
        break;
      }

      // ============= ADMIN API - CUSTOM METRICS =============
      case "list_custom_metrics": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/customMetrics`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] List custom metrics error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          customMetrics: data.customMetrics || [],
        };
        break;
      }

      case "create_custom_metric": {
        const propertyId = params?.propertyId;
        const parameterName = params?.parameterName;
        const displayName = params?.displayName;
        if (!propertyId) throw new Error("propertyId is required");
        if (!parameterName) throw new Error("parameterName is required");
        if (!displayName) throw new Error("displayName is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/customMetrics`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              parameterName: parameterName,
              displayName: displayName,
              description: params?.description || "",
              measurementUnit: params?.measurementUnit || "STANDARD",
              scope: "EVENT",
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Create custom metric error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        result = {
          success: true,
          customMetric: data,
          message: `Successfully created custom metric "${displayName}"`,
        };
        break;
      }

      // ============= ADMIN API - DATA STREAMS =============
      case "list_data_streams": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/dataStreams`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] List data streams error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          dataStreams: data.dataStreams || [],
        };
        break;
      }

      case "get_data_stream": {
        const propertyId = params?.propertyId;
        const streamId = params?.streamId;
        if (!propertyId) throw new Error("propertyId is required");
        if (!streamId) throw new Error("streamId is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/dataStreams/${streamId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get data stream error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          dataStream: data,
        };
        break;
      }

      // ============= ADMIN API - AUDIENCES =============
      case "list_audiences": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/audiences`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] List audiences error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          audiences: data.audiences || [],
        };
        break;
      }

      // ============= PHASE 1: HIGH-PRIORITY REPORTING =============

      case "get_page_traffic_sources": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const startDate = params?.startDate || "30daysAgo";
        const endDate = params?.endDate || "today";

        const requestBody: any = {
          dateRanges: [{ startDate, endDate }],
          dimensions: [
            { name: "pagePath" },
            { name: "sessionSource" },
            { name: "sessionMedium" },
            { name: "sessionDefaultChannelGroup" },
          ],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "bounceRate" },
            { name: "engagedSessions" },
            { name: "conversions" },
          ],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: params?.limit || 50,
        };

        // Optional: Filter to specific page paths
        if (params?.pagePath) {
          requestBody.dimensionFilter = {
            filter: {
              fieldName: "pagePath",
              stringFilter: {
                matchType: params.exactMatch ? "EXACT" : "CONTAINS",
                value: params.pagePath,
              },
            },
          };
        }

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get page traffic sources error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "run_custom_report": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");
        if (!params?.dimensions || params.dimensions.length === 0) throw new Error("dimensions array is required");
        if (!params?.metrics || params.metrics.length === 0) throw new Error("metrics array is required");

        const startDate = params?.startDate || "30daysAgo";
        const endDate = params?.endDate || "today";

        const requestBody: any = {
          dateRanges: [{ startDate, endDate }],
          dimensions: params.dimensions.slice(0, 9).map((d: string) => ({ name: d })),
          metrics: params.metrics.slice(0, 10).map((m: string) => ({ name: m })),
          limit: params?.limit || 100,
        };

        if (params?.dimensionFilter) {
          requestBody.dimensionFilter = params.dimensionFilter;
        }

        if (params?.orderBy) {
          requestBody.orderBys = [params.orderBy];
        }

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Run custom report error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_events": {
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
              { name: "eventCount" },
              { name: "totalUsers" },
              { name: "eventValue" },
              { name: "eventCountPerUser" },
            ],
            orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
            limit: params?.limit || 50,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get events error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_campaigns": {
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
              { name: "sessionCampaignName" },
              { name: "sessionSource" },
              { name: "sessionMedium" },
            ],
            metrics: [
              { name: "sessions" },
              { name: "totalUsers" },
              { name: "conversions" },
              { name: "engagementRate" },
              { name: "bounceRate" },
            ],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: params?.limit || 30,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get campaigns error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "compare_periods": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");
        if (!params?.period1Start || !params?.period1End) throw new Error("period1Start and period1End are required");
        if (!params?.period2Start || !params?.period2End) throw new Error("period2Start and period2End are required");

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dateRanges: [
              { startDate: params.period1Start, endDate: params.period1End, name: "period1" },
              { startDate: params.period2Start, endDate: params.period2End, name: "period2" },
            ],
            dimensions: params?.dimensions?.map((d: string) => ({ name: d })) || [{ name: "date" }],
            metrics: params?.metrics?.map((m: string) => ({ name: m })) || [
              { name: "sessions" },
              { name: "totalUsers" },
              { name: "conversions" },
              { name: "engagementRate" },
            ],
            limit: params?.limit || 50,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Compare periods error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_user_journey": {
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
              { name: "landingPage" },
              { name: "pagePath" },
            ],
            metrics: [
              { name: "sessions" },
              { name: "activeUsers" },
              { name: "conversions" },
              { name: "engagementRate" },
            ],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: params?.limit || 50,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get user journey error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_hourly": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const startDate = params?.startDate || "7daysAgo";
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
              { name: "hour" },
              { name: "dayOfWeek" },
            ],
            metrics: [
              { name: "sessions" },
              { name: "activeUsers" },
              { name: "conversions" },
              { name: "engagementRate" },
            ],
            orderBys: [
              { dimension: { dimensionName: "dayOfWeek" }, desc: false },
              { dimension: { dimensionName: "hour" }, desc: false },
            ],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get hourly error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      // ============= PHASE 2: EXTENDED DEMOGRAPHICS & BEHAVIOR =============

      case "get_age_gender": {
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
              { name: "userAgeBracket" },
              { name: "userGender" },
            ],
            metrics: [
              { name: "totalUsers" },
              { name: "sessions" },
              { name: "conversions" },
              { name: "engagementRate" },
            ],
            orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get age gender error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          ...formatReportResult(data),
          _note: "Demographics data requires sufficient traffic and Google Signals enabled. Values may show 'unknown' for privacy thresholds.",
        };
        break;
      }

      case "get_interests": {
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
            dimensions: [{ name: "brandingInterest" }],
            metrics: [
              { name: "totalUsers" },
              { name: "sessions" },
              { name: "engagementRate" },
            ],
            orderBys: [{ metric: { metricName: "totalUsers" }, desc: true }],
            limit: params?.limit || 30,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get interests error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_browser_os": {
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
              { name: "browser" },
              { name: "operatingSystem" },
            ],
            metrics: [
              { name: "sessions" },
              { name: "totalUsers" },
              { name: "bounceRate" },
              { name: "engagementRate" },
            ],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: params?.limit || 20,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get browser OS error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_new_vs_returning": {
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
            dimensions: [{ name: "newVsReturning" }],
            metrics: [
              { name: "totalUsers" },
              { name: "sessions" },
              { name: "bounceRate" },
              { name: "conversions" },
              { name: "engagementRate" },
              { name: "averageSessionDuration" },
            ],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get new vs returning error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      case "get_content_groups": {
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
            dimensions: [{ name: "contentGroup" }],
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
          console.error("[GA] Get content groups error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          ...formatReportResult(data),
          _note: "Content groups require configuration in GA4 via the 'content_group' parameter in your tracking implementation.",
        };
        break;
      }

      case "get_cohort_analysis": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const cohortSpec = params?.cohortSpec || {
          cohorts: [
            { dimension: "firstSessionDate", dateRange: { startDate: "2024-01-01", endDate: "2024-01-07" } }
          ],
          cohortsRange: { granularity: "WEEKLY", startOffset: 0, endOffset: 4 }
        };

        const response = await fetch(`${GA_API_BASE}/properties/${propertyId}:runReport`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cohortSpec: cohortSpec,
            dimensions: [
              { name: "cohort" },
              { name: "cohortNthWeek" },
            ],
            metrics: [
              { name: "cohortActiveUsers" },
              { name: "cohortTotalUsers" },
            ],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get cohort analysis error:", error);
          throw new Error(`Google Analytics API error: ${response.status}`);
        }

        const data = await response.json();
        result = formatReportResult(data);
        break;
      }

      // ============= PHASE 3: ADVANCED ADMIN API =============

      case "list_key_events": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/keyEvents`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] List key events error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          keyEvents: data.keyEvents || [],
        };
        break;
      }

      case "create_key_event": {
        const propertyId = params?.propertyId;
        const eventName = params?.eventName;
        if (!propertyId) throw new Error("propertyId is required");
        if (!eventName) throw new Error("eventName is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/keyEvents`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              eventName: eventName,
              countingMethod: params?.countingMethod || "ONCE_PER_EVENT",
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Create key event error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        result = {
          success: true,
          keyEvent: data,
          message: `Successfully created key event "${eventName}"`,
        };
        break;
      }

      case "update_custom_dimension": {
        const propertyId = params?.propertyId;
        const dimensionId = params?.dimensionId;
        if (!propertyId) throw new Error("propertyId is required");
        if (!dimensionId) throw new Error("dimensionId is required");

        const updateMask = [];
        const body: any = {};
        if (params?.displayName) { body.displayName = params.displayName; updateMask.push("displayName"); }
        if (params?.description !== undefined) { body.description = params.description; updateMask.push("description"); }

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/customDimensions/${dimensionId}?updateMask=${updateMask.join(",")}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Update custom dimension error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        result = {
          success: true,
          customDimension: data,
          message: "Successfully updated custom dimension",
        };
        break;
      }

      case "update_custom_metric": {
        const propertyId = params?.propertyId;
        const metricId = params?.metricId;
        if (!propertyId) throw new Error("propertyId is required");
        if (!metricId) throw new Error("metricId is required");

        const updateMask = [];
        const body: any = {};
        if (params?.displayName) { body.displayName = params.displayName; updateMask.push("displayName"); }
        if (params?.description !== undefined) { body.description = params.description; updateMask.push("description"); }

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/customMetrics/${metricId}?updateMask=${updateMask.join(",")}`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Update custom metric error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        result = {
          success: true,
          customMetric: data,
          message: "Successfully updated custom metric",
        };
        break;
      }

      case "archive_dimension": {
        const propertyId = params?.propertyId;
        const dimensionId = params?.dimensionId;
        if (!propertyId) throw new Error("propertyId is required");
        if (!dimensionId) throw new Error("dimensionId is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/customDimensions/${dimensionId}:archive`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Archive dimension error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status} - ${error}`);
        }

        result = {
          success: true,
          message: `Successfully archived custom dimension ${dimensionId}`,
        };
        break;
      }

      case "archive_metric": {
        const propertyId = params?.propertyId;
        const metricId = params?.metricId;
        if (!propertyId) throw new Error("propertyId is required");
        if (!metricId) throw new Error("metricId is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/customMetrics/${metricId}:archive`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Archive metric error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status} - ${error}`);
        }

        result = {
          success: true,
          message: `Successfully archived custom metric ${metricId}`,
        };
        break;
      }

      case "list_google_ads_links": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/googleAdsLinks`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] List Google Ads links error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          googleAdsLinks: data.googleAdsLinks || [],
        };
        break;
      }

      case "create_google_ads_link": {
        const propertyId = params?.propertyId;
        const customerId = params?.customerId;
        if (!propertyId) throw new Error("propertyId is required");
        if (!customerId) throw new Error("customerId (Google Ads customer ID) is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/googleAdsLinks`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerId: customerId,
              adsPersonalizationEnabled: params?.adsPersonalizationEnabled !== false,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Create Google Ads link error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        result = {
          success: true,
          googleAdsLink: data,
          message: `Successfully linked Google Ads account ${customerId}`,
        };
        break;
      }

      case "get_change_history": {
        const propertyId = params?.propertyId;
        if (!propertyId) throw new Error("propertyId is required");

        const accountId = propertyId.split("/")[0]; // Extract account from property path

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/accounts/${accountId}:searchChangeHistoryEvents`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              property: `properties/${propertyId}`,
              resourceType: params?.resourceType ? [params.resourceType] : undefined,
              earliestChangeTime: params?.earliestChangeTime,
              latestChangeTime: params?.latestChangeTime,
              pageSize: params?.limit || 50,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Get change history error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          changeHistoryEvents: data.changeHistoryEvents || [],
        };
        break;
      }

      case "create_audience": {
        const propertyId = params?.propertyId;
        const displayName = params?.displayName;
        if (!propertyId) throw new Error("propertyId is required");
        if (!displayName) throw new Error("displayName is required");

        const response = await fetch(
          `${GA_ADMIN_API_BASE}/properties/${propertyId}/audiences`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              displayName: displayName,
              description: params?.description || "",
              membershipDurationDays: params?.membershipDurationDays || 30,
              filterClauses: params?.filterClauses || [
                {
                  clauseType: "INCLUDE",
                  simpleFilter: {
                    scope: "AUDIENCE_FILTER_SCOPE_ACROSS_ALL_SESSIONS",
                    filterExpression: {
                      andGroup: {
                        filterExpressions: [
                          {
                            orGroup: {
                              filterExpressions: [
                                {
                                  dimensionOrMetricFilter: {
                                    fieldName: "newVsReturning",
                                    stringFilter: { matchType: "EXACT", value: "new" }
                                  }
                                }
                              ]
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ],
            }),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[GA] Create audience error:", error);
          throw new Error(`Google Analytics Admin API error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        result = {
          success: true,
          audience: data,
          message: `Successfully created audience "${displayName}"`,
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}. Available actions: list_accounts, list_properties, get_traffic, get_user_behavior, get_conversions, get_top_pages, get_exit_pages, get_traffic_sources, get_realtime, get_demographics, get_devices, get_ecommerce, get_landing_pages, get_page_traffic_sources, run_custom_report, get_events, get_campaigns, compare_periods, get_user_journey, get_hourly, get_age_gender, get_interests, get_browser_os, get_new_vs_returning, get_content_groups, get_cohort_analysis, list_conversion_events, create_conversion_event, list_custom_dimensions, create_custom_dimension, update_custom_dimension, archive_dimension, list_custom_metrics, create_custom_metric, update_custom_metric, archive_metric, list_data_streams, get_data_stream, list_audiences, create_audience, list_key_events, create_key_event, list_google_ads_links, create_google_ads_link, get_change_history`);
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

// Helper function to format report results consistently
function formatReportResult(data: any) {
  return {
    dimensionHeaders: data.dimensionHeaders,
    metricHeaders: data.metricHeaders,
    rows: data.rows || [],
    rowCount: data.rowCount,
    metadata: data.metadata,
    _hint: (data.rows || []).length === 0
      ? "No data returned. This could mean: (1) The connected Google account lacks read access to this property, (2) There is no data for the requested date range, or (3) You may need to connect the specific Google account that owns this property."
      : undefined,
  };
}

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
