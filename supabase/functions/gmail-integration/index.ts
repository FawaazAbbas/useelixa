import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials, updateRefreshedToken } from "../_shared/credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

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
    console.log(`[Gmail] Action: ${action}, User: ${user.id}`);

    // Get Google OAuth credentials
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Try Gmail-specific credentials first, then combined bundles, then fallback to general Google OAuth
    let creds = await getDecryptedCredentials(serviceClient, user.id, "googleOAuth2Api", "gmail");
    if (!creds) {
      // Try combined gmail_calendar bundle
      creds = await getDecryptedCredentials(serviceClient, user.id, "googleOAuth2Api", "gmail_calendar");
    }
    if (!creds) {
      // Try google_calendar bundle (may have gmail scope included)
      creds = await getDecryptedCredentials(serviceClient, user.id, "googleOAuth2Api", "google_calendar");
    }
    if (!creds) {
      // Fallback to generic Google OAuth without bundle type
      creds = await getDecryptedCredentials(serviceClient, user.id, "googleOAuth2Api", null);
    }
    if (!creds) {
      throw new Error("Google account not connected. Please connect your Gmail account first.");
    }

    let accessToken = creds.access_token;

    // Check if token is expired and refresh if needed
    if (creds.expires_at && new Date(creds.expires_at) < new Date()) {
      console.log("[Gmail] Token expired, refreshing...");
      if (!creds.refresh_token) {
        throw new Error("No refresh token available. Please reconnect your Google account.");
      }
      const refreshed = await refreshGoogleToken(serviceClient, user.id, creds.refresh_token);
      if (!refreshed) {
        throw new Error("Failed to refresh Google token. Please reconnect your account.");
      }
      accessToken = refreshed;
    }

    let result;

    switch (action) {
      case "list": {
        const maxResults = params?.maxResults || 20;
        const query = params?.query || "";
        const labelIds = params?.labelIds || ["INBOX"];
        
        const queryParams = new URLSearchParams({
          maxResults: maxResults.toString(),
          labelIds: labelIds.join(","),
        });
        if (query) queryParams.append("q", query);

        const response = await fetch(`${GMAIL_API_BASE}/messages?${queryParams}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[Gmail] List error:", error);
          throw new Error(`Gmail API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Fetch message details for each message
        const messages = await Promise.all(
          (data.messages || []).slice(0, 10).map(async (msg: { id: string }) => {
            const detailResponse = await fetch(
              `${GMAIL_API_BASE}/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (detailResponse.ok) {
              const detail = await detailResponse.json();
              const headers = detail.payload?.headers || [];
              return {
                id: detail.id,
                threadId: detail.threadId,
                snippet: detail.snippet,
                from: headers.find((h: any) => h.name === "From")?.value || "",
                subject: headers.find((h: any) => h.name === "Subject")?.value || "",
                date: headers.find((h: any) => h.name === "Date")?.value || "",
                labelIds: detail.labelIds || [],
              };
            }
            return { id: msg.id, error: "Failed to fetch details" };
          })
        );

        result = {
          messages,
          nextPageToken: data.nextPageToken,
          resultSizeEstimate: data.resultSizeEstimate,
        };
        break;
      }

      case "read": {
        const messageId = params?.messageId;
        if (!messageId) throw new Error("messageId is required");

        const response = await fetch(`${GMAIL_API_BASE}/messages/${messageId}?format=full`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch message: ${response.status}`);
        }

        const message = await response.json();
        const headers = message.payload?.headers || [];
        
        // Extract body content
        let body = "";
        if (message.payload?.body?.data) {
          body = atob(message.payload.body.data.replace(/-/g, "+").replace(/_/g, "/"));
        } else if (message.payload?.parts) {
          const textPart = message.payload.parts.find((p: any) => p.mimeType === "text/plain");
          if (textPart?.body?.data) {
            body = atob(textPart.body.data.replace(/-/g, "+").replace(/_/g, "/"));
          }
        }

        result = {
          id: message.id,
          threadId: message.threadId,
          from: headers.find((h: any) => h.name === "From")?.value || "",
          to: headers.find((h: any) => h.name === "To")?.value || "",
          subject: headers.find((h: any) => h.name === "Subject")?.value || "",
          date: headers.find((h: any) => h.name === "Date")?.value || "",
          body,
          labelIds: message.labelIds || [],
        };
        break;
      }

      case "send": {
        const { to, subject, body, cc, bcc } = params;
        if (!to || !subject || !body) {
          throw new Error("to, subject, and body are required");
        }

        // Build RFC 2822 message
        const messageParts = [
          `To: ${to}`,
          `Subject: ${subject}`,
        ];
        if (cc) messageParts.push(`Cc: ${cc}`);
        if (bcc) messageParts.push(`Bcc: ${bcc}`);
        messageParts.push("Content-Type: text/plain; charset=utf-8");
        messageParts.push("");
        messageParts.push(body);

        const rawMessage = messageParts.join("\r\n");
        const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const response = await fetch(`${GMAIL_API_BASE}/messages/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw: encodedMessage }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[Gmail] Send error:", error);
          throw new Error(`Failed to send email: ${response.status}`);
        }

        const sentMessage = await response.json();
        result = {
          success: true,
          messageId: sentMessage.id,
          threadId: sentMessage.threadId,
        };
        break;
      }

      case "search": {
        const query = params?.query;
        if (!query) throw new Error("query is required");

        const response = await fetch(
          `${GMAIL_API_BASE}/messages?q=${encodeURIComponent(query)}&maxResults=${params?.maxResults || 10}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        result = {
          messages: data.messages || [],
          resultSizeEstimate: data.resultSizeEstimate,
        };
        break;
      }

      case "labels": {
        const response = await fetch(`${GMAIL_API_BASE}/labels`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch labels: ${response.status}`);
        }

        const data = await response.json();
        result = { labels: data.labels || [] };
        break;
      }

      case "reply": {
        const messageId = params?.messageId;
        const body = params?.body;
        if (!messageId || !body) throw new Error("messageId and body are required");

        // First, get the original message to extract headers
        const origResponse = await fetch(`${GMAIL_API_BASE}/messages/${messageId}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Cc&metadataHeaders=Subject&metadataHeaders=Message-ID&metadataHeaders=References`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!origResponse.ok) {
          throw new Error(`Failed to get original message: ${origResponse.status}`);
        }

        const origMessage = await origResponse.json();
        const headers = origMessage.payload?.headers || [];
        const from = headers.find((h: any) => h.name === "From")?.value || "";
        const to = headers.find((h: any) => h.name === "To")?.value || "";
        const cc = headers.find((h: any) => h.name === "Cc")?.value || "";
        const subject = headers.find((h: any) => h.name === "Subject")?.value || "";
        const messageIdHeader = headers.find((h: any) => h.name === "Message-ID")?.value || "";
        const references = headers.find((h: any) => h.name === "References")?.value || "";

        // Build reply-to address
        const replyTo = params?.replyAll ? [from, ...(to.split(",").map((e: string) => e.trim()))] : [from];
        const replyToStr = replyTo.filter((e: string, i: number, arr: string[]) => arr.indexOf(e) === i).join(", ");

        // Build RFC 2822 reply message
        const messageParts = [
          `To: ${replyToStr}`,
          `Subject: ${subject.startsWith("Re:") ? subject : `Re: ${subject}`}`,
          `In-Reply-To: ${messageIdHeader}`,
          `References: ${references} ${messageIdHeader}`.trim(),
        ];
        if (params?.replyAll && cc) messageParts.push(`Cc: ${cc}`);
        messageParts.push("Content-Type: text/plain; charset=utf-8");
        messageParts.push("");
        messageParts.push(body);

        const rawMessage = messageParts.join("\r\n");
        const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const sendResponse = await fetch(`${GMAIL_API_BASE}/messages/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ raw: encodedMessage, threadId: origMessage.threadId }),
        });

        if (!sendResponse.ok) {
          const error = await sendResponse.text();
          console.error("[Gmail] Reply error:", error);
          throw new Error(`Failed to send reply: ${sendResponse.status}`);
        }

        const sentReply = await sendResponse.json();
        result = {
          success: true,
          messageId: sentReply.id,
          threadId: sentReply.threadId,
        };
        break;
      }

      case "modifyLabels": {
        const messageId = params?.messageId;
        if (!messageId) throw new Error("messageId is required");

        const response = await fetch(`${GMAIL_API_BASE}/messages/${messageId}/modify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addLabelIds: params?.addLabels || [],
            removeLabelIds: params?.removeLabels || [],
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error("[Gmail] Modify labels error:", error);
          throw new Error(`Failed to modify labels: ${response.status}`);
        }

        const modified = await response.json();
        result = {
          success: true,
          id: modified.id,
          labelIds: modified.labelIds,
        };
        break;
      }

      case "trash": {
        const messageId = params?.messageId;
        if (!messageId) throw new Error("messageId is required");

        const response = await fetch(`${GMAIL_API_BASE}/messages/${messageId}/trash`, {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(`Failed to trash message: ${response.status}`);
        }

        result = { success: true, id: messageId };
        break;
      }

      case "markRead": {
        const messageId = params?.messageId;
        const read = params?.read;
        if (!messageId || read === undefined) throw new Error("messageId and read are required");

        const response = await fetch(`${GMAIL_API_BASE}/messages/${messageId}/modify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            addLabelIds: read ? [] : ["UNREAD"],
            removeLabelIds: read ? ["UNREAD"] : [],
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to modify read status: ${response.status}`);
        }

        const modified = await response.json();
        result = {
          success: true,
          id: modified.id,
          isUnread: modified.labelIds?.includes("UNREAD"),
        };
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Log execution
    await serviceClient.from("tool_execution_log").insert({
      user_id: user.id,
      tool_name: `gmail_${action}`,
      success: true,
      input_summary: JSON.stringify(params).substring(0, 500),
      output_summary: JSON.stringify(result).substring(0, 500),
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("[Gmail] Error:", error);
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
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET");

  if (!clientId || !clientSecret || !refreshToken) {
    console.error("[Gmail] Missing refresh credentials");
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
      console.error("[Gmail] Token refresh failed:", await response.text());
      return null;
    }

    const tokens = await response.json();
    
    // Update stored token
    await updateRefreshedToken(
      supabase,
      userId,
      "googleOAuth2Api",
      tokens.access_token,
      tokens.expires_in
    );

    console.log("[Gmail] Token refreshed successfully");
    return tokens.access_token;
  } catch (e) {
    console.error("[Gmail] Refresh error:", e);
    return null;
  }
}
