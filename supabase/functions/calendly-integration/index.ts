import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CALENDLY_API_BASE = "https://api.calendly.com";

interface CalendlyCredentials {
  accessToken: string;
}

/**
 * Retrieve and decrypt Calendly credentials for a user
 */
async function getCalendlyCredentials(
  supabase: any,
  userId: string
): Promise<CalendlyCredentials | null> {
  const { data: credentials, error } = await supabase
    .from("user_credentials")
    .select("*")
    .eq("user_id", userId)
    .eq("credential_type", "calendlyApi")
    .maybeSingle();

  if (error || !credentials) {
    console.log("[Calendly] No credentials found for user:", userId);
    return null;
  }

  // Handle encrypted tokens
  if (credentials.is_encrypted && credentials.encrypted_access_token) {
    try {
      const { decryptToken } = await import("../_shared/crypto.ts");
      const accessToken = await decryptToken(credentials.encrypted_access_token);
      return { accessToken };
    } catch (decryptError) {
      console.error("[Calendly] Failed to decrypt token:", decryptError);
      return null;
    }
  }

  // Handle plaintext tokens
  if (credentials.access_token) {
    return { accessToken: credentials.access_token };
  }

  return null;
}

/**
 * Make a request to the Calendly API
 */
async function callCalendlyAPI(
  accessToken: string,
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<any> {
  const url = `${CALENDLY_API_BASE}${endpoint}`;
  console.log(`[Calendly] Calling API: ${method} ${endpoint}`);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body && (method === "POST" || method === "PATCH")) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Calendly] API error: ${response.status}`, errorBody);
    throw new Error(`Calendly API error: ${response.status} - ${errorBody}`);
  }

  return await response.json();
}

/**
 * Format event types for display
 */
function formatEventTypes(collection: any[]): any[] {
  return collection.map((et) => ({
    uri: et.uri,
    name: et.name,
    description_plain: et.description_plain,
    duration: et.duration,
    kind: et.kind,
    scheduling_url: et.scheduling_url,
    active: et.active,
    color: et.color,
  }));
}

/**
 * Format scheduled events for display
 */
function formatScheduledEvents(collection: any[]): any[] {
  return collection.map((event) => ({
    uri: event.uri,
    name: event.name,
    status: event.status,
    start_time: event.start_time,
    end_time: event.end_time,
    event_type: event.event_type,
    location: event.location,
    invitees_counter: event.invitees_counter,
    created_at: event.created_at,
    updated_at: event.updated_at,
    event_memberships: event.event_memberships,
  }));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header and extract user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Parse request
    const { action, params } = await req.json();
    console.log(`[Calendly] Action: ${action}, User: ${userId}`);

    // Get Calendly credentials
    const credentials = await getCalendlyCredentials(supabase, userId);
    if (!credentials) {
      return new Response(
        JSON.stringify({
          error: "Calendly not connected. Please connect Calendly in your settings.",
          notConnected: true,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: any;

    switch (action) {
      case "get_user": {
        // Get current user info (needed for user URI)
        const response = await callCalendlyAPI(credentials.accessToken, "/users/me");
        result = {
          uri: response.resource.uri,
          name: response.resource.name,
          email: response.resource.email,
          scheduling_url: response.resource.scheduling_url,
          timezone: response.resource.timezone,
          avatar_url: response.resource.avatar_url,
          created_at: response.resource.created_at,
        };
        break;
      }

      case "list_event_types": {
        // First get the user URI
        const userResponse = await callCalendlyAPI(credentials.accessToken, "/users/me");
        const userUri = userResponse.resource.uri;

        // Then get event types
        const eventTypesUrl = `/event_types?user=${encodeURIComponent(userUri)}&count=${params?.limit || 25}`;
        const response = await callCalendlyAPI(credentials.accessToken, eventTypesUrl);

        result = {
          event_types: formatEventTypes(response.collection),
          count: response.collection.length,
          pagination: response.pagination,
        };
        break;
      }

      case "list_scheduled_events": {
        // First get the user URI
        const userResponse = await callCalendlyAPI(credentials.accessToken, "/users/me");
        const userUri = userResponse.resource.uri;

        // Build query params
        let eventsUrl = `/scheduled_events?user=${encodeURIComponent(userUri)}`;

        if (params?.status) {
          eventsUrl += `&status=${params.status}`;
        }
        if (params?.min_start_time) {
          eventsUrl += `&min_start_time=${params.min_start_time}`;
        } else {
          // Default to now
          eventsUrl += `&min_start_time=${new Date().toISOString()}`;
        }
        if (params?.max_start_time) {
          eventsUrl += `&max_start_time=${params.max_start_time}`;
        }
        eventsUrl += `&count=${params?.limit || 25}`;
        eventsUrl += `&sort=start_time:asc`;

        const response = await callCalendlyAPI(credentials.accessToken, eventsUrl);

        result = {
          events: formatScheduledEvents(response.collection),
          count: response.collection.length,
          pagination: response.pagination,
        };
        break;
      }

      case "get_event": {
        if (!params?.event_uuid) {
          return new Response(
            JSON.stringify({ error: "event_uuid is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const response = await callCalendlyAPI(
          credentials.accessToken,
          `/scheduled_events/${params.event_uuid}`
        );

        result = {
          event: formatScheduledEvents([response.resource])[0],
        };
        break;
      }

      case "get_event_invitees": {
        if (!params?.event_uuid) {
          return new Response(
            JSON.stringify({ error: "event_uuid is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const response = await callCalendlyAPI(
          credentials.accessToken,
          `/scheduled_events/${params.event_uuid}/invitees`
        );

        result = {
          invitees: response.collection.map((inv: any) => ({
            uri: inv.uri,
            name: inv.name,
            email: inv.email,
            status: inv.status,
            timezone: inv.timezone,
            created_at: inv.created_at,
            questions_and_answers: inv.questions_and_answers,
          })),
          count: response.collection.length,
        };
        break;
      }

      case "check_availability": {
        if (!params?.event_type_uri) {
          return new Response(
            JSON.stringify({ error: "event_type_uri is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const startTime = params?.start_time || new Date().toISOString();
        const endTime = params?.end_time || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const response = await callCalendlyAPI(
          credentials.accessToken,
          `/event_type_available_times?event_type=${encodeURIComponent(params.event_type_uri)}&start_time=${startTime}&end_time=${endTime}`
        );

        result = {
          available_times: response.collection.map((slot: any) => ({
            status: slot.status,
            start_time: slot.start_time,
            invitees_remaining: slot.invitees_remaining,
          })),
          count: response.collection.length,
        };
        break;
      }

      case "cancel_event": {
        if (!params?.event_uuid) {
          return new Response(
            JSON.stringify({ error: "event_uuid is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get event first to get cancellation URL
        const eventResponse = await callCalendlyAPI(
          credentials.accessToken,
          `/scheduled_events/${params.event_uuid}`
        );

        // Cancel the event
        await callCalendlyAPI(
          credentials.accessToken,
          `/scheduled_events/${params.event_uuid}/cancellation`,
          "POST",
          { reason: params?.reason || "Cancelled via Elixa" }
        );

        result = {
          success: true,
          message: `Event "${eventResponse.resource.name}" has been cancelled`,
        };
        break;
      }

      case "check_connection": {
        try {
          await callCalendlyAPI(credentials.accessToken, "/users/me");
          result = { connected: true };
        } catch (e: unknown) {
          result = { connected: false, error: e instanceof Error ? e.message : "Unknown error" };
        }
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Log successful tool execution
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("org_id")
        .eq("id", userId)
        .maybeSingle();

      if (profile?.org_id) {
        await supabase.from("tool_execution_log").insert({
          user_id: userId,
          org_id: profile.org_id,
          tool_name: `calendly_${action}`,
          success: true,
          execution_time_ms: 0,
        });
      }
    } catch (logError) {
      console.error("[Calendly] Failed to log execution:", logError);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("[Calendly] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
