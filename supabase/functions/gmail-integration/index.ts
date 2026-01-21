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
    console.log(`[Gmail] Action: ${action}, User: ${user.id}`);

    const retryConfig = {
      userId: user.id,
      credentialType: "googleOAuth2Api",
      bundleType: "gmail",
    };

    const getToken = () => getFreshToken(supabase, user.id, "googleOAuth2Api", "gmail");

    let result;

    switch (action) {
      case "list": {
        const maxResults = params?.maxResults || 10;
        const query = params?.query || "";
        
        const url = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
        url.searchParams.set("maxResults", String(maxResults));
        if (query) url.searchParams.set("q", query);

        const { data, error, tokenRefreshed } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(url.toString(), {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        if (error) {
          throw new Error(error);
        }

        if (tokenRefreshed) {
          console.log("[Gmail] Token was refreshed during list operation");
        }

        // Get fresh token for message details (might have been refreshed)
        const currentToken = await getToken();
        if (!currentToken) {
          throw new Error("Failed to get access token");
        }
        
        // Fetch message details for each message
        const messages = await Promise.all(
          (data?.messages || []).slice(0, 10).map(async (msg: any) => {
            const msgResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
              { headers: { Authorization: `Bearer ${currentToken}` } }
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

        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )
        );

        if (error) {
          throw new Error(error);
        }

        result = data;
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

        const { data, error } = await withTokenRefresh<any>(
          retryConfig,
          getToken,
          (token) => fetch(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ raw: encodedEmail }),
            }
          )
        );

        if (error) {
          throw new Error(error);
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
