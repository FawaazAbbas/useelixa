// Dynamic Tool Loading System - MCP-style tool registry
// Tools are loaded based on user's connected OAuth credentials

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

export interface DynamicTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, any>;
      required?: string[];
    };
  };
  credentialType: string;
  serviceCategory: string;
}

export interface ConnectedService {
  name: string;
  credentialType: string;
  accountEmail?: string;
  status: "connected" | "expired";
  capabilities: string[];
}

// Tool Registry: All available tools organized by service
const TOOL_REGISTRY: Record<string, DynamicTool[]> = {
  // Google Workspace Tools
  googleOAuth2Api: [
    {
      type: "function",
      function: {
        name: "gmail_send_email",
        description: "Send an email via Gmail. Always confirm with user before sending.",
        parameters: {
          type: "object",
          properties: {
            to: { type: "string", description: "Recipient email address" },
            subject: { type: "string", description: "Email subject line" },
            message: { type: "string", description: "Email body content (plain text)" },
            cc: { type: "string", description: "CC email addresses (comma-separated)" },
            bcc: { type: "string", description: "BCC email addresses (comma-separated)" }
          },
          required: ["to", "subject", "message"]
        }
      },
      credentialType: "googleOAuth2Api",
      serviceCategory: "email"
    },
    {
      type: "function",
      function: {
        name: "gmail_search",
        description: "Search the user's Gmail inbox for specific emails.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Gmail search query (e.g., 'from:john@example.com subject:invoice')" },
            max_results: { type: "number", description: "Maximum number of results (default 10)" }
          },
          required: ["query"]
        }
      },
      credentialType: "googleOAuth2Api",
      serviceCategory: "email"
    },
    {
      type: "function",
      function: {
        name: "gmail_read_email",
        description: "Read the content of a specific email by ID.",
        parameters: {
          type: "object",
          properties: {
            message_id: { type: "string", description: "The Gmail message ID to read" }
          },
          required: ["message_id"]
        }
      },
      credentialType: "googleOAuth2Api",
      serviceCategory: "email"
    },
    {
      type: "function",
      function: {
        name: "google_sheets_read",
        description: "Read data from a Google Spreadsheet.",
        parameters: {
          type: "object",
          properties: {
            spreadsheet_id: { type: "string", description: "The Google Sheets spreadsheet ID" },
            range: { type: "string", description: "The A1 notation range to read (e.g., 'Sheet1!A1:C10')" }
          },
          required: ["spreadsheet_id", "range"]
        }
      },
      credentialType: "googleOAuth2Api",
      serviceCategory: "spreadsheet"
    },
    {
      type: "function",
      function: {
        name: "google_sheets_write",
        description: "Write or append data to a Google Spreadsheet.",
        parameters: {
          type: "object",
          properties: {
            spreadsheet_id: { type: "string", description: "The Google Sheets spreadsheet ID" },
            range: { type: "string", description: "The A1 notation range to write (e.g., 'Sheet1!A1')" },
            values: {
              type: "array",
              description: "2D array of values to write",
              items: { type: "array", items: { type: "string" } }
            },
            operation: { type: "string", enum: ["update", "append"], description: "Whether to update or append (default: append)" }
          },
          required: ["spreadsheet_id", "range", "values"]
        }
      },
      credentialType: "googleOAuth2Api",
      serviceCategory: "spreadsheet"
    },
    {
      type: "function",
      function: {
        name: "google_drive_list",
        description: "List files in the user's Google Drive.",
        parameters: {
          type: "object",
          properties: {
            folder_id: { type: "string", description: "Optional folder ID to list files from" },
            query: { type: "string", description: "Optional search query to filter files" },
            max_results: { type: "number", description: "Maximum number of results (default 20)" }
          }
        }
      },
      credentialType: "googleOAuth2Api",
      serviceCategory: "storage"
    },
    {
      type: "function",
      function: {
        name: "google_drive_upload",
        description: "Upload a file to the user's Google Drive.",
        parameters: {
          type: "object",
          properties: {
            file_name: { type: "string", description: "Name for the uploaded file" },
            content: { type: "string", description: "File content" },
            mime_type: { type: "string", description: "MIME type (e.g., 'text/plain', 'application/json')" },
            folder_id: { type: "string", description: "Optional Google Drive folder ID to upload to" }
          },
          required: ["file_name", "content"]
        }
      },
      credentialType: "googleOAuth2Api",
      serviceCategory: "storage"
    },
    {
      type: "function",
      function: {
        name: "google_calendar_list_events",
        description: "List upcoming events from the user's Google Calendar.",
        parameters: {
          type: "object",
          properties: {
            calendar_id: { type: "string", description: "Calendar ID (default: 'primary')" },
            time_min: { type: "string", description: "Start time filter (ISO format)" },
            time_max: { type: "string", description: "End time filter (ISO format)" },
            max_results: { type: "number", description: "Maximum number of events (default 10)" }
          }
        }
      },
      credentialType: "googleOAuth2Api",
      serviceCategory: "calendar"
    },
    {
      type: "function",
      function: {
        name: "google_calendar_create_event",
        description: "Create a new event in Google Calendar.",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "Event title" },
            description: { type: "string", description: "Event description" },
            start_time: { type: "string", description: "Start time (ISO format)" },
            end_time: { type: "string", description: "End time (ISO format)" },
            attendees: {
              type: "array",
              description: "List of attendee email addresses",
              items: { type: "string" }
            },
            calendar_id: { type: "string", description: "Calendar ID (default: 'primary')" }
          },
          required: ["summary", "start_time", "end_time"]
        }
      },
      credentialType: "googleOAuth2Api",
      serviceCategory: "calendar"
    }
  ],

  // Notion Tools
  notionApi: [
    {
      type: "function",
      function: {
        name: "notion_search",
        description: "Search across all Notion pages and databases the user has access to.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            filter: {
              type: "string",
              enum: ["page", "database"],
              description: "Filter by object type (optional)"
            }
          },
          required: ["query"]
        }
      },
      credentialType: "notionApi",
      serviceCategory: "productivity"
    },
    {
      type: "function",
      function: {
        name: "notion_create_page",
        description: "Create a new page in a Notion database.",
        parameters: {
          type: "object",
          properties: {
            database_id: { type: "string", description: "The Notion database ID" },
            title: { type: "string", description: "Page title" },
            content: { type: "string", description: "Page content (plain text)" },
            properties: { type: "object", description: "Additional properties for the page" }
          },
          required: ["database_id", "title"]
        }
      },
      credentialType: "notionApi",
      serviceCategory: "productivity"
    },
    {
      type: "function",
      function: {
        name: "notion_query_database",
        description: "Query a Notion database with optional filters.",
        parameters: {
          type: "object",
          properties: {
            database_id: { type: "string", description: "The Notion database ID" },
            filter: { type: "object", description: "Filter conditions (optional)" },
            page_size: { type: "number", description: "Number of results (default 100)" }
          },
          required: ["database_id"]
        }
      },
      credentialType: "notionApi",
      serviceCategory: "productivity"
    },
    {
      type: "function",
      function: {
        name: "notion_update_page",
        description: "Update an existing Notion page's properties.",
        parameters: {
          type: "object",
          properties: {
            page_id: { type: "string", description: "The Notion page ID" },
            properties: { type: "object", description: "Properties to update" }
          },
          required: ["page_id", "properties"]
        }
      },
      credentialType: "notionApi",
      serviceCategory: "productivity"
    }
  ],

  // Slack Tools
  slackOAuth2Api: [
    {
      type: "function",
      function: {
        name: "slack_send_message",
        description: "Send a message to a Slack channel.",
        parameters: {
          type: "object",
          properties: {
            channel: { type: "string", description: "Channel ID or name (e.g., '#general' or 'C1234567890')" },
            text: { type: "string", description: "Message text" },
            thread_ts: { type: "string", description: "Thread timestamp to reply to (optional)" }
          },
          required: ["channel", "text"]
        }
      },
      credentialType: "slackOAuth2Api",
      serviceCategory: "communication"
    },
    {
      type: "function",
      function: {
        name: "slack_list_channels",
        description: "List available Slack channels.",
        parameters: {
          type: "object",
          properties: {
            types: {
              type: "string",
              description: "Channel types to include (public_channel, private_channel, mpim, im)",
              default: "public_channel"
            }
          }
        }
      },
      credentialType: "slackOAuth2Api",
      serviceCategory: "communication"
    },
    {
      type: "function",
      function: {
        name: "slack_get_messages",
        description: "Get recent messages from a Slack channel.",
        parameters: {
          type: "object",
          properties: {
            channel: { type: "string", description: "Channel ID" },
            limit: { type: "number", description: "Number of messages (default 10)" }
          },
          required: ["channel"]
        }
      },
      credentialType: "slackOAuth2Api",
      serviceCategory: "communication"
    }
  ],

  // Calendly Tools
  calendlyApi: [
    {
      type: "function",
      function: {
        name: "calendly_list_events",
        description: "Get the user's scheduled Calendly events.",
        parameters: {
          type: "object",
          properties: {
            start_time: { type: "string", description: "Start time filter (ISO format)" },
            end_time: { type: "string", description: "End time filter (ISO format)" },
            status: { type: "string", enum: ["active", "canceled"], description: "Event status filter" }
          }
        }
      },
      credentialType: "calendlyApi",
      serviceCategory: "scheduling"
    },
    {
      type: "function",
      function: {
        name: "calendly_get_event_types",
        description: "Get available Calendly event types (meeting types the user offers).",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      credentialType: "calendlyApi",
      serviceCategory: "scheduling"
    }
  ],

  // Microsoft Tools
  microsoftOAuth2Api: [
    {
      type: "function",
      function: {
        name: "outlook_send_email",
        description: "Send an email via Microsoft Outlook.",
        parameters: {
          type: "object",
          properties: {
            to: { type: "string", description: "Recipient email address" },
            subject: { type: "string", description: "Email subject" },
            body: { type: "string", description: "Email body (HTML supported)" },
            cc: { type: "string", description: "CC email addresses (comma-separated)" }
          },
          required: ["to", "subject", "body"]
        }
      },
      credentialType: "microsoftOAuth2Api",
      serviceCategory: "email"
    },
    {
      type: "function",
      function: {
        name: "outlook_search_email",
        description: "Search Outlook emails.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
            top: { type: "number", description: "Number of results (default 10)" }
          },
          required: ["query"]
        }
      },
      credentialType: "microsoftOAuth2Api",
      serviceCategory: "email"
    },
    {
      type: "function",
      function: {
        name: "teams_send_message",
        description: "Send a message to a Microsoft Teams channel.",
        parameters: {
          type: "object",
          properties: {
            team_id: { type: "string", description: "Team ID" },
            channel_id: { type: "string", description: "Channel ID" },
            content: { type: "string", description: "Message content" }
          },
          required: ["team_id", "channel_id", "content"]
        }
      },
      credentialType: "microsoftOAuth2Api",
      serviceCategory: "communication"
    },
    {
      type: "function",
      function: {
        name: "onedrive_list_files",
        description: "List files in OneDrive.",
        parameters: {
          type: "object",
          properties: {
            folder_path: { type: "string", description: "Folder path (e.g., '/Documents')" },
            top: { type: "number", description: "Number of items (default 25)" }
          }
        }
      },
      credentialType: "microsoftOAuth2Api",
      serviceCategory: "storage"
    }
  ],

  // HubSpot Tools
  hubspotOAuth2Api: [
    {
      type: "function",
      function: {
        name: "hubspot_create_contact",
        description: "Create a new contact in HubSpot CRM.",
        parameters: {
          type: "object",
          properties: {
            email: { type: "string", description: "Contact email" },
            firstname: { type: "string", description: "First name" },
            lastname: { type: "string", description: "Last name" },
            phone: { type: "string", description: "Phone number" },
            company: { type: "string", description: "Company name" }
          },
          required: ["email"]
        }
      },
      credentialType: "hubspotOAuth2Api",
      serviceCategory: "crm"
    },
    {
      type: "function",
      function: {
        name: "hubspot_search_contacts",
        description: "Search for contacts in HubSpot CRM.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query (email, name, etc.)" },
            limit: { type: "number", description: "Number of results (default 10)" }
          },
          required: ["query"]
        }
      },
      credentialType: "hubspotOAuth2Api",
      serviceCategory: "crm"
    }
  ],

  // Mailchimp Tools
  mailchimpOAuth2Api: [
    {
      type: "function",
      function: {
        name: "mailchimp_list_audiences",
        description: "List all Mailchimp audiences (lists).",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      credentialType: "mailchimpOAuth2Api",
      serviceCategory: "marketing"
    },
    {
      type: "function",
      function: {
        name: "mailchimp_add_subscriber",
        description: "Add a subscriber to a Mailchimp audience.",
        parameters: {
          type: "object",
          properties: {
            list_id: { type: "string", description: "Audience/list ID" },
            email: { type: "string", description: "Subscriber email" },
            first_name: { type: "string", description: "First name" },
            last_name: { type: "string", description: "Last name" },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Tags to apply"
            }
          },
          required: ["list_id", "email"]
        }
      },
      credentialType: "mailchimpOAuth2Api",
      serviceCategory: "marketing"
    }
  ]
};

// Service display names for UI
const SERVICE_DISPLAY_NAMES: Record<string, string> = {
  googleOAuth2Api: "Google Workspace",
  notionApi: "Notion",
  slackOAuth2Api: "Slack",
  calendlyApi: "Calendly",
  microsoftOAuth2Api: "Microsoft 365",
  hubspotOAuth2Api: "HubSpot",
  mailchimpOAuth2Api: "Mailchimp"
};

// Service capability descriptions
const SERVICE_CAPABILITIES: Record<string, string[]> = {
  googleOAuth2Api: ["Send/search emails", "Read/write spreadsheets", "Manage Drive files", "Calendar events"],
  notionApi: ["Search pages", "Create/update pages", "Query databases"],
  slackOAuth2Api: ["Send messages", "List channels", "Read channel history"],
  calendlyApi: ["View scheduled meetings", "Check event types"],
  microsoftOAuth2Api: ["Outlook email", "Teams messages", "OneDrive files"],
  hubspotOAuth2Api: ["Manage contacts", "Search CRM"],
  mailchimpOAuth2Api: ["Manage audiences", "Add subscribers"]
};

/**
 * Fetch user's connected credentials and return available tools
 */
export async function loadDynamicTools(
  userId: string
): Promise<{
  tools: any[];
  connectedServices: ConnectedService[];
  servicesSummary: string;
}> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Fetch user's credentials
  const { data: credentials, error } = await supabase
    .from("user_credentials")
    .select("credential_type, access_token, expires_at, account_email, bundle_type")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user credentials:", error);
    return { tools: [], connectedServices: [], servicesSummary: "" };
  }

  const connectedServices: ConnectedService[] = [];
  const availableTools: any[] = [];
  const credentialMap = new Map<string, any>();

  // Process credentials
  for (const cred of credentials || []) {
    const isExpired = cred.expires_at && new Date(cred.expires_at) < new Date();
    const credType = cred.credential_type;
    
    // Store credential for tool execution
    if (!credentialMap.has(credType)) {
      credentialMap.set(credType, cred);
    }

    // Track connected service
    connectedServices.push({
      name: SERVICE_DISPLAY_NAMES[credType] || credType,
      credentialType: credType,
      accountEmail: cred.account_email || undefined,
      status: isExpired ? "expired" : "connected",
      capabilities: SERVICE_CAPABILITIES[credType] || []
    });

    // Add tools for this service if not expired
    if (!isExpired && TOOL_REGISTRY[credType]) {
      for (const tool of TOOL_REGISTRY[credType]) {
        availableTools.push({
          type: tool.type,
          function: tool.function
        });
      }
    }
  }

  // Build services summary for system prompt
  const servicesSummary = buildServicesSummary(connectedServices);

  console.log(`Loaded ${availableTools.length} tools for ${connectedServices.length} connected services`);

  return {
    tools: availableTools,
    connectedServices,
    servicesSummary
  };
}

/**
 * Build a human-readable summary of connected services for the AI
 */
function buildServicesSummary(services: ConnectedService[]): string {
  if (services.length === 0) {
    return `
## CONNECTED SERVICES
No external services connected yet. The user can connect Google, Notion, Slack, and more on the Connections page.
`;
  }

  const connected = services.filter(s => s.status === "connected");
  const expired = services.filter(s => s.status === "expired");

  let summary = `
## CONNECTED SERVICES

The user has connected these services. You can use them directly with the available tools:

`;

  for (const service of connected) {
    summary += `**${service.name}**${service.accountEmail ? ` (${service.accountEmail})` : ""}:\n`;
    summary += service.capabilities.map(c => `  - ${c}`).join("\n") + "\n\n";
  }

  if (expired.length > 0) {
    summary += `\n⚠️ **Expired Connections** (suggest reconnecting):\n`;
    for (const service of expired) {
      summary += `  - ${service.name}\n`;
    }
  }

  // List unconnected services
  const connectedTypes = new Set(services.map(s => s.credentialType));
  const unconnectedServices = Object.entries(SERVICE_DISPLAY_NAMES)
    .filter(([type]) => !connectedTypes.has(type))
    .map(([_, name]) => name);

  if (unconnectedServices.length > 0) {
    summary += `\n**Not Connected** (available to connect):\n`;
    summary += unconnectedServices.map(s => `  - ${s}`).join("\n") + "\n";
  }

  summary += `
## TOOL USAGE GUIDELINES

When using connected services:
1. Always confirm with the user before sending emails or creating content
2. Summarize search results clearly, don't dump raw API responses  
3. If a tool fails with 401, suggest the user reconnect on the Connections page
4. Explain what you're doing before and after executing tools
`;

  return summary;
}

/**
 * Get the tool registry for reference
 */
export function getToolRegistry(): Record<string, DynamicTool[]> {
  return TOOL_REGISTRY;
}

/**
 * Get service display names
 */
export function getServiceDisplayNames(): Record<string, string> {
  return SERVICE_DISPLAY_NAMES;
}
