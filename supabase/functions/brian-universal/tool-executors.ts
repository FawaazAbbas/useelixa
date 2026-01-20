// Dynamic Tool Executors - Execute tools based on connected OAuth services
// Each executor handles API calls for a specific service

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

interface ExecutionContext {
  userId: string;
  workspaceId?: string;
  chatId?: string;
  credential: any;
}

interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  suggestion?: string;
}

/**
 * Main tool executor - routes to appropriate service executor
 */
export async function executeDynamicTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const startTime = Date.now();
  let result: ExecutionResult;

  try {
    // Route to appropriate executor based on tool name prefix
    if (toolName.startsWith("gmail_")) {
      result = await executeGmailTool(toolName, args, context);
    } else if (toolName.startsWith("google_sheets_")) {
      result = await executeSheetsTool(toolName, args, context);
    } else if (toolName.startsWith("google_drive_")) {
      result = await executeDriveTool(toolName, args, context);
    } else if (toolName.startsWith("google_calendar_")) {
      result = await executeCalendarTool(toolName, args, context);
    } else if (toolName.startsWith("notion_")) {
      result = await executeNotionTool(toolName, args, context);
    } else if (toolName.startsWith("slack_")) {
      result = await executeSlackTool(toolName, args, context);
    } else if (toolName.startsWith("calendly_")) {
      result = await executeCalendlyTool(toolName, args, context);
    } else if (toolName.startsWith("outlook_") || toolName.startsWith("teams_") || toolName.startsWith("onedrive_")) {
      result = await executeMicrosoftTool(toolName, args, context);
    } else if (toolName.startsWith("hubspot_")) {
      result = await executeHubspotTool(toolName, args, context);
    } else if (toolName.startsWith("mailchimp_")) {
      result = await executeMailchimpTool(toolName, args, context);
    } else {
      result = { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    result = {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      suggestion: getSuggestionForError(error)
    };
  }

  // Log execution
  await logToolExecution(toolName, args, result, context, Date.now() - startTime);

  return result;
}

// ============ Gmail Tools ============

async function executeGmailTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { credential } = context;
  const accessToken = credential.access_token;

  if (toolName === "gmail_send_email") {
    const email = [
      `To: ${args.to}`,
      args.cc ? `Cc: ${args.cc}` : "",
      args.bcc ? `Bcc: ${args.bcc}` : "",
      `Subject: ${args.subject}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      args.message
    ].filter(Boolean).join("\r\n");

    const encoder = new TextEncoder();
    const emailBytes = encoder.encode(email);
    const base64 = btoa(String.fromCharCode(...emailBytes));
    const encodedEmail = base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ raw: encodedEmail })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { messageId: data.id, to: args.to, subject: args.subject }
    };
  }

  if (toolName === "gmail_search") {
    const maxResults = args.max_results || 10;
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(args.query)}&maxResults=${maxResults}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail API error: ${error}`);
    }

    const data = await response.json();
    const messages = data.messages || [];

    // Fetch details for each message
    const details = await Promise.all(
      messages.slice(0, 5).map(async (msg: any) => {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const headers = detail.payload?.headers || [];
          return {
            id: msg.id,
            from: headers.find((h: any) => h.name === "From")?.value || "",
            subject: headers.find((h: any) => h.name === "Subject")?.value || "",
            date: headers.find((h: any) => h.name === "Date")?.value || ""
          };
        }
        return { id: msg.id };
      })
    );

    return {
      success: true,
      data: { count: messages.length, emails: details }
    };
  }

  if (toolName === "gmail_read_email") {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${args.message_id}?format=full`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gmail API error: ${error}`);
    }

    const data = await response.json();
    const headers = data.payload?.headers || [];
    
    // Extract body
    let body = "";
    if (data.payload?.body?.data) {
      body = atob(data.payload.body.data.replace(/-/g, "+").replace(/_/g, "/"));
    } else if (data.payload?.parts) {
      const textPart = data.payload.parts.find((p: any) => p.mimeType === "text/plain");
      if (textPart?.body?.data) {
        body = atob(textPart.body.data.replace(/-/g, "+").replace(/_/g, "/"));
      }
    }

    return {
      success: true,
      data: {
        from: headers.find((h: any) => h.name === "From")?.value,
        to: headers.find((h: any) => h.name === "To")?.value,
        subject: headers.find((h: any) => h.name === "Subject")?.value,
        date: headers.find((h: any) => h.name === "Date")?.value,
        body: body.substring(0, 2000) // Limit body size
      }
    };
  }

  throw new Error(`Unknown Gmail tool: ${toolName}`);
}

// ============ Google Sheets Tools ============

async function executeSheetsTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { credential } = context;
  const accessToken = credential.access_token;

  if (toolName === "google_sheets_read") {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheet_id}/values/${encodeURIComponent(args.range)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sheets API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { range: data.range, values: data.values, rowCount: data.values?.length || 0 }
    };
  }

  if (toolName === "google_sheets_write") {
    const operation = args.operation || "append";
    const url = operation === "append"
      ? `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheet_id}/values/${encodeURIComponent(args.range)}:append?valueInputOption=RAW`
      : `https://sheets.googleapis.com/v4/spreadsheets/${args.spreadsheet_id}/values/${encodeURIComponent(args.range)}?valueInputOption=RAW`;

    const response = await fetch(url, {
      method: operation === "append" ? "POST" : "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ values: args.values })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Sheets API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { updatedRange: data.updates?.updatedRange || data.updatedRange, updatedRows: data.updates?.updatedRows || data.updatedRows }
    };
  }

  throw new Error(`Unknown Sheets tool: ${toolName}`);
}

// ============ Google Drive Tools ============

async function executeDriveTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { credential } = context;
  const accessToken = credential.access_token;

  if (toolName === "google_drive_list") {
    let query = args.query || "";
    if (args.folder_id) {
      query = `'${args.folder_id}' in parents`;
    }

    const params = new URLSearchParams({
      pageSize: String(args.max_results || 20),
      fields: "files(id,name,mimeType,modifiedTime,size)"
    });
    if (query) params.append("q", query);

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Drive API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { files: data.files, count: data.files?.length || 0 }
    };
  }

  if (toolName === "google_drive_upload") {
    const metadata = {
      name: args.file_name,
      mimeType: args.mime_type || "text/plain",
      ...(args.folder_id && { parents: [args.folder_id] })
    };

    const boundary = "boundary";
    const body = `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${args.mime_type || "text/plain"}\r\n\r\n${args.content}\r\n--${boundary}--`;

    const response = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Drive API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { fileId: data.id, fileName: data.name }
    };
  }

  throw new Error(`Unknown Drive tool: ${toolName}`);
}

// ============ Google Calendar Tools ============

async function executeCalendarTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { credential } = context;
  const accessToken = credential.access_token;
  const calendarId = args.calendar_id || "primary";

  if (toolName === "google_calendar_list_events") {
    const params = new URLSearchParams({
      maxResults: String(args.max_results || 10),
      singleEvents: "true",
      orderBy: "startTime"
    });
    if (args.time_min) params.append("timeMin", args.time_min);
    if (args.time_max) params.append("timeMax", args.time_max);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendar API error: ${error}`);
    }

    const data = await response.json();
    const events = (data.items || []).map((e: any) => ({
      id: e.id,
      summary: e.summary,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      location: e.location
    }));

    return {
      success: true,
      data: { events, count: events.length }
    };
  }

  if (toolName === "google_calendar_create_event") {
    const event = {
      summary: args.summary,
      description: args.description,
      start: { dateTime: args.start_time },
      end: { dateTime: args.end_time },
      attendees: args.attendees?.map((email: string) => ({ email }))
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendar API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { eventId: data.id, summary: data.summary, htmlLink: data.htmlLink }
    };
  }

  throw new Error(`Unknown Calendar tool: ${toolName}`);
}

// ============ Notion Tools ============

async function executeNotionTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { credential } = context;
  const accessToken = credential.access_token;

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json"
  };

  if (toolName === "notion_search") {
    const body: any = { query: args.query };
    if (args.filter) {
      body.filter = { property: "object", value: args.filter };
    }

    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Notion API error: ${error}`);
    }

    const data = await response.json();
    const results = (data.results || []).map((r: any) => ({
      id: r.id,
      type: r.object,
      title: r.properties?.title?.title?.[0]?.plain_text || r.title?.[0]?.plain_text || "Untitled"
    }));

    return {
      success: true,
      data: { results, count: results.length }
    };
  }

  if (toolName === "notion_create_page") {
    const page = {
      parent: { database_id: args.database_id },
      properties: {
        title: { title: [{ text: { content: args.title } }] },
        ...args.properties
      },
      children: args.content ? [{
        object: "block",
        type: "paragraph",
        paragraph: {
          rich_text: [{ type: "text", text: { content: args.content } }]
        }
      }] : []
    };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers,
      body: JSON.stringify(page)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Notion API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { pageId: data.id, url: data.url }
    };
  }

  if (toolName === "notion_query_database") {
    const response = await fetch(
      `https://api.notion.com/v1/databases/${args.database_id}/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          filter: args.filter || {},
          page_size: args.page_size || 100
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Notion API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { results: data.results, count: data.results?.length || 0, hasMore: data.has_more }
    };
  }

  if (toolName === "notion_update_page") {
    const response = await fetch(`https://api.notion.com/v1/pages/${args.page_id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ properties: args.properties })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Notion API error: ${error}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: { pageId: data.id, updated: true }
    };
  }

  throw new Error(`Unknown Notion tool: ${toolName}`);
}

// ============ Slack Tools ============

async function executeSlackTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { credential } = context;
  const accessToken = credential.access_token;

  if (toolName === "slack_send_message") {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        channel: args.channel,
        text: args.text,
        thread_ts: args.thread_ts
      })
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    return {
      success: true,
      data: { channel: data.channel, ts: data.ts }
    };
  }

  if (toolName === "slack_list_channels") {
    const response = await fetch(
      `https://slack.com/api/conversations.list?types=${args.types || "public_channel"}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    const channels = (data.channels || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      isPrivate: c.is_private
    }));

    return {
      success: true,
      data: { channels, count: channels.length }
    };
  }

  if (toolName === "slack_get_messages") {
    const response = await fetch(
      `https://slack.com/api/conversations.history?channel=${args.channel}&limit=${args.limit || 10}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const data = await response.json();
    if (!data.ok) {
      throw new Error(`Slack API error: ${data.error}`);
    }

    const messages = (data.messages || []).map((m: any) => ({
      ts: m.ts,
      user: m.user,
      text: m.text?.substring(0, 500)
    }));

    return {
      success: true,
      data: { messages, count: messages.length }
    };
  }

  throw new Error(`Unknown Slack tool: ${toolName}`);
}

// ============ Calendly Tools ============

async function executeCalendlyTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { credential } = context;
  const accessToken = credential.access_token;

  // First get current user
  const userResponse = await fetch("https://api.calendly.com/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!userResponse.ok) {
    const error = await userResponse.text();
    throw new Error(`Calendly API error: ${error}`);
  }

  const userData = await userResponse.json();
  const userUri = userData.resource?.uri;

  if (toolName === "calendly_list_events") {
    const params = new URLSearchParams({ user: userUri });
    if (args.start_time) params.append("min_start_time", args.start_time);
    if (args.end_time) params.append("max_start_time", args.end_time);
    if (args.status) params.append("status", args.status);

    const response = await fetch(`https://api.calendly.com/scheduled_events?${params}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendly API error: ${error}`);
    }

    const data = await response.json();
    const events = (data.collection || []).map((e: any) => ({
      name: e.name,
      startTime: e.start_time,
      endTime: e.end_time,
      status: e.status
    }));

    return {
      success: true,
      data: { events, count: events.length }
    };
  }

  if (toolName === "calendly_get_event_types") {
    const response = await fetch(`https://api.calendly.com/event_types?user=${userUri}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendly API error: ${error}`);
    }

    const data = await response.json();
    const eventTypes = (data.collection || []).map((e: any) => ({
      name: e.name,
      slug: e.slug,
      duration: e.duration,
      active: e.active
    }));

    return {
      success: true,
      data: { eventTypes, count: eventTypes.length }
    };
  }

  throw new Error(`Unknown Calendly tool: ${toolName}`);
}

// ============ Microsoft Tools ============

async function executeMicrosoftTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { credential } = context;
  const accessToken = credential.access_token;

  if (toolName === "outlook_send_email") {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: {
          subject: args.subject,
          body: { contentType: "HTML", content: args.body },
          toRecipients: [{ emailAddress: { address: args.to } }],
          ccRecipients: args.cc ? args.cc.split(",").map((e: string) => ({ emailAddress: { address: e.trim() } })) : []
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Microsoft Graph API error: ${error}`);
    }

    return { success: true, data: { sent: true, to: args.to } };
  }

  if (toolName === "outlook_search_email") {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/messages?$search="${encodeURIComponent(args.query)}"&$top=${args.top || 10}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Microsoft Graph API error: ${error}`);
    }

    const data = await response.json();
    const emails = (data.value || []).map((e: any) => ({
      id: e.id,
      subject: e.subject,
      from: e.from?.emailAddress?.address,
      receivedDateTime: e.receivedDateTime
    }));

    return { success: true, data: { emails, count: emails.length } };
  }

  if (toolName === "teams_send_message") {
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${args.team_id}/channels/${args.channel_id}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          body: { content: args.content }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Microsoft Graph API error: ${error}`);
    }

    const data = await response.json();
    return { success: true, data: { messageId: data.id } };
  }

  if (toolName === "onedrive_list_files") {
    const path = args.folder_path ? `/root:${args.folder_path}:/children` : "/root/children";
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive${path}?$top=${args.top || 25}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Microsoft Graph API error: ${error}`);
    }

    const data = await response.json();
    const files = (data.value || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      lastModified: f.lastModifiedDateTime
    }));

    return { success: true, data: { files, count: files.length } };
  }

  throw new Error(`Unknown Microsoft tool: ${toolName}`);
}

// ============ HubSpot Tools ============

async function executeHubspotTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { credential } = context;
  const accessToken = credential.access_token;

  if (toolName === "hubspot_create_contact") {
    const properties: Record<string, string> = { email: args.email };
    if (args.firstname) properties.firstname = args.firstname;
    if (args.lastname) properties.lastname = args.lastname;
    if (args.phone) properties.phone = args.phone;
    if (args.company) properties.company = args.company;

    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ properties })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HubSpot API error: ${error}`);
    }

    const data = await response.json();
    return { success: true, data: { contactId: data.id } };
  }

  if (toolName === "hubspot_search_contacts") {
    const response = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: args.query,
        limit: args.limit || 10,
        properties: ["email", "firstname", "lastname", "company"]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HubSpot API error: ${error}`);
    }

    const data = await response.json();
    return { success: true, data: { contacts: data.results, count: data.total } };
  }

  throw new Error(`Unknown HubSpot tool: ${toolName}`);
}

// ============ Mailchimp Tools ============

async function executeMailchimpTool(
  toolName: string,
  args: any,
  context: ExecutionContext
): Promise<ExecutionResult> {
  const { credential } = context;
  const accessToken = credential.access_token;

  // Mailchimp requires the datacenter from the access token metadata
  // For now, we'll use the default approach
  const dc = credential.server || "us1"; // This should come from the OAuth response

  if (toolName === "mailchimp_list_audiences") {
    const response = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mailchimp API error: ${error}`);
    }

    const data = await response.json();
    const lists = (data.lists || []).map((l: any) => ({
      id: l.id,
      name: l.name,
      memberCount: l.stats?.member_count
    }));

    return { success: true, data: { audiences: lists, count: lists.length } };
  }

  if (toolName === "mailchimp_add_subscriber") {
    const response = await fetch(
      `https://${dc}.api.mailchimp.com/3.0/lists/${args.list_id}/members`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email_address: args.email,
          status: "subscribed",
          merge_fields: {
            FNAME: args.first_name || "",
            LNAME: args.last_name || ""
          },
          tags: args.tags || []
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Mailchimp API error: ${error}`);
    }

    const data = await response.json();
    return { success: true, data: { memberId: data.id, email: data.email_address } };
  }

  throw new Error(`Unknown Mailchimp tool: ${toolName}`);
}

// ============ Helpers ============

function getSuggestionForError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("401") || message.includes("unauthorized")) {
    return "Your connection may have expired. Please reconnect on the Connections page.";
  }
  if (message.includes("403") || message.includes("forbidden")) {
    return "You may not have permission for this action. Check your account settings.";
  }
  if (message.includes("429") || message.includes("rate limit")) {
    return "Rate limit reached. Please wait a moment and try again.";
  }
  if (message.includes("404") || message.includes("not found")) {
    return "The requested resource was not found. Please verify the ID or URL.";
  }

  return "Please try again or check the Connections page if the issue persists.";
}

export async function logToolExecution(
  toolName: string,
  args: any,
  result: ExecutionResult,
  context: ExecutionContext,
  executionTimeMs: number
): Promise<void> {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("tool_execution_log").insert({
      user_id: context.userId,
      chat_id: context.chatId || null,
      workspace_id: context.workspaceId || null,
      tool_name: toolName,
      credential_type: context.credential?.credential_type || null,
      input_summary: JSON.stringify(args).substring(0, 500),
      output_summary: JSON.stringify(result.data || result.error).substring(0, 500),
      success: result.success,
      error_message: result.error || null,
      execution_time_ms: executionTimeMs
    });

    // Update credential usage stats
    if (context.credential?.id) {
      await supabase
        .from("user_credentials")
        .update({
          last_used_at: new Date().toISOString(),
          usage_count: (context.credential.usage_count || 0) + 1
        })
        .eq("id", context.credential.id);
    }
  } catch (error) {
    console.error("Failed to log tool execution:", error);
  }
}

/**
 * Execute an external tool - wrapper for executeDynamicTool
 */
export async function executeExternalTool(
  toolName: string,
  args: any,
  userId: string,
  workspaceId?: string,
  chatId?: string,
  credential?: any
): Promise<{ success: boolean; result: string }> {
  const context: ExecutionContext = {
    userId,
    workspaceId,
    chatId,
    credential
  };

  const result = await executeDynamicTool(toolName, args, context);
  
  if (result.success) {
    return {
      success: true,
      result: `✅ ${toolName} executed successfully: ${JSON.stringify(result.data)}`
    };
  } else {
    return {
      success: false,
      result: `❌ ${toolName} failed: ${result.error}${result.suggestion ? ` (${result.suggestion})` : ""}`
    };
  }
}
