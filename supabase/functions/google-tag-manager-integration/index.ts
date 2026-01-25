import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getDecryptedCredentials, updateRefreshedToken } from "../_shared/credentials.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google Tag Manager API
const GTM_API = "https://www.googleapis.com/tagmanager/v2";

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
    console.log(`[GTM] Action: ${action}, User: ${user.id}`);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const creds = await getDecryptedCredentials(serviceClient, user.id, "googleOAuth2Api", "tag_manager");
    if (!creds) {
      throw new Error("Google Tag Manager not connected. Please connect your GTM account first.");
    }

    let accessToken = creds.access_token;

    if (creds.expires_at && new Date(creds.expires_at) < new Date()) {
      console.log("[GTM] Token expired, refreshing...");
      if (!creds.refresh_token) {
        throw new Error("No refresh token available. Please reconnect your GTM account.");
      }
      const refreshed = await refreshGoogleToken(serviceClient, user.id, creds.refresh_token);
      if (!refreshed) {
        throw new Error("Failed to refresh Google token. Please reconnect your account.");
      }
      accessToken = refreshed;
    }

    let result;

    switch (action) {
      // ============= ACCOUNTS =============
      case "list_accounts": {
        const response = await fetch(`${GTM_API}/accounts`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) {
          const error = await response.text();
          console.error("[GTM] List accounts error:", error);
          throw new Error(`GTM API error: ${response.status}`);
        }
        const data = await response.json();
        result = {
          accounts: data.account?.map((a: any) => ({
            accountId: a.accountId,
            name: a.name,
            path: a.path,
          })) || [],
        };
        break;
      }

      // ============= CONTAINERS =============
      case "list_containers": {
        const accountId = params?.accountId;
        if (!accountId) throw new Error("accountId is required");

        const response = await fetch(`${GTM_API}/accounts/${accountId}/containers`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        const data = await response.json();
        result = {
          containers: data.container?.map((c: any) => ({
            containerId: c.containerId,
            name: c.name,
            publicId: c.publicId,
            usageContext: c.usageContext,
            path: c.path,
          })) || [],
        };
        break;
      }

      case "get_container": {
        const path = params?.path; // Format: accounts/{accountId}/containers/{containerId}
        if (!path) throw new Error("path is required");

        const response = await fetch(`${GTM_API}/${path}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        result = await response.json();
        break;
      }

      // ============= WORKSPACES =============
      case "list_workspaces": {
        const containerPath = params?.containerPath;
        if (!containerPath) throw new Error("containerPath is required");

        const response = await fetch(`${GTM_API}/${containerPath}/workspaces`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        const data = await response.json();
        result = {
          workspaces: data.workspace?.map((w: any) => ({
            workspaceId: w.workspaceId,
            name: w.name,
            description: w.description,
            path: w.path,
          })) || [],
        };
        break;
      }

      // ============= TAGS =============
      case "list_tags": {
        const workspacePath = params?.workspacePath;
        if (!workspacePath) throw new Error("workspacePath is required");

        const response = await fetch(`${GTM_API}/${workspacePath}/tags`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        const data = await response.json();
        result = {
          tags: data.tag?.map((t: any) => ({
            tagId: t.tagId,
            name: t.name,
            type: t.type,
            firingTriggerId: t.firingTriggerId,
            blockingTriggerId: t.blockingTriggerId,
            paused: t.paused,
            path: t.path,
          })) || [],
        };
        break;
      }

      case "get_tag": {
        const tagPath = params?.tagPath;
        if (!tagPath) throw new Error("tagPath is required");

        const response = await fetch(`${GTM_API}/${tagPath}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        result = await response.json();
        break;
      }

      case "create_tag": {
        const workspacePath = params?.workspacePath;
        if (!workspacePath) throw new Error("workspacePath is required");
        if (!params?.name || !params?.type) throw new Error("name and type are required");

        const tagData: any = {
          name: params.name,
          type: params.type,
        };

        if (params.firingTriggerId) {
          tagData.firingTriggerId = params.firingTriggerId;
        }
        if (params.parameter) {
          tagData.parameter = params.parameter;
        }

        const response = await fetch(`${GTM_API}/${workspacePath}/tags`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tagData),
        });
        if (!response.ok) {
          const error = await response.text();
          console.error("[GTM] Create tag error:", error);
          throw new Error(`GTM API error: ${response.status}`);
        }
        result = await response.json();
        break;
      }

      case "update_tag": {
        const tagPath = params?.tagPath;
        if (!tagPath) throw new Error("tagPath is required");

        const response = await fetch(`${GTM_API}/${tagPath}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params.tagData),
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        result = await response.json();
        break;
      }

      case "delete_tag": {
        const tagPath = params?.tagPath;
        if (!tagPath) throw new Error("tagPath is required");

        const response = await fetch(`${GTM_API}/${tagPath}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        result = { success: true, message: "Tag deleted" };
        break;
      }

      // ============= TRIGGERS =============
      case "list_triggers": {
        const workspacePath = params?.workspacePath;
        if (!workspacePath) throw new Error("workspacePath is required");

        const response = await fetch(`${GTM_API}/${workspacePath}/triggers`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        const data = await response.json();
        result = {
          triggers: data.trigger?.map((t: any) => ({
            triggerId: t.triggerId,
            name: t.name,
            type: t.type,
            path: t.path,
          })) || [],
        };
        break;
      }

      case "get_trigger": {
        const triggerPath = params?.triggerPath;
        if (!triggerPath) throw new Error("triggerPath is required");

        const response = await fetch(`${GTM_API}/${triggerPath}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        result = await response.json();
        break;
      }

      case "create_trigger": {
        const workspacePath = params?.workspacePath;
        if (!workspacePath) throw new Error("workspacePath is required");
        if (!params?.name || !params?.type) throw new Error("name and type are required");

        const triggerData: any = {
          name: params.name,
          type: params.type,
        };

        if (params.filter) triggerData.filter = params.filter;
        if (params.customEventFilter) triggerData.customEventFilter = params.customEventFilter;

        const response = await fetch(`${GTM_API}/${workspacePath}/triggers`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(triggerData),
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        result = await response.json();
        break;
      }

      // ============= VARIABLES =============
      case "list_variables": {
        const workspacePath = params?.workspacePath;
        if (!workspacePath) throw new Error("workspacePath is required");

        const response = await fetch(`${GTM_API}/${workspacePath}/variables`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        const data = await response.json();
        result = {
          variables: data.variable?.map((v: any) => ({
            variableId: v.variableId,
            name: v.name,
            type: v.type,
            path: v.path,
          })) || [],
        };
        break;
      }

      case "create_variable": {
        const workspacePath = params?.workspacePath;
        if (!workspacePath) throw new Error("workspacePath is required");
        if (!params?.name || !params?.type) throw new Error("name and type are required");

        const variableData: any = {
          name: params.name,
          type: params.type,
        };

        if (params.parameter) variableData.parameter = params.parameter;

        const response = await fetch(`${GTM_API}/${workspacePath}/variables`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(variableData),
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        result = await response.json();
        break;
      }

      // ============= VERSIONS =============
      case "list_versions": {
        const containerPath = params?.containerPath;
        if (!containerPath) throw new Error("containerPath is required");

        const response = await fetch(`${GTM_API}/${containerPath}/versions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) throw new Error(`GTM API error: ${response.status}`);
        const data = await response.json();
        result = {
          versions: data.containerVersion?.map((v: any) => ({
            containerVersionId: v.containerVersionId,
            name: v.name,
            description: v.description,
            path: v.path,
          })) || [],
        };
        break;
      }

      case "publish_version": {
        const workspacePath = params?.workspacePath;
        if (!workspacePath) throw new Error("workspacePath is required");

        // Create a version first
        const createResponse = await fetch(`${GTM_API}/${workspacePath}:create_version`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: params.name || `Version ${new Date().toISOString()}`,
            notes: params.notes || "Published via Elixa",
          }),
        });
        if (!createResponse.ok) throw new Error(`GTM API error: ${createResponse.status}`);
        const versionData = await createResponse.json();

        // Publish the version
        const versionPath = versionData.containerVersion?.path;
        if (versionPath) {
          const publishResponse = await fetch(`${GTM_API}/${versionPath}:publish`, {
            method: "POST",
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!publishResponse.ok) throw new Error(`GTM publish error: ${publishResponse.status}`);
          result = await publishResponse.json();
        } else {
          result = versionData;
        }
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[GTM] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function refreshGoogleToken(
  serviceClient: any,
  userId: string,
  refreshToken: string
): Promise<string | null> {
  try {
    const clientId = Deno.env.get("GOOGLEOAUTH2API_CLIENT_ID")?.trim();
    const clientSecret = Deno.env.get("GOOGLEOAUTH2API_CLIENT_SECRET")?.trim();

    if (!clientId || !clientSecret) {
      console.error("[GTM] Missing Google OAuth credentials");
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
      console.error("[GTM] Token refresh failed:", error);
      return null;
    }

    const tokens = await response.json();
    await updateRefreshedToken(serviceClient, userId, "googleOAuth2Api", tokens.access_token, tokens.expires_in, "tag_manager");
    return tokens.access_token;
  } catch (error) {
    console.error("[GTM] Token refresh error:", error);
    return null;
  }
}
