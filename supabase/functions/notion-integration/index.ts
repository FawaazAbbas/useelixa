import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NOTION_API_VERSION = "2022-06-28";
const NOTION_BASE_URL = "https://api.notion.com/v1";

interface NotionCredentials {
  accessToken: string;
}

/**
 * Retrieve and decrypt Notion credentials for a user
 */
async function getNotionCredentials(
  supabase: any,
  userId: string
): Promise<NotionCredentials | null> {
  const { data: credentials, error } = await supabase
    .from("user_credentials")
    .select("*")
    .eq("user_id", userId)
    .eq("credential_type", "notionApi")
    .maybeSingle();

  if (error || !credentials) {
    console.log("[Notion] No credentials found for user:", userId);
    return null;
  }

  // Handle encrypted tokens
  if (credentials.is_encrypted && credentials.encrypted_access_token) {
    try {
      const { decryptToken } = await import("../_shared/crypto.ts");
      const accessToken = await decryptToken(credentials.encrypted_access_token);
      return { accessToken };
    } catch (decryptError) {
      console.error("[Notion] Failed to decrypt token:", decryptError);
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
 * Make a request to the Notion API
 */
async function callNotionAPI(
  accessToken: string,
  endpoint: string,
  method: string = "GET",
  body?: any
): Promise<any> {
  const url = `${NOTION_BASE_URL}${endpoint}`;
  console.log(`[Notion] Calling API: ${method} ${endpoint}`);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Notion-Version": NOTION_API_VERSION,
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
    console.error(`[Notion] API error: ${response.status}`, errorBody);
    throw new Error(`Notion API error: ${response.status} - ${errorBody}`);
  }

  return await response.json();
}

/**
 * Extract plain text from Notion rich text array
 */
function extractPlainText(richTextArray: any[]): string {
  if (!richTextArray || !Array.isArray(richTextArray)) return "";
  return richTextArray.map((rt) => rt.plain_text || "").join("");
}

/**
 * Format page/database results for display
 */
function formatSearchResults(results: any[]): any[] {
  return results.map((item) => {
    const isDatabase = item.object === "database";
    const title = isDatabase
      ? extractPlainText(item.title)
      : extractPlainText(item.properties?.title?.title || item.properties?.Name?.title || []);

    return {
      id: item.id,
      type: item.object,
      title: title || "Untitled",
      url: item.url,
      created_time: item.created_time,
      last_edited_time: item.last_edited_time,
      parent: item.parent,
    };
  });
}

/**
 * Format database query results
 */
function formatDatabaseResults(results: any[]): any[] {
  return results.map((page) => {
    const properties: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(page.properties || {})) {
      const prop = value as any;
      switch (prop.type) {
        case "title":
          properties[key] = extractPlainText(prop.title);
          break;
        case "rich_text":
          properties[key] = extractPlainText(prop.rich_text);
          break;
        case "number":
          properties[key] = prop.number;
          break;
        case "select":
          properties[key] = prop.select?.name || null;
          break;
        case "multi_select":
          properties[key] = prop.multi_select?.map((s: any) => s.name) || [];
          break;
        case "date":
          properties[key] = prop.date;
          break;
        case "checkbox":
          properties[key] = prop.checkbox;
          break;
        case "url":
          properties[key] = prop.url;
          break;
        case "email":
          properties[key] = prop.email;
          break;
        case "phone_number":
          properties[key] = prop.phone_number;
          break;
        case "status":
          properties[key] = prop.status?.name || null;
          break;
        default:
          properties[key] = `[${prop.type}]`;
      }
    }

    return {
      id: page.id,
      url: page.url,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
      properties,
    };
  });
}

/**
 * Extract page content from blocks
 */
function extractBlockContent(blocks: any[]): string {
  return blocks
    .map((block) => {
      const type = block.type;
      const content = block[type];
      
      if (!content) return "";

      switch (type) {
        case "paragraph":
        case "heading_1":
        case "heading_2":
        case "heading_3":
        case "bulleted_list_item":
        case "numbered_list_item":
        case "quote":
        case "callout":
          return extractPlainText(content.rich_text);
        case "code":
          return `\`\`\`${content.language || ""}\n${extractPlainText(content.rich_text)}\n\`\`\``;
        case "divider":
          return "---";
        case "to_do":
          const checked = content.checked ? "[x]" : "[ ]";
          return `${checked} ${extractPlainText(content.rich_text)}`;
        default:
          return "";
      }
    })
    .filter((text) => text)
    .join("\n\n");
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
    console.log(`[Notion] Action: ${action}, User: ${userId}`);

    // Get Notion credentials
    const credentials = await getNotionCredentials(supabase, userId);
    if (!credentials) {
      return new Response(
        JSON.stringify({ 
          error: "Notion not connected. Please connect Notion in your settings.",
          notConnected: true 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result: any;

    switch (action) {
      case "search": {
        const searchParams: any = {};
        if (params?.query) {
          searchParams.query = params.query;
        }
        if (params?.filter) {
          searchParams.filter = params.filter;
        }
        searchParams.page_size = params?.limit || 10;

        const response = await callNotionAPI(
          credentials.accessToken,
          "/search",
          "POST",
          searchParams
        );

        result = {
          results: formatSearchResults(response.results),
          has_more: response.has_more,
          next_cursor: response.next_cursor,
        };
        break;
      }

      case "list_databases": {
        const response = await callNotionAPI(
          credentials.accessToken,
          "/search",
          "POST",
          { filter: { value: "database", property: "object" }, page_size: 100 }
        );

        result = {
          databases: formatSearchResults(response.results),
          count: response.results.length,
        };
        break;
      }

      case "query_database": {
        if (!params?.database_id) {
          return new Response(
            JSON.stringify({ error: "database_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const queryParams: any = {
          page_size: params?.limit || 100,
        };
        if (params?.filter) {
          queryParams.filter = params.filter;
        }
        if (params?.sorts) {
          queryParams.sorts = params.sorts;
        }

        const response = await callNotionAPI(
          credentials.accessToken,
          `/databases/${params.database_id}/query`,
          "POST",
          queryParams
        );

        result = {
          results: formatDatabaseResults(response.results),
          has_more: response.has_more,
          next_cursor: response.next_cursor,
        };
        break;
      }

      case "get_page": {
        if (!params?.page_id) {
          return new Response(
            JSON.stringify({ error: "page_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Get page metadata
        const page = await callNotionAPI(
          credentials.accessToken,
          `/pages/${params.page_id}`,
          "GET"
        );

        // Get page blocks/content
        const blocks = await callNotionAPI(
          credentials.accessToken,
          `/blocks/${params.page_id}/children`,
          "GET"
        );

        const title = extractPlainText(
          page.properties?.title?.title || 
          page.properties?.Name?.title || 
          []
        );

        result = {
          id: page.id,
          title: title || "Untitled",
          url: page.url,
          created_time: page.created_time,
          last_edited_time: page.last_edited_time,
          content: extractBlockContent(blocks.results),
          properties: page.properties,
        };
        break;
      }

      case "create_page": {
        if (!params?.parent_id) {
          return new Response(
            JSON.stringify({ error: "parent_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (!params?.title) {
          return new Response(
            JSON.stringify({ error: "title is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Determine if parent is a database or page
        const parentType = params.parent_type || "database_id";
        const parent: any = {};
        parent[parentType] = params.parent_id;

        const pageData: any = {
          parent,
          properties: {
            title: {
              title: [{ text: { content: params.title } }],
            },
          },
        };

        // Add content as children blocks if provided
        if (params.content) {
          pageData.children = [
            {
              object: "block",
              type: "paragraph",
              paragraph: {
                rich_text: [{ type: "text", text: { content: params.content } }],
              },
            },
          ];
        }

        const response = await callNotionAPI(
          credentials.accessToken,
          "/pages",
          "POST",
          pageData
        );

        result = {
          success: true,
          page: {
            id: response.id,
            url: response.url,
            title: params.title,
          },
        };
        break;
      }

      case "update_page": {
        if (!params?.page_id) {
          return new Response(
            JSON.stringify({ error: "page_id is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const updateData: any = {};
        
        if (params.properties) {
          updateData.properties = params.properties;
        }
        
        if (params.archived !== undefined) {
          updateData.archived = params.archived;
        }

        const response = await callNotionAPI(
          credentials.accessToken,
          `/pages/${params.page_id}`,
          "PATCH",
          updateData
        );

        result = {
          success: true,
          page: {
            id: response.id,
            url: response.url,
            last_edited_time: response.last_edited_time,
          },
        };
        break;
      }

      case "check_connection": {
        // Simple test to verify the connection works
        try {
          await callNotionAPI(credentials.accessToken, "/users/me", "GET");
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
          tool_name: `notion_${action}`,
          success: true,
          execution_time_ms: 0,
        });
      }
    } catch (logError) {
      console.error("[Notion] Failed to log execution:", logError);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("[Notion] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
