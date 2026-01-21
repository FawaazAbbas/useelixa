import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getFreshToken, withTokenRefresh } from "../_shared/oauth-retry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const retryConfig = {
      userId: user.id,
      credentialType: "googleOAuth2Api",
      bundleType: "calendar",
    };

    const getToken = () => getFreshToken(supabase, user.id, "googleOAuth2Api", "calendar");
    
    // Check if user has Google Calendar connected
    const accessToken = await getToken();
    if (!accessToken) {
      // Fall back to local calendar
      console.log("[Calendar] No Google Calendar token, falling back to local");
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

        const { data, error, tokenRefreshed } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(url.toString(), {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        if (error) {
          console.log(`[Calendar] Google Calendar error: ${error}, falling back to local`);
          return await handleLocalCalendar(supabase, user.id, action, params);
        }

        if (tokenRefreshed) {
          console.log("[Calendar] Token was refreshed during list operation");
        }

        result = {
          events: (data?.items || []).map((event: any) => ({
            id: event.id,
            title: event.summary || "(no title)",
            description: event.description || "",
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date,
            allDay: !event.start?.dateTime,
            location: event.location || "",
          })),
          source: "google",
        };
        break;
      }

      case "create": {
        const { title, startTime, endTime, description, location } = params;
        if (!title || !startTime || !endTime) {
          throw new Error("title, startTime, and endTime are required");
        }

        const { data, error, tokenRefreshed } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
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
          )
        );

        if (error) {
          console.log(`[Calendar] Failed to create Google event: ${error}, trying local`);
          return await handleLocalCalendar(supabase, user.id, "create_local", params);
        }

        if (tokenRefreshed) {
          console.log("[Calendar] Token was refreshed during create operation");
        }

        result = {
          success: true,
          event: {
            id: data.id,
            title: data.summary,
            start: data.start?.dateTime,
            end: data.end?.dateTime,
          },
          source: "google",
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
