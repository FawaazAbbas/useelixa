import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_MESSAGES_PER_MINUTE = 20;
const MONTHLY_AI_CALL_LIMIT = 1000; // Default limit per org

// Tool definitions for the AI
const TOOL_DEFINITIONS = [
  // Gmail tools - Full capabilities
  { type: "function", function: { name: "gmail_list_emails", description: "List recent emails from Gmail inbox. Can filter by label (INBOX, SENT, DRAFTS, SPAM, TRASH, STARRED, UNREAD, etc.)", parameters: { type: "object", properties: { maxResults: { type: "number", description: "Max emails to return (default 10)" }, query: { type: "string", description: "Gmail search query (e.g., 'from:john is:unread')" }, labelIds: { type: "array", items: { type: "string" }, description: "Filter by labels like INBOX, SENT, DRAFTS, STARRED, UNREAD" } } } } },
  { type: "function", function: { name: "gmail_read_email", description: "Read a specific email by message ID. Returns full content including body, attachments info, and headers", parameters: { type: "object", properties: { messageId: { type: "string", description: "The Gmail message ID" } }, required: ["messageId"] } } },
  { type: "function", function: { name: "gmail_send_email", description: "Send a new email via Gmail. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { to: { type: "string", description: "Recipient email address" }, subject: { type: "string", description: "Email subject line" }, body: { type: "string", description: "Email body content" }, cc: { type: "string", description: "CC recipients (comma-separated)" }, bcc: { type: "string", description: "BCC recipients (comma-separated)" } }, required: ["to", "subject", "body"] } } },
  { type: "function", function: { name: "gmail_reply", description: "Reply to an existing email thread. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { messageId: { type: "string", description: "Original message ID to reply to" }, body: { type: "string", description: "Reply body content" }, replyAll: { type: "boolean", description: "Reply to all recipients if true" } }, required: ["messageId", "body"] } } },
  { type: "function", function: { name: "gmail_search", description: "Search Gmail messages using Gmail search syntax (from:, to:, subject:, is:unread, has:attachment, after:, before:, etc.)", parameters: { type: "object", properties: { query: { type: "string", description: "Gmail search query" }, maxResults: { type: "number", description: "Max results (default 10)" } }, required: ["query"] } } },
  { type: "function", function: { name: "gmail_get_labels", description: "Get all Gmail labels including custom labels", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "gmail_modify_labels", description: "Add or remove labels from an email. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { messageId: { type: "string", description: "The Gmail message ID" }, addLabels: { type: "array", items: { type: "string" }, description: "Labels to add (e.g., STARRED, UNREAD)" }, removeLabels: { type: "array", items: { type: "string" }, description: "Labels to remove" } }, required: ["messageId"] } } },
  { type: "function", function: { name: "gmail_trash", description: "Move an email to trash. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { messageId: { type: "string", description: "The Gmail message ID to trash" } }, required: ["messageId"] } } },
  { type: "function", function: { name: "gmail_mark_read", description: "Mark an email as read or unread", parameters: { type: "object", properties: { messageId: { type: "string", description: "The Gmail message ID" }, read: { type: "boolean", description: "True to mark as read, false for unread" } }, required: ["messageId", "read"] } } },
  // Google Calendar tools
  { type: "function", function: { name: "gcal_list_events", description: "List upcoming Google Calendar events", parameters: { type: "object", properties: { timeMin: { type: "string" }, timeMax: { type: "string" }, maxResults: { type: "number" } } } } },
  { type: "function", function: { name: "gcal_create_event", description: "Create a Google Calendar event. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { summary: { type: "string" }, start: { type: "string" }, end: { type: "string" }, description: { type: "string" } }, required: ["summary", "start", "end"] } } },
  // Outlook tools
  { type: "function", function: { name: "outlook_list_emails", description: "List recent emails from Outlook inbox", parameters: { type: "object", properties: { maxResults: { type: "number" }, query: { type: "string" } } } } },
  { type: "function", function: { name: "outlook_send_email", description: "Send an email via Outlook. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { to: { type: "string" }, subject: { type: "string" }, body: { type: "string" } }, required: ["to", "subject", "body"] } } },
  { type: "function", function: { name: "outlook_list_calendar", description: "List upcoming Outlook calendar events", parameters: { type: "object", properties: { startDateTime: { type: "string" }, endDateTime: { type: "string" }, maxResults: { type: "number" } } } } },
  { type: "function", function: { name: "outlook_create_event", description: "Create an Outlook calendar event. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { subject: { type: "string" }, start: { type: "string" }, end: { type: "string" }, body: { type: "string" } }, required: ["subject", "start", "end"] } } },
  { type: "function", function: { name: "onedrive_list_files", description: "List files in OneDrive", parameters: { type: "object", properties: { path: { type: "string" } } } } },
  { type: "function", function: { name: "onedrive_search_files", description: "Search files in OneDrive", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
  { type: "function", function: { name: "create_task", description: "Create a new task", parameters: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, priority: { type: "string", enum: ["low", "medium", "high"] }, dueDate: { type: "string" } }, required: ["title"] } } },
  { type: "function", function: { name: "list_tasks", description: "List user's tasks", parameters: { type: "object", properties: { status: { type: "string", enum: ["todo", "in_progress", "done"] } } } } },
  { type: "function", function: { name: "stripe_get_balance", description: "Get Stripe account balance", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "stripe_list_payments", description: "List recent Stripe payments", parameters: { type: "object", properties: { limit: { type: "number" } } } } },
  { type: "function", function: { name: "stripe_list_customers", description: "List Stripe customers", parameters: { type: "object", properties: { limit: { type: "number" }, email: { type: "string" } } } } },
  { type: "function", function: { name: "stripe_create_customer", description: "Create a new Stripe customer. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { email: { type: "string" }, name: { type: "string" }, description: { type: "string" } }, required: ["email"] } } },
  { type: "function", function: { name: "shopify_list_orders", description: "List Shopify orders", parameters: { type: "object", properties: { limit: { type: "number" }, status: { type: "string" } } } } },
  { type: "function", function: { name: "shopify_list_products", description: "List Shopify products", parameters: { type: "object", properties: { limit: { type: "number" } } } } },
  { type: "function", function: { name: "shopify_get_analytics", description: "Get Shopify analytics summary", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "shopify_create_product", description: "Create a new Shopify product. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { title: { type: "string" }, description: { type: "string" }, price: { type: "number" }, vendor: { type: "string" } }, required: ["title", "price"] } } },
  { type: "function", function: { name: "notes_list", description: "List user's notes", parameters: { type: "object", properties: { limit: { type: "number" } } } } },
  { type: "function", function: { name: "notes_search", description: "Search notes by query", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
  { type: "function", function: { name: "notes_create", description: "Create a new note. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { title: { type: "string" }, content: { type: "string" } }, required: ["title"] } } },
  { type: "function", function: { name: "search_knowledge_base", description: "Search the organization's knowledge base documents for relevant information using semantic search", parameters: { type: "object", properties: { query: { type: "string", description: "The search query" } }, required: ["query"] } } },
  { type: "function", function: { name: "local_calendar_list", description: "List upcoming events from local calendar", parameters: { type: "object", properties: { timeMin: { type: "string" }, timeMax: { type: "string" }, maxResults: { type: "number" } } } } },
  { type: "function", function: { name: "local_calendar_create", description: "Create a local calendar event. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { title: { type: "string" }, startTime: { type: "string" }, endTime: { type: "string" }, description: { type: "string" } }, required: ["title", "startTime", "endTime"] } } },
];

// Tools that require user confirmation before execution
const WRITE_TOOLS = [
  "gmail_send_email",
  "gmail_reply",
  "gmail_modify_labels",
  "gmail_trash",
  "gcal_create_event",
  "outlook_send_email",
  "outlook_create_event",
  "notes_create",
  "stripe_create_customer",
  "shopify_create_product",
  "local_calendar_create",
];

const SYSTEM_PROMPT = `You are Elixa, an intelligent AI assistant for the Elixa workspace platform. You help users manage their work, communications, and schedule.

You have access to the following capabilities:

**Gmail (Full Access):**
- List emails: gmail_list_emails (filter by labels like INBOX, SENT, DRAFTS, STARRED, UNREAD)
- Read full email content: gmail_read_email
- Send new emails: gmail_send_email (with CC/BCC support)
- Reply to emails: gmail_reply (supports reply-all)
- Search emails: gmail_search (Gmail search syntax: from:, to:, subject:, is:unread, has:attachment, etc.)
- Get all labels: gmail_get_labels
- Modify labels: gmail_modify_labels (star, archive, mark unread, etc.)
- Delete emails: gmail_trash
- Mark read/unread: gmail_mark_read

**Google Calendar:**
- View events: gcal_list_events
- Create events: gcal_create_event

**Outlook & OneDrive:**
- Read and send Outlook emails: outlook_list_emails, outlook_send_email
- Manage Outlook calendar: outlook_list_calendar, outlook_create_event
- Browse OneDrive: onedrive_list_files, onedrive_search_files

**Local Calendar:**
- View events: local_calendar_list
- Create events: local_calendar_create

**Tasks:**
- Create and list tasks: create_task, list_tasks

**Business Tools:**
- Stripe: stripe_get_balance, stripe_list_payments, stripe_list_customers, stripe_create_customer
- Shopify: shopify_list_orders, shopify_list_products, shopify_get_analytics, shopify_create_product

**Notes & Knowledge:**
- Manage notes: notes_list, notes_search, notes_create
- Search documents: search_knowledge_base

When a user asks to draft or send an email, proactively compose the email and ask for confirmation to send it using gmail_send_email (or outlook_send_email if the user prefers Outlook).
When using tools that modify data, always clearly explain what you're about to do and ask for confirmation.

Be helpful, concise, and proactive.

Current date/time: ${new Date().toISOString()}`;

/**
 * Retrieve relevant conversation memories for context
 */
async function getConversationMemories(
  serviceSupabase: any,
  userId: string,
  currentMessage: string
): Promise<string> {
  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const embeddingResponse = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: currentMessage,
      }),
    });

    if (!embeddingResponse.ok) {
      console.log("[Memory] Could not generate embedding for memory recall");
      return "";
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data?.[0]?.embedding;

    if (!queryEmbedding) {
      return "";
    }

    const { data: memories, error } = await serviceSupabase.rpc(
      "match_conversation_memories",
      {
        query_embedding: queryEmbedding,
        match_user_id: userId,
        match_threshold: 0.6,
        match_count: 3,
      }
    );

    if (error || !memories || memories.length === 0) {
      return "";
    }

    const memoryContext = memories
      .map((m: any) => `[Previous conversation about ${m.key_topics?.join(", ") || "various topics"}]: ${m.summary}`)
      .join("\n");

    console.log(`[Memory] Retrieved ${memories.length} relevant memories`);
    return `\n\nRelevant context from past conversations:\n${memoryContext}`;
  } catch (error) {
    console.error("[Memory] Error retrieving memories:", error);
    return "";
  }
}

// Helper to check rate limits
async function checkRateLimits(
  serviceSupabase: any, 
  userId: string, 
  orgId: string | null
): Promise<{ allowed: boolean; reason?: string }> {
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - RATE_LIMIT_WINDOW_MS).toISOString();
  
  const { count: recentMessageCount } = await serviceSupabase
    .from("chat_messages_v2")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", oneMinuteAgo);

  if (recentMessageCount && recentMessageCount > MAX_MESSAGES_PER_MINUTE) {
    return { 
      allowed: false, 
      reason: "Rate limit exceeded. Please wait a moment before sending more messages." 
    };
  }

  if (orgId) {
    const currentMonth = now.toISOString().slice(0, 7) + "-01";
    
    const { data: usageData } = await serviceSupabase
      .from("usage_stats")
      .select("ai_calls")
      .eq("org_id", orgId)
      .eq("month", currentMonth)
      .single();

    if (usageData?.ai_calls && usageData.ai_calls >= MONTHLY_AI_CALL_LIMIT) {
      return { 
        allowed: false, 
        reason: "Monthly AI credit limit reached. Please upgrade your plan or wait until next month." 
      };
    }
  }

  return { allowed: true };
}

// Tool to credential type mapping
const TOOL_CREDENTIAL_MAP: Record<string, string> = {
  // Google tools - Full Gmail
  gmail_list_emails: "googleOAuth2Api",
  gmail_read_email: "googleOAuth2Api",
  gmail_send_email: "googleOAuth2Api",
  gmail_reply: "googleOAuth2Api",
  gmail_search: "googleOAuth2Api",
  gmail_get_labels: "googleOAuth2Api",
  gmail_modify_labels: "googleOAuth2Api",
  gmail_trash: "googleOAuth2Api",
  gmail_mark_read: "googleOAuth2Api",
  gcal_list_events: "googleOAuth2Api",
  gcal_create_event: "googleOAuth2Api",
  // Microsoft tools
  outlook_list_emails: "microsoft",
  outlook_send_email: "microsoft",
  outlook_list_calendar: "microsoft",
  outlook_create_event: "microsoft",
  onedrive_list_files: "microsoft",
  onedrive_search_files: "microsoft",
  // Stripe tools
  stripe_get_balance: "stripe",
  stripe_list_payments: "stripe",
  stripe_list_customers: "stripe",
  stripe_create_customer: "stripe",
  // Shopify tools
  shopify_list_orders: "shopify",
  shopify_list_products: "shopify",
  shopify_get_analytics: "shopify",
  shopify_create_product: "shopify",
  // Internal tools don't need credentials
  notes_list: "internal",
  notes_search: "internal",
  notes_create: "internal",
  create_task: "internal",
  list_tasks: "internal",
  search_knowledge_base: "internal",
  search_knowledge: "internal",
  local_calendar_list: "internal",
  local_calendar_create: "internal",
};

// Helper to verify user has required scopes for a tool
async function verifyToolScope(
  serviceSupabase: any,
  userId: string,
  toolName: string
): Promise<{ allowed: boolean; error?: string }> {
  const credentialType = TOOL_CREDENTIAL_MAP[toolName];
  
  if (!credentialType || credentialType === "internal") {
    return { allowed: true };
  }

  const { data: scopeReq } = await serviceSupabase
    .from("tool_scope_requirements")
    .select("required_scopes")
    .eq("tool_name", toolName)
    .single();

  if (!scopeReq || !scopeReq.required_scopes || scopeReq.required_scopes.length === 0) {
    const { data: credential } = await serviceSupabase
      .from("user_credentials")
      .select("id")
      .eq("user_id", userId)
      .eq("credential_type", credentialType)
      .limit(1)
      .maybeSingle();

    if (!credential) {
      return { 
        allowed: false, 
        error: `${toolName.replace(/_/g, " ")} requires connecting your ${credentialType.replace(/Api$/, "").replace(/OAuth2/, "")} account first. Go to Connections to set this up.` 
      };
    }
    return { allowed: true };
  }

  const { data: credentials } = await serviceSupabase
    .from("user_credentials")
    .select("scopes")
    .eq("user_id", userId)
    .eq("credential_type", credentialType);

  if (!credentials || credentials.length === 0) {
    return { 
      allowed: false, 
      error: `${toolName.replace(/_/g, " ")} requires connecting your account first. Go to Connections to set this up.` 
    };
  }

  const requiredScopes: string[] = scopeReq.required_scopes;
  const hasRequiredScope = credentials.some((cred: any) => {
    if (!cred.scopes) return false;
    return requiredScopes.some((required: string) => 
      cred.scopes.includes(required)
    );
  });

  if (!hasRequiredScope) {
    return { 
      allowed: false, 
      error: `${toolName.replace(/_/g, " ")} requires additional permissions. Please reconnect your account with the required scopes.` 
    };
  }

  return { allowed: true };
}

// Helper to execute tools
async function executeTool(
  toolName: string, 
  args: any, 
  supabase: any, 
  userId: string,
  authHeader: string,
  serviceSupabase: any
): Promise<any> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  
  console.log(`[Chat] Executing tool: ${toolName}`, args);

  try {
    switch (toolName) {
      // Gmail tools
      case "gmail_list_emails": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list", params: { maxResults: args.maxResults, query: args.query, labelIds: args.labelIds } }),
        });
        return await response.json();
      }

      case "gmail_read_email": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "read", params: { messageId: args.messageId } }),
        });
        return await response.json();
      }

      case "gmail_send_email": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "send", params: { to: args.to, subject: args.subject, body: args.body, cc: args.cc, bcc: args.bcc } }),
        });
        return await response.json();
      }

      case "gmail_search": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "search", params: { query: args.query, maxResults: args.maxResults } }),
        });
        return await response.json();
      }

      case "gmail_reply": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "reply", params: { messageId: args.messageId, body: args.body, replyAll: args.replyAll } }),
        });
        return await response.json();
      }

      case "gmail_get_labels": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "labels", params: {} }),
        });
        return await response.json();
      }

      case "gmail_modify_labels": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "modifyLabels", params: { messageId: args.messageId, addLabels: args.addLabels, removeLabels: args.removeLabels } }),
        });
        return await response.json();
      }

      case "gmail_trash": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "trash", params: { messageId: args.messageId } }),
        });
        return await response.json();
      }

      case "gmail_mark_read": {
        const response = await fetch(`${supabaseUrl}/functions/v1/gmail-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "markRead", params: { messageId: args.messageId, read: args.read } }),
        });
        return await response.json();
      }

      // Google Calendar tools
      case "gcal_list_events": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendar-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "google_list", params: { timeMin: args.timeMin, timeMax: args.timeMax, maxResults: args.maxResults } }),
        });
        return await response.json();
      }

      case "gcal_create_event": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendar-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "google_create", params: { summary: args.summary, start: args.start, end: args.end, description: args.description } }),
        });
        return await response.json();
      }

      // Stripe tools
      case "stripe_get_balance": {
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "get_balance", params: args }),
        });
        return await response.json();
      }

      case "stripe_list_payments": {
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_charges", params: args }),
        });
        return await response.json();
      }

      case "stripe_list_customers": {
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_customers", params: args }),
        });
        return await response.json();
      }

      case "stripe_create_customer": {
        const response = await fetch(`${supabaseUrl}/functions/v1/stripe-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "create_customer", params: args }),
        });
        return await response.json();
      }

      // Shopify tools
      case "shopify_list_orders": {
        const response = await fetch(`${supabaseUrl}/functions/v1/shopify-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_orders", params: args }),
        });
        return await response.json();
      }

      case "shopify_list_products": {
        const response = await fetch(`${supabaseUrl}/functions/v1/shopify-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_products", params: args }),
        });
        return await response.json();
      }

      case "shopify_get_analytics": {
        const response = await fetch(`${supabaseUrl}/functions/v1/shopify-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "get_analytics_summary", params: args }),
        });
        return await response.json();
      }

      case "shopify_create_product": {
        const response = await fetch(`${supabaseUrl}/functions/v1/shopify-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "create_product", params: args }),
        });
        return await response.json();
      }

      // Notes tools
      case "notes_list": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notes-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list", params: args }),
        });
        return await response.json();
      }

      case "notes_search": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notes-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "search", params: args }),
        });
        return await response.json();
      }

      case "notes_create": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notes-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "create", params: args }),
        });
        return await response.json();
      }

      // Task tools
      case "create_task": {
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            user_id: userId,
            title: args.title,
            description: args.description || "",
            priority: args.priority || "medium",
            due_date: args.dueDate || null,
            status: "todo",
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, task: data };
      }

      case "list_tasks": {
        let query = supabase
          .from("tasks")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (args.status) {
          query = query.eq("status", args.status);
        }

        const { data, error } = await query.limit(20);
        if (error) throw error;
        return { tasks: data };
      }

      // Knowledge base search (legacy)
      case "search_knowledge": {
        const { data, error } = await supabase
          .from("workspace_documents")
          .select("id, title, extracted_content, created_at")
          .textSearch("extracted_content", args.query || "")
          .limit(5);

        if (error) {
          const { data: fallbackData } = await supabase
            .from("workspace_documents")
            .select("id, title, extracted_content, created_at")
            .ilike("extracted_content", `%${args.query}%`)
            .limit(5);
          return { documents: fallbackData || [] };
        }
        return { documents: data || [] };
      }

      // Knowledge base semantic search
      case "search_knowledge_base": {
        const response = await fetch(`${supabaseUrl}/functions/v1/search-knowledge-base`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: args.query, limit: args.limit || 5 }),
        });
        return await response.json();
      }

      // Microsoft/Outlook tools
      case "outlook_list_emails": {
        const response = await fetch(`${supabaseUrl}/functions/v1/microsoft-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_emails", params: args }),
        });
        return await response.json();
      }

      case "outlook_send_email": {
        const response = await fetch(`${supabaseUrl}/functions/v1/microsoft-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "send_email", params: args }),
        });
        return await response.json();
      }

      case "outlook_list_calendar": {
        const response = await fetch(`${supabaseUrl}/functions/v1/microsoft-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_calendar_events", params: args }),
        });
        return await response.json();
      }

      case "outlook_create_event": {
        const response = await fetch(`${supabaseUrl}/functions/v1/microsoft-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "create_calendar_event", params: args }),
        });
        return await response.json();
      }

      case "onedrive_list_files": {
        const response = await fetch(`${supabaseUrl}/functions/v1/microsoft-integration`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "list_files", params: args }),
        });
        return await response.json();
      }

      case "onedrive_search_files": {
        const response = await fetch(`${supabaseUrl}/functions/v1/microsoft-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "search_files", params: args }),
        });
        return await response.json();
      }

      // Local calendar tools
      case "local_calendar_list": {
        const timeMin = args?.timeMin || new Date().toISOString();
        const timeMax = args?.timeMax || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const { data, error } = await supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", userId)
          .gte("start_time", timeMin)
          .lte("end_time", timeMax)
          .order("start_time", { ascending: true })
          .limit(args?.maxResults || 20);

        if (error) throw error;
        return {
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
      }

      case "local_calendar_create": {
        const { title, startTime, endTime, description, allDay, color } = args;
        
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
        return { success: true, event: data, source: "local" };
      }

      default:
        return { error: `Unknown tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[Chat] Tool execution error:`, error);
    return { error: error instanceof Error ? error.message : "Tool execution failed" };
  }
}

// Helper to increment usage stats
async function incrementUsage(serviceSupabase: any, orgId: string, field: string) {
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
  
  try {
    const { data: existing } = await serviceSupabase
      .from("usage_stats")
      .select("id, " + field)
      .eq("org_id", orgId)
      .eq("month", currentMonth)
      .single();

    if (existing) {
      await serviceSupabase
        .from("usage_stats")
        .update({ [field]: (existing[field] || 0) + 1 })
        .eq("id", existing.id);
    } else {
      await serviceSupabase
        .from("usage_stats")
        .insert({
          org_id: orgId,
          month: currentMonth,
          [field]: 1,
        });
    }
  } catch (error) {
    console.error("[Chat] Error incrementing usage:", error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    let supabase: any = null;
    let orgId: string | null = null;

    if (authHeader) {
      supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;

      if (userId) {
        const { data: orgMember } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("user_id", userId)
          .limit(1)
          .single();
        orgId = orgMember?.org_id || null;
      }
    }

    const serviceSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (userId && orgId) {
      const rateLimitResult = await checkRateLimits(serviceSupabase, userId, orgId);
      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({ error: rateLimitResult.reason }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let memoryContext = "";
    if (userId && messages.length > 0) {
      const lastUserMessage = messages.filter((m: any) => m.role === "user").pop();
      if (lastUserMessage?.content) {
        memoryContext = await getConversationMemories(serviceSupabase, userId, lastUserMessage.content);
      }
    }

    const systemPromptWithMemory = SYSTEM_PROMPT + memoryContext;

    const formattedMessages = [
      { role: "system", content: systemPromptWithMemory },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    ];

    console.log(`[Chat] Calling AI gateway with ${formattedMessages.length} messages`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: formattedMessages,
        tools: TOOL_DEFINITIONS,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Chat] AI gateway error:", errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices?.[0]?.message;

    if (orgId) {
      await incrementUsage(serviceSupabase, orgId, "ai_calls");
    }

    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults: { tool_call_id: string; role: string; content: string }[] = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;
        let toolArgs = {};

        try {
          toolArgs = JSON.parse(toolCall.function.arguments || "{}");
        } catch {
          console.error("[Chat] Failed to parse tool arguments");
        }

        if (WRITE_TOOLS.includes(toolName)) {
          return new Response(
            JSON.stringify({
              content: assistantMessage.content || "",
              pending_action: {
                name: toolName,
                display_name: toolName.replace(/_/g, " "),
                parameters: toolArgs,
                tool_call_id: toolCall.id,
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (userId) {
          const scopeCheck = await verifyToolScope(serviceSupabase, userId, toolName);
          if (!scopeCheck.allowed) {
            toolResults.push({
              tool_call_id: toolCall.id,
              role: "tool",
              content: JSON.stringify({ error: scopeCheck.error }),
            });
            continue;
          }
        }

        const result = await executeTool(
          toolName,
          toolArgs,
          supabase,
          userId!,
          authHeader!,
          serviceSupabase
        );

        if (orgId) {
          await incrementUsage(serviceSupabase, orgId, "tool_calls");
        }

        await serviceSupabase.from("tool_execution_log").insert({
          user_id: userId,
          tool_name: toolName,
          success: !result.error,
          input_summary: JSON.stringify(toolArgs).substring(0, 500),
          output_summary: JSON.stringify(result).substring(0, 500),
        });

        toolResults.push({
          tool_call_id: toolCall.id,
          role: "tool",
          content: JSON.stringify(result),
        });
      }

      const followUpMessages = [
        ...formattedMessages,
        assistantMessage,
        ...toolResults,
      ];

      const followUpResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: followUpMessages,
        }),
      });

      if (!followUpResponse.ok) {
        throw new Error(`AI gateway follow-up error: ${followUpResponse.status}`);
      }

      const followUpAiResponse = await followUpResponse.json();
      const finalMessage = followUpAiResponse.choices?.[0]?.message;

      if (orgId) {
        await incrementUsage(serviceSupabase, orgId, "ai_calls");
      }

      return new Response(
        JSON.stringify({
          content: finalMessage?.content || "I processed that request.",
          tool_calls: assistantMessage.tool_calls.map((tc: any) => ({
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments || "{}"),
            result: toolResults.find((r) => r.tool_call_id === tc.id)?.content,
          })),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        content: assistantMessage?.content || "I'm here to help!",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Chat] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
