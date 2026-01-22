import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getFreshToken, withTokenRefresh } from "../_shared/oauth-retry.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

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
    console.log(`[Microsoft] Action: ${action}, User: ${user.id}`);

    const retryConfig = {
      userId: user.id,
      credentialType: "microsoftOAuth2Api",
      bundleType: null,
    };

    const getToken = () => getFreshToken(supabase, user.id, "microsoftOAuth2Api", null);

    let result;

    switch (action) {
      // ==================== OUTLOOK EMAIL ====================
      case "list_emails": {
        const maxResults = params?.maxResults || 10;
        const folder = params?.folder || "inbox";
        
        const url = `${GRAPH_BASE_URL}/me/mailFolders/${folder}/messages?$top=${maxResults}&$orderby=receivedDateTime desc&$select=id,subject,from,receivedDateTime,isRead,bodyPreview`;

        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        if (error) throw new Error(error);

        result = {
          messages: (data?.value || []).map((msg: any) => ({
            id: msg.id,
            subject: msg.subject || "(no subject)",
            from: msg.from?.emailAddress?.address || "",
            fromName: msg.from?.emailAddress?.name || "",
            date: msg.receivedDateTime,
            isRead: msg.isRead,
            snippet: msg.bodyPreview || "",
          })),
        };
        break;
      }

      case "get_email": {
        const { messageId } = params;
        if (!messageId) throw new Error("messageId is required");

        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(
            `${GRAPH_BASE_URL}/me/messages/${messageId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

        if (error) throw new Error(error);
        result = data;
        break;
      }

      case "send_email": {
        const { to, subject, body, cc, bcc } = params;
        if (!to || !subject || !body) {
          throw new Error("to, subject, and body are required");
        }

        const message = {
          message: {
            subject,
            body: { contentType: "HTML", content: body },
            toRecipients: to.split(",").map((email: string) => ({
              emailAddress: { address: email.trim() },
            })),
            ccRecipients: cc ? cc.split(",").map((email: string) => ({
              emailAddress: { address: email.trim() },
            })) : [],
            bccRecipients: bcc ? bcc.split(",").map((email: string) => ({
              emailAddress: { address: email.trim() },
            })) : [],
          },
          saveToSentItems: true,
        };

        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(
            `${GRAPH_BASE_URL}/me/sendMail`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(message),
            }
          )
        );

        if (error) throw new Error(error);
        result = { success: true, message: "Email sent successfully" };
        break;
      }

      // ==================== CALENDAR ====================
      case "list_calendar_events": {
        const startDateTime = params?.startDateTime || new Date().toISOString();
        const endDateTime = params?.endDateTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const maxResults = params?.maxResults || 50;

        const url = `${GRAPH_BASE_URL}/me/calendarView?startDateTime=${startDateTime}&endDateTime=${endDateTime}&$top=${maxResults}&$orderby=start/dateTime&$select=id,subject,start,end,location,isAllDay,organizer`;

        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
              Prefer: 'outlook.timezone="UTC"',
            },
          })
        );

        if (error) throw new Error(error);

        result = {
          events: (data?.value || []).map((event: any) => ({
            id: event.id,
            title: event.subject,
            start: event.start?.dateTime,
            end: event.end?.dateTime,
            location: event.location?.displayName || "",
            isAllDay: event.isAllDay,
            organizer: event.organizer?.emailAddress?.address || "",
          })),
        };
        break;
      }

      case "create_calendar_event": {
        const { title, start, end, location, description, attendees } = params;
        if (!title || !start || !end) {
          throw new Error("title, start, and end are required");
        }

        const event = {
          subject: title,
          start: { dateTime: start, timeZone: "UTC" },
          end: { dateTime: end, timeZone: "UTC" },
          location: location ? { displayName: location } : undefined,
          body: description ? { contentType: "HTML", content: description } : undefined,
          attendees: attendees ? attendees.split(",").map((email: string) => ({
            emailAddress: { address: email.trim() },
            type: "required",
          })) : [],
        };

        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(
            `${GRAPH_BASE_URL}/me/events`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(event),
            }
          )
        );

        if (error) throw new Error(error);
        result = { success: true, eventId: data?.id, message: "Event created successfully" };
        break;
      }

      // ==================== ONEDRIVE ====================
      case "list_files": {
        const path = params?.path || "root";
        const maxResults = params?.maxResults || 25;

        const url = path === "root"
          ? `${GRAPH_BASE_URL}/me/drive/root/children?$top=${maxResults}&$select=id,name,size,lastModifiedDateTime,folder,file`
          : `${GRAPH_BASE_URL}/me/drive/items/${path}/children?$top=${maxResults}&$select=id,name,size,lastModifiedDateTime,folder,file`;

        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        if (error) throw new Error(error);

        result = {
          files: (data?.value || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            size: item.size,
            lastModified: item.lastModifiedDateTime,
            isFolder: !!item.folder,
            mimeType: item.file?.mimeType,
          })),
        };
        break;
      }

      case "get_file": {
        const { fileId } = params;
        if (!fileId) throw new Error("fileId is required");

        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(
            `${GRAPH_BASE_URL}/me/drive/items/${fileId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

        if (error) throw new Error(error);
        result = data;
        break;
      }

      case "download_file": {
        const { fileId } = params;
        if (!fileId) throw new Error("fileId is required");

        // Get download URL
        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(
            `${GRAPH_BASE_URL}/me/drive/items/${fileId}?$select=@microsoft.graph.downloadUrl,name`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

        if (error) throw new Error(error);
        
        result = {
          downloadUrl: data["@microsoft.graph.downloadUrl"],
          name: data.name,
        };
        break;
      }

      case "search_files": {
        const { query } = params;
        if (!query) throw new Error("query is required");

        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(
            `${GRAPH_BASE_URL}/me/drive/root/search(q='${encodeURIComponent(query)}')`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

        if (error) throw new Error(error);

        result = {
          files: (data?.value || []).map((item: any) => ({
            id: item.id,
            name: item.name,
            size: item.size,
            lastModified: item.lastModifiedDateTime,
            isFolder: !!item.folder,
            path: item.parentReference?.path,
          })),
        };
        break;
      }

      // ==================== USER PROFILE ====================
      case "get_profile": {
        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(
            `${GRAPH_BASE_URL}/me?$select=displayName,mail,userPrincipalName,jobTitle,department`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

        if (error) throw new Error(error);
        result = data;
        break;
      }

      case "check_connection": {
        const token = await getToken();
        result = { connected: !!token };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log the tool execution
    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceSupabase.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: `microsoft_${action}`,
      success: true,
      input_summary: JSON.stringify(params).substring(0, 500),
      output_summary: JSON.stringify(result).substring(0, 500),
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Microsoft integration error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});