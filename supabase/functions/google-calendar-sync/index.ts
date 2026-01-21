import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

async function refreshGoogleToken(refreshToken: string): Promise<string | null> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("[GoogleCalendarSync] Missing Google OAuth credentials");
    return null;
  }

  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      console.error("[GoogleCalendarSync] Token refresh failed:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("[GoogleCalendarSync] Token refresh error:", error);
    return null;
  }
}

async function getGoogleCalendarCredentials(supabase: any, userId: string) {
  const { data: credentials, error } = await supabase
    .from("user_credentials")
    .select("*")
    .eq("user_id", userId)
    .or("credential_type.eq.google_calendar,bundle_type.eq.google_calendar")
    .single();

  if (error || !credentials) {
    // Try getting from google bundle
    const { data: bundleCredentials } = await supabase
      .from("user_credentials")
      .select("*")
      .eq("user_id", userId)
      .eq("credential_type", "google")
      .single();

    if (!bundleCredentials) {
      return null;
    }

    // Check if calendar scope is included
    const scopes = bundleCredentials.scopes || [];
    if (!scopes.some((s: string) => s.includes("calendar"))) {
      return null;
    }

    return bundleCredentials;
  }

  return credentials;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "User not authenticated" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const credentials = await getGoogleCalendarCredentials(supabase, user.id);
    if (!credentials) {
      return new Response(
        JSON.stringify({ 
          error: "Google Calendar not connected",
          connected: false,
          events: [] 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Refresh token if needed
    let accessToken = credentials.access_token;
    if (credentials.expires_at && new Date(credentials.expires_at) < new Date()) {
      if (credentials.refresh_token) {
        accessToken = await refreshGoogleToken(credentials.refresh_token);
        if (!accessToken) {
          return new Response(
            JSON.stringify({ 
              error: "Failed to refresh Google token. Please reconnect Google Calendar.",
              connected: false,
              events: []
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update the stored token
        await supabase
          .from("user_credentials")
          .update({ 
            access_token: accessToken,
            expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
          })
          .eq("id", credentials.id);
      }
    }

    const { action, params } = await req.json();
    console.log(`[GoogleCalendarSync] Action: ${action}`, params);

    let result;

    switch (action) {
      case "list_events": {
        const timeMin = params?.timeMin || new Date().toISOString();
        const timeMax = params?.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        const maxResults = params?.maxResults || 50;

        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
          `timeMin=${encodeURIComponent(timeMin)}&` +
          `timeMax=${encodeURIComponent(timeMax)}&` +
          `maxResults=${maxResults}&` +
          `singleEvents=true&` +
          `orderBy=startTime`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );

        if (!calendarResponse.ok) {
          const errorText = await calendarResponse.text();
          console.error("[GoogleCalendarSync] API Error:", errorText);
          throw new Error(`Google Calendar API error: ${calendarResponse.status}`);
        }

        const calendarData = await calendarResponse.json();
        
        result = {
          connected: true,
          account: credentials.account_email,
          events: (calendarData.items || []).map((event: any) => ({
            id: event.id,
            title: event.summary || "Untitled",
            description: event.description || null,
            start_time: event.start?.dateTime || event.start?.date,
            end_time: event.end?.dateTime || event.end?.date,
            all_day: !event.start?.dateTime,
            location: event.location,
            attendees: event.attendees?.map((a: any) => a.email) || [],
            htmlLink: event.htmlLink,
            source: "google",
          })),
        };
        break;
      }

      case "check_connection": {
        result = {
          connected: true,
          account: credentials.account_email,
        };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[GoogleCalendarSync] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        connected: false,
        events: []
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});