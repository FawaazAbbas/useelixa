import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials, updateRefreshedToken } from "../_shared/credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

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
    console.log(`[Calendar] Action: ${action}, User: ${user.id}`);

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let result;

    switch (action) {
      // Local calendar operations
      case "list":
      case "list_local": {
        const timeMin = params?.timeMin || new Date().toISOString();
        const timeMax = params?.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id)
          .gte("start_time", timeMin)
          .lte("end_time", timeMax)
          .order("start_time", { ascending: true });

        if (error) throw error;

        result = {
          events: (data || []).map((e: any) => ({
            id: e.id,
            title: e.title,
            description: e.description,
            start: e.start_time,
            end: e.end_time,
            allDay: e.all_day,
            color: e.color,
            source: "local",
          })),
          source: "local",
        };
        break;
      }

      case "create":
      case "create_local": {
        const { title, startTime, endTime, description, allDay, color } = params;
        
        const { data, error } = await supabase
          .from("calendar_events")
          .insert({
            user_id: user.id,
            title,
            description: description || "",
            start_time: startTime,
            end_time: endTime,
            all_day: allDay || false,
            color: color || null,
          })
          .select()
          .single();

        if (error) throw error;

        result = {
          success: true,
          event: data,
          source: "local",
        };
        break;
      }

      // Google Calendar operations
      case "list_google": {
        const accessToken = await getGoogleAccessToken(serviceSupabase, user.id);
        if (!accessToken) {
          throw new Error("Google Calendar not connected. Please connect your Google account first.");
        }

        const timeMin = params?.timeMin || new Date().toISOString();
        const timeMax = params?.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const queryParams = new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: "true",
          orderBy: "startTime",
          maxResults: (params?.maxResults || 50).toString(),
        });

        const response = await fetch(
          `${GOOGLE_CALENDAR_API}/calendars/primary/events?${queryParams}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("[Calendar] Google API error:", error);
          throw new Error(`Google Calendar API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          events: (data.items || []).map((e: any) => ({
            id: e.id,
            title: e.summary || "(No title)",
            description: e.description || "",
            start: e.start?.dateTime || e.start?.date,
            end: e.end?.dateTime || e.end?.date,
            allDay: !!e.start?.date,
            location: e.location,
            htmlLink: e.htmlLink,
            source: "google",
          })),
          source: "google",
        };
        break;
      }

      case "create_google": {
        const accessToken = await getGoogleAccessToken(serviceSupabase, user.id);
        if (!accessToken) {
          throw new Error("Google Calendar not connected.");
        }

        const { title, startTime, endTime, description, location, allDay } = params;

        const event: any = {
          summary: title,
          description: description || "",
          location: location || "",
        };

        if (allDay) {
          event.start = { date: startTime.split("T")[0] };
          event.end = { date: endTime.split("T")[0] };
        } else {
          event.start = { dateTime: startTime, timeZone: params?.timeZone || "UTC" };
          event.end = { dateTime: endTime, timeZone: params?.timeZone || "UTC" };
        }

        const response = await fetch(`${GOOGLE_CALENDAR_API}/calendars/primary/events`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[Calendar] Create error:", error);
          throw new Error(`Failed to create event: ${response.status}`);
        }

        const created = await response.json();
        result = {
          success: true,
          event: {
            id: created.id,
            title: created.summary,
            start: created.start?.dateTime || created.start?.date,
            end: created.end?.dateTime || created.end?.date,
            htmlLink: created.htmlLink,
          },
          source: "google",
        };
        break;
      }

      case "list_combined": {
        // Get both local and Google events
        const timeMin = params?.timeMin || new Date().toISOString();
        const timeMax = params?.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Fetch local events
        const { data: localData } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", user.id)
          .gte("start_time", timeMin)
          .lte("end_time", timeMax)
          .order("start_time", { ascending: true });

        const localEvents = (localData || []).map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          start: e.start_time,
          end: e.end_time,
          allDay: e.all_day,
          color: e.color,
          source: "local",
        }));

        // Try to fetch Google events
        let googleEvents: any[] = [];
        try {
          const accessToken = await getGoogleAccessToken(serviceSupabase, user.id);
          if (accessToken) {
            const queryParams = new URLSearchParams({
              timeMin,
              timeMax,
              singleEvents: "true",
              orderBy: "startTime",
              maxResults: "50",
            });

            const response = await fetch(
              `${GOOGLE_CALENDAR_API}/calendars/primary/events?${queryParams}`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            if (response.ok) {
              const data = await response.json();
              googleEvents = (data.items || []).map((e: any) => ({
                id: e.id,
                title: e.summary || "(No title)",
                description: e.description || "",
                start: e.start?.dateTime || e.start?.date,
                end: e.end?.dateTime || e.end?.date,
                allDay: !!e.start?.date,
                location: e.location,
                htmlLink: e.htmlLink,
                source: "google",
              }));
            }
          }
        } catch (e) {
          console.warn("[Calendar] Could not fetch Google events:", e);
        }

        // Combine and sort
        const allEvents = [...localEvents, ...googleEvents].sort((a, b) => 
          new Date(a.start).getTime() - new Date(b.start).getTime()
        );

        result = {
          events: allEvents,
          sources: {
            local: localEvents.length,
            google: googleEvents.length,
          },
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log execution
    await serviceSupabase.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: `calendar_${action}`,
      success: true,
      input_summary: JSON.stringify(params).substring(0, 500),
      output_summary: JSON.stringify(result).substring(0, 500),
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Calendar integration error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function getGoogleAccessToken(supabase: any, userId: string): Promise<string | null> {
  const creds = await getDecryptedCredentials(supabase, userId, "googleOAuth2Api");
  if (!creds) return null;

  // Check if token is expired
  if (creds.expires_at && new Date(creds.expires_at) < new Date()) {
    console.log("[Calendar] Google token expired, refreshing...");
    if (!creds.refresh_token) {
      console.error("[Calendar] No refresh token available");
      return null;
    }
    return await refreshGoogleToken(supabase, userId, creds.refresh_token);
  }

  return creds.access_token;
}

async function refreshGoogleToken(
  supabase: any,
  userId: string,
  refreshToken: string
): Promise<string | null> {
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("[Calendar] Missing refresh credentials");
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
      console.error("[Calendar] Token refresh failed:", await response.text());
      return null;
    }

    const tokens = await response.json();
    
    await updateRefreshedToken(
      supabase,
      userId,
      "googleOAuth2Api",
      tokens.access_token,
      tokens.expires_in
    );

    console.log("[Calendar] Google token refreshed successfully");
    return tokens.access_token;
  } catch (e) {
    console.error("[Calendar] Refresh error:", e);
    return null;
  }
}
