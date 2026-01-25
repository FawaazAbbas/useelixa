import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials, updateRefreshedToken } from "../_shared/credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// YouTube APIs
const YT_ANALYTICS_API = "https://youtubeanalytics.googleapis.com/v2";
const YT_DATA_API = "https://www.googleapis.com/youtube/v3";

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
    console.log(`[YouTube Analytics] Action: ${action}, User: ${user.id}`);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const creds = await getDecryptedCredentials(serviceClient, user.id, "googleOAuth2Api", "youtube");
    if (!creds) {
      throw new Error("YouTube not connected. Please connect your YouTube account first.");
    }

    let accessToken = creds.access_token;

    if (creds.expires_at && new Date(creds.expires_at) < new Date()) {
      console.log("[YouTube] Token expired, refreshing...");
      if (!creds.refresh_token) {
        throw new Error("No refresh token available. Please reconnect your YouTube account.");
      }
      const refreshed = await refreshGoogleToken(serviceClient, user.id, creds.refresh_token);
      if (!refreshed) {
        throw new Error("Failed to refresh Google token. Please reconnect your account.");
      }
      accessToken = refreshed;
    }

    let result;

    switch (action) {
      // ============= CHANNEL INFO =============
      case "get_channel": {
        const response = await fetch(
          `${YT_DATA_API}/channels?part=snippet,statistics,contentDetails&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) {
          const error = await response.text();
          console.error("[YT] Get channel error:", error);
          throw new Error(`YouTube API error: ${response.status}`);
        }
        const data = await response.json();
        result = {
          channels: data.items?.map((ch: any) => ({
            id: ch.id,
            title: ch.snippet?.title,
            description: ch.snippet?.description,
            customUrl: ch.snippet?.customUrl,
            thumbnail: ch.snippet?.thumbnails?.default?.url,
            subscriberCount: ch.statistics?.subscriberCount,
            videoCount: ch.statistics?.videoCount,
            viewCount: ch.statistics?.viewCount,
            uploadsPlaylistId: ch.contentDetails?.relatedPlaylists?.uploads,
          })) || [],
        };
        break;
      }

      // ============= VIDEO LISTING =============
      case "list_videos": {
        const maxResults = params?.maxResults || 25;
        const pageToken = params?.pageToken || "";
        
        // First get the uploads playlist
        const channelResponse = await fetch(
          `${YT_DATA_API}/channels?part=contentDetails&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!channelResponse.ok) throw new Error("Failed to get channel info");
        const channelData = await channelResponse.json();
        const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
        
        if (!uploadsPlaylistId) {
          result = { videos: [], message: "No uploads found" };
          break;
        }

        const response = await fetch(
          `${YT_DATA_API}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}${pageToken ? `&pageToken=${pageToken}` : ""}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
        const data = await response.json();
        
        // Get video statistics
        const videoIds = data.items?.map((v: any) => v.contentDetails?.videoId).filter(Boolean).join(",");
        let videoStats: Record<string, any> = {};
        
        if (videoIds) {
          const statsResponse = await fetch(
            `${YT_DATA_API}/videos?part=statistics&id=${videoIds}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            videoStats = Object.fromEntries(
              statsData.items?.map((v: any) => [v.id, v.statistics]) || []
            );
          }
        }

        result = {
          videos: data.items?.map((v: any) => ({
            videoId: v.contentDetails?.videoId,
            title: v.snippet?.title,
            description: v.snippet?.description?.substring(0, 200),
            publishedAt: v.snippet?.publishedAt,
            thumbnail: v.snippet?.thumbnails?.medium?.url,
            ...videoStats[v.contentDetails?.videoId],
          })) || [],
          nextPageToken: data.nextPageToken,
          totalResults: data.pageInfo?.totalResults,
        };
        break;
      }

      // ============= ANALYTICS - CHANNEL OVERVIEW =============
      case "get_channel_analytics": {
        const startDate = params?.startDate || getDefaultStartDate(30);
        const endDate = params?.endDate || getDefaultEndDate();

        // Get channel ID first
        const channelResponse = await fetch(
          `${YT_DATA_API}/channels?part=id&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!channelResponse.ok) throw new Error("Failed to get channel ID");
        const channelData = await channelResponse.json();
        const channelId = channelData.items?.[0]?.id;

        const metrics = "views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes,dislikes,comments,shares";
        const response = await fetch(
          `${YT_ANALYTICS_API}/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}&dimensions=day&sort=day`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) {
          const error = await response.text();
          console.error("[YT Analytics] Error:", error);
          throw new Error(`YouTube Analytics API error: ${response.status}`);
        }
        const data = await response.json();
        result = formatAnalyticsResult(data, "daily");
        break;
      }

      // ============= ANALYTICS - VIDEO PERFORMANCE =============
      case "get_video_analytics": {
        const videoId = params?.videoId;
        const startDate = params?.startDate || getDefaultStartDate(30);
        const endDate = params?.endDate || getDefaultEndDate();

        // Get channel ID
        const channelResponse = await fetch(
          `${YT_DATA_API}/channels?part=id&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!channelResponse.ok) throw new Error("Failed to get channel ID");
        const channelData = await channelResponse.json();
        const channelId = channelData.items?.[0]?.id;

        let url = `${YT_ANALYTICS_API}/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration,likes,comments,shares&dimensions=video&sort=-views&maxResults=50`;
        
        if (videoId) {
          url += `&filters=video==${videoId}`;
        }

        const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (!response.ok) throw new Error(`YouTube Analytics API error: ${response.status}`);
        const data = await response.json();
        result = formatAnalyticsResult(data, "by_video");
        break;
      }

      // ============= ANALYTICS - AUDIENCE RETENTION =============
      case "get_audience_retention": {
        const videoId = params?.videoId;
        if (!videoId) throw new Error("videoId is required");

        const channelResponse = await fetch(
          `${YT_DATA_API}/channels?part=id&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!channelResponse.ok) throw new Error("Failed to get channel ID");
        const channelData = await channelResponse.json();
        const channelId = channelData.items?.[0]?.id;

        // Note: audienceWatchRatio is only available for videos, not channel-wide
        const startDate = params?.startDate || getDefaultStartDate(30);
        const endDate = params?.endDate || getDefaultEndDate();

        const response = await fetch(
          `${YT_ANALYTICS_API}/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=averageViewPercentage,averageViewDuration&filters=video==${videoId}&dimensions=elapsedVideoTimeRatio`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        // This endpoint may not be available for all channels
        if (!response.ok) {
          // Fallback to basic metrics
          const fallbackResponse = await fetch(
            `${YT_ANALYTICS_API}/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,averageViewDuration,averageViewPercentage&filters=video==${videoId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (!fallbackResponse.ok) throw new Error(`YouTube Analytics API error: ${fallbackResponse.status}`);
          const fallbackData = await fallbackResponse.json();
          result = formatAnalyticsResult(fallbackData, "retention");
          break;
        }
        
        const data = await response.json();
        result = formatAnalyticsResult(data, "retention");
        break;
      }

      // ============= ANALYTICS - TRAFFIC SOURCES =============
      case "get_traffic_sources": {
        const startDate = params?.startDate || getDefaultStartDate(30);
        const endDate = params?.endDate || getDefaultEndDate();

        const channelResponse = await fetch(
          `${YT_DATA_API}/channels?part=id&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!channelResponse.ok) throw new Error("Failed to get channel ID");
        const channelData = await channelResponse.json();
        const channelId = channelData.items?.[0]?.id;

        const response = await fetch(
          `${YT_ANALYTICS_API}/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched&dimensions=insightTrafficSourceType&sort=-views`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error(`YouTube Analytics API error: ${response.status}`);
        const data = await response.json();
        result = formatAnalyticsResult(data, "traffic_sources");
        break;
      }

      // ============= ANALYTICS - DEMOGRAPHICS =============
      case "get_demographics": {
        const startDate = params?.startDate || getDefaultStartDate(30);
        const endDate = params?.endDate || getDefaultEndDate();

        const channelResponse = await fetch(
          `${YT_DATA_API}/channels?part=id&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!channelResponse.ok) throw new Error("Failed to get channel ID");
        const channelData = await channelResponse.json();
        const channelId = channelData.items?.[0]?.id;

        // Age and gender breakdown
        const response = await fetch(
          `${YT_ANALYTICS_API}/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=ageGroup,gender&sort=gender,ageGroup`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error(`YouTube Analytics API error: ${response.status}`);
        const data = await response.json();
        result = formatAnalyticsResult(data, "demographics");
        break;
      }

      // ============= ANALYTICS - GEOGRAPHY =============
      case "get_geography": {
        const startDate = params?.startDate || getDefaultStartDate(30);
        const endDate = params?.endDate || getDefaultEndDate();

        const channelResponse = await fetch(
          `${YT_DATA_API}/channels?part=id&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!channelResponse.ok) throw new Error("Failed to get channel ID");
        const channelData = await channelResponse.json();
        const channelId = channelData.items?.[0]?.id;

        const response = await fetch(
          `${YT_ANALYTICS_API}/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,averageViewDuration&dimensions=country&sort=-views&maxResults=25`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error(`YouTube Analytics API error: ${response.status}`);
        const data = await response.json();
        result = formatAnalyticsResult(data, "geography");
        break;
      }

      // ============= ANALYTICS - SUBSCRIBER CHANGES =============
      case "get_subscriber_changes": {
        const startDate = params?.startDate || getDefaultStartDate(30);
        const endDate = params?.endDate || getDefaultEndDate();

        const channelResponse = await fetch(
          `${YT_DATA_API}/channels?part=id&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!channelResponse.ok) throw new Error("Failed to get channel ID");
        const channelData = await channelResponse.json();
        const channelId = channelData.items?.[0]?.id;

        const response = await fetch(
          `${YT_ANALYTICS_API}/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=subscribersGained,subscribersLost&dimensions=day&sort=day`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error(`YouTube Analytics API error: ${response.status}`);
        const data = await response.json();
        result = formatAnalyticsResult(data, "subscribers");
        break;
      }

      // ============= ANALYTICS - REVENUE (for monetized channels) =============
      case "get_revenue": {
        const startDate = params?.startDate || getDefaultStartDate(30);
        const endDate = params?.endDate || getDefaultEndDate();

        const channelResponse = await fetch(
          `${YT_DATA_API}/channels?part=id&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!channelResponse.ok) throw new Error("Failed to get channel ID");
        const channelData = await channelResponse.json();
        const channelId = channelData.items?.[0]?.id;

        const response = await fetch(
          `${YT_ANALYTICS_API}/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=estimatedRevenue,estimatedAdRevenue,grossRevenue,cpm,playbackBasedCpm,monetizedPlaybacks&dimensions=day&sort=day`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        if (!response.ok) {
          // Revenue data requires monetization - return helpful message
          result = {
            error: "Revenue data unavailable",
            message: "Revenue metrics are only available for channels in the YouTube Partner Program with monetization enabled.",
          };
          break;
        }
        
        const data = await response.json();
        result = formatAnalyticsResult(data, "revenue");
        break;
      }

      // ============= ANALYTICS - TOP VIDEOS =============
      case "get_top_videos": {
        const startDate = params?.startDate || getDefaultStartDate(30);
        const endDate = params?.endDate || getDefaultEndDate();
        const limit = params?.limit || 10;

        const channelResponse = await fetch(
          `${YT_DATA_API}/channels?part=id&mine=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!channelResponse.ok) throw new Error("Failed to get channel ID");
        const channelData = await channelResponse.json();
        const channelId = channelData.items?.[0]?.id;

        const response = await fetch(
          `${YT_ANALYTICS_API}/reports?ids=channel==${channelId}&startDate=${startDate}&endDate=${endDate}&metrics=views,estimatedMinutesWatched,likes,comments,averageViewDuration,subscribersGained&dimensions=video&sort=-views&maxResults=${limit}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error(`YouTube Analytics API error: ${response.status}`);
        const data = await response.json();
        
        // Get video titles
        const videoIds = data.rows?.map((r: any) => r[0]).join(",");
        let videoInfo: Record<string, any> = {};
        
        if (videoIds) {
          const videosResponse = await fetch(
            `${YT_DATA_API}/videos?part=snippet&id=${videoIds}`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          if (videosResponse.ok) {
            const videosData = await videosResponse.json();
            videoInfo = Object.fromEntries(
              videosData.items?.map((v: any) => [v.id, v.snippet]) || []
            );
          }
        }

        result = {
          ...formatAnalyticsResult(data, "top_videos"),
          videoInfo,
        };
        break;
      }

      // ============= PLAYLISTS =============
      case "list_playlists": {
        const maxResults = params?.maxResults || 25;
        const response = await fetch(
          `${YT_DATA_API}/playlists?part=snippet,contentDetails&mine=true&maxResults=${maxResults}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
        const data = await response.json();
        result = {
          playlists: data.items?.map((p: any) => ({
            id: p.id,
            title: p.snippet?.title,
            description: p.snippet?.description,
            thumbnail: p.snippet?.thumbnails?.medium?.url,
            itemCount: p.contentDetails?.itemCount,
            publishedAt: p.snippet?.publishedAt,
          })) || [],
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[YouTube Analytics] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper functions
function getDefaultStartDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

function getDefaultEndDate(): string {
  return new Date().toISOString().split("T")[0];
}

function formatAnalyticsResult(data: any, type: string): any {
  const columnHeaders = data.columnHeaders || [];
  const rows = data.rows || [];

  const columns = columnHeaders.map((h: any) => h.name);
  const formattedRows = rows.map((row: any) => {
    const obj: Record<string, any> = {};
    columns.forEach((col: string, i: number) => {
      obj[col] = row[i];
    });
    return obj;
  });

  return {
    type,
    columns,
    rowCount: rows.length,
    rows: formattedRows,
  };
}

async function refreshGoogleToken(
  serviceClient: any,
  userId: string,
  refreshToken: string
): Promise<string | null> {
  try {
    const clientId = Deno.env.get("GOOGLEOAUTH2API_CLIENT_ID")?.trim();
    const clientSecret = Deno.env.get("GOOGLEOAUTH2API_CLIENT_SECRET")?.trim();

    if (!clientId || !clientSecret) {
      console.error("[YT] Missing Google OAuth credentials");
      return null;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[YT] Token refresh failed:", error);
      return null;
    }

    const tokens = await response.json();
    await updateRefreshedToken(serviceClient, userId, "googleOAuth2Api", tokens.access_token, tokens.expires_in, "youtube");
    return tokens.access_token;
  } catch (error) {
    console.error("[YT] Token refresh error:", error);
    return null;
  }
}
