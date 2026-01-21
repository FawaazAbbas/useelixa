import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials, updateRefreshedToken } from "../_shared/credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function getGoogleAccessToken(supabase: any, userId: string): Promise<string | null> {
  // Get the user's Google credentials (with decryption)
  const credential = await getDecryptedCredentials(supabase, userId, "googleOAuth2Api", "gmail");

  if (!credential) {
    console.log("No Google credentials found for user");
    return null;
  }

  // Check if token is expired
  if (credential.expires_at) {
    const expiresAt = new Date(credential.expires_at);
    if (expiresAt <= new Date() && credential.refresh_token) {
      // Refresh the token
      const refreshed = await refreshGoogleToken(supabase, userId, credential.refresh_token);
      return refreshed;
    }
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

    if (!response.ok) {
      console.error("Failed to refresh token:", await response.text());
      return null;
    }

    const data = await response.json();
    
    // Update the stored token with encryption
    await updateRefreshedToken(
      supabase,
      userId,
      "googleOAuth2Api",
      data.access_token,
      data.expires_in,
      "gmail"
    );

    return data.access_token;
  } catch (error) {
    console.error("Error refreshing token:", error);
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
    console.log(`[Gmail] Action: ${action}, User: ${user.id}`);

    const accessToken = await getGoogleAccessToken(supabase, user.id);
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "Gmail not connected. Please connect your Google account first." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    switch (action) {
      case "list": {
        const maxResults = params?.maxResults || 10;
        const query = params?.query || "";
        
        const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
        url.searchParams.set("maxResults", String(maxResults));
        if (query) url.searchParams.set("q", query);

        const response = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(`Gmail API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Fetch message details for each message
        const messages = await Promise.all(
          (data.messages || []).slice(0, 10).map(async (msg: any) => {
            const msgResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            if (!msgResponse.ok) return null;
            const msgData = await msgResponse.json();
            
            const headers = msgData.payload?.headers || [];
            return {
              id: msg.id,
              threadId: msg.threadId,
              from: headers.find((h: any) => h.name === "From")?.value || "",
              subject: headers.find((h: any) => h.name === "Subject")?.value || "(no subject)",
              date: headers.find((h: any) => h.name === "Date")?.value || "",
              snippet: msgData.snippet || "",
            };
          })
        );

        result = { messages: messages.filter(Boolean) };
        break;
      }

      case "get": {
        const { messageId } = params;
        if (!messageId) throw new Error("messageId is required");

        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!response.ok) {
          throw new Error(`Gmail API error: ${response.status}`);
        }

        result = await response.json();
        break;
      }

      case "send": {
        const { to, subject, body } = params;
        if (!to || !subject || !body) {
          throw new Error("to, subject, and body are required");
        }

        // Create the email in RFC 2822 format
        const email = [
          `To: ${to}`,
          `Subject: ${subject}`,
          "Content-Type: text/html; charset=utf-8",
          "",
          body,
        ].join("\r\n");

        // Base64url encode the email
        const encodedEmail = btoa(email)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");

        const response = await fetch(
          "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ raw: encodedEmail }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Gmail send error:", errorText);
          throw new Error(`Failed to send email: ${response.status}`);
        }

        result = { success: true, message: "Email sent successfully" };
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
      tool_name: `gmail_${action}`,
      success: true,
      input_summary: JSON.stringify(params).substring(0, 500),
      output_summary: JSON.stringify(result).substring(0, 500),
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Gmail integration error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
