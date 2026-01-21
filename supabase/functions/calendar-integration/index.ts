import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getGoogleAccessToken(supabase: any, userId: string): Promise<string | null> {
  const { data: credential, error } = await supabase
    .from("user_credentials")
    .select("access_token, refresh_token, expires_at")
    .eq("user_id", userId)
    .eq("credential_type", "google")
    .single();

  if (error || !credential) {
    return null;
  }

  const expiresAt = new Date(credential.expires_at);
  if (expiresAt <= new Date() && credential.refresh_token) {
    return await refreshGoogleToken(supabase, userId, credential.refresh_token);
  }

  return credential.access_token;
}

async function refreshGoogleToken(supabase: any, userId: string, refreshToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: Deno.env.get("GOOGLEOAUTH2API_CLIENT_ID") || "",
        client_secret: Deno.env.get("GOOGLEOAUTH2API_CLIENT_SECRET") || "",
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    
    await supabase
      .from("user_credentials")
      .update({
        access_token: data.access_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      })
      .eq("user_id", userId)
      .eq("credential_type", "google");

    return data.access_token;
  } catch {
    return null;
  }
}

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

    // For internal calendar actions, use local database
    if (action === "list_local" || action === "create_local") {
      return await handleLocalCalendar(supabase, user.id, action, params);
    }

    // For Google Calendar, get access token
    const accessToken = await getGoogleAccessToken(supabase, user.id);
    if (!accessToken) {
      // Fall back to local calendar
      return await handleLocalCalendar(supabase, user.id, action, params);
    }

    let result;

    switch (action) {
      case "list": {
        const timeMin = params?.timeMin || new Date().toISOString();
        const timeMax = params?.timeMax || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const maxResults = params?.maxResults || 10;

        const url = new URL("https://www.googleapis.com/calendar/v3/calendars/primary/events");
        url.searchParams.set("timeMin", timeMin);
        url.searchParams.set("timeMax", timeMax);
        url.searchParams.set("maxResults", String(maxResults));
        url.searchParams.set("singleEvents", "true");
        url.searchParams.set("orderBy", "startTime");

        const response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(`Google Calendar API error: ${response.status}`);
        }

        const data = await response.json();
        result = {
          events: (data.items || []).map((event: any) => ({
            id: event.id,
            title: event.summary || "(no title)",
            description: event.description || "",
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            allDay: !event.start?.dateTime,
            location: event.location || "",
          })),
        };
        break;
      }

      case "create": {
        const { title, startTime, endTime, description, location } = params;
        if (!title || !startTime || !endTime) {
          throw new Error("title, startTime, and endTime are required");
        }

        const response = await fetch(
          "https://www.googleapis.com/calendar/v3/calendars/primary/events",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              summary: title,
              description: description || "",
              location: location || "",
              start: { dateTime: startTime, timeZone: "UTC" },
              end: { dateTime: endTime, timeZone: "UTC" },
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to create event: ${response.status}`);
        }

        const created = await response.json();
        result = {
          success: true,
          event: {
            id: created.id,
            title: created.summary,
            start: created.start?.dateTime,
            end: created.end?.dateTime,
          },
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log execution
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

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

async function handleLocalCalendar(supabase: any, userId: string, action: string, params: any) {
  let result;

  if (action === "list" || action === "list_local") {
    const timeMin = params?.timeMin || new Date().toISOString();
    const timeMax = params?.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
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
      })),
      source: "local",
    };
  } else if (action === "create" || action === "create_local") {
    const { title, startTime, endTime, description, allDay, color } = params;
    
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: userId,
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
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
