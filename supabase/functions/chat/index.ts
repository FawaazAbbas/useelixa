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

// Model credit costs for billing
const MODEL_CREDITS: Record<string, number> = {
  "google/gemini-2.5-flash-lite": 1,
  "google/gemini-2.5-flash": 2,
  "openai/gpt-5-nano": 2,
  "openai/gpt-5-mini": 4,
  "google/gemini-2.5-pro": 5,
  "openai/gpt-5": 8,
  "openai/gpt-5.2": 10,
};

// Premium models that require Pro/Unlimited tier
const PREMIUM_MODELS = [
  "openai/gpt-5-mini",
  "google/gemini-2.5-pro",
  "openai/gpt-5",
  "openai/gpt-5.2",
];

const VALID_MODELS = Object.keys(MODEL_CREDITS);
const DEFAULT_MODEL = "google/gemini-2.5-flash";

// Tool definitions for the AI
const TOOL_DEFINITIONS = [
  // File tools
  { type: "function", function: { name: "analyze_file", description: "Analyze an uploaded file. For images, provides detailed visual analysis. For documents, extracts and summarizes content.", parameters: { type: "object", properties: { fileUrl: { type: "string", description: "URL of the file to analyze" }, fileType: { type: "string", description: "MIME type of the file" }, analysisType: { type: "string", enum: ["summarize", "extract_text", "describe", "analyze_data"], description: "Type of analysis to perform" } }, required: ["fileUrl", "fileType"] } } },
  { type: "function", function: { name: "create_file", description: "Create and save a text-based file (markdown, text, json, csv, code) for the user to download.", parameters: { type: "object", properties: { filename: { type: "string", description: "Name of the file including extension" }, content: { type: "string", description: "Content of the file" }, fileType: { type: "string", enum: ["text/plain", "text/markdown", "application/json", "text/csv", "text/html", "text/javascript", "text/css"], description: "MIME type of the file" } }, required: ["filename", "content"] } } },
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
  // Notion tools
  { type: "function", function: { name: "notion_search", description: "Search Notion pages and databases by query", parameters: { type: "object", properties: { query: { type: "string", description: "Search query" }, limit: { type: "number", description: "Max results (default 10)" } } } } },
  { type: "function", function: { name: "notion_list_databases", description: "List all Notion databases the user has access to", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "notion_query_database", description: "Query a Notion database to retrieve entries", parameters: { type: "object", properties: { database_id: { type: "string", description: "The database ID" }, filter: { type: "object", description: "Optional filter object" }, limit: { type: "number", description: "Max results" } }, required: ["database_id"] } } },
  { type: "function", function: { name: "notion_get_page", description: "Get the content of a specific Notion page", parameters: { type: "object", properties: { page_id: { type: "string", description: "The page ID" } }, required: ["page_id"] } } },
  { type: "function", function: { name: "notion_create_page", description: "Create a new Notion page. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { parent_id: { type: "string", description: "Parent database or page ID" }, title: { type: "string", description: "Page title" }, content: { type: "string", description: "Page content" }, parent_type: { type: "string", enum: ["database_id", "page_id"], description: "Type of parent (default: database_id)" } }, required: ["parent_id", "title"] } } },
  { type: "function", function: { name: "notion_update_page", description: "Update a Notion page properties. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { page_id: { type: "string", description: "The page ID to update" }, properties: { type: "object", description: "Properties to update" }, archived: { type: "boolean", description: "Set to true to archive the page" } }, required: ["page_id"] } } },
  // Calendly tools
  { type: "function", function: { name: "calendly_get_user", description: "Get the current Calendly user profile information including scheduling URL", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "calendly_list_event_types", description: "List all Calendly event types (meeting templates) the user has created", parameters: { type: "object", properties: { limit: { type: "number", description: "Max results (default 25)" } } } } },
  { type: "function", function: { name: "calendly_list_scheduled_events", description: "List scheduled Calendly events/meetings", parameters: { type: "object", properties: { status: { type: "string", enum: ["active", "canceled"], description: "Filter by status" }, min_start_time: { type: "string", description: "ISO datetime for earliest start" }, max_start_time: { type: "string", description: "ISO datetime for latest start" }, limit: { type: "number", description: "Max results (default 25)" } } } } },
  { type: "function", function: { name: "calendly_get_event", description: "Get details of a specific scheduled Calendly event", parameters: { type: "object", properties: { event_uuid: { type: "string", description: "The event UUID" } }, required: ["event_uuid"] } } },
  { type: "function", function: { name: "calendly_get_invitees", description: "Get invitees/attendees of a scheduled Calendly event", parameters: { type: "object", properties: { event_uuid: { type: "string", description: "The event UUID" } }, required: ["event_uuid"] } } },
  { type: "function", function: { name: "calendly_check_availability", description: "Check available time slots for a Calendly event type", parameters: { type: "object", properties: { event_type_uri: { type: "string", description: "The event type URI" }, start_time: { type: "string", description: "ISO datetime for start of range" }, end_time: { type: "string", description: "ISO datetime for end of range" } }, required: ["event_type_uri"] } } },
  { type: "function", function: { name: "calendly_cancel_event", description: "Cancel a scheduled Calendly event. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { event_uuid: { type: "string", description: "The event UUID to cancel" }, reason: { type: "string", description: "Cancellation reason" } }, required: ["event_uuid"] } } },
  // Google Ads tools
  { type: "function", function: { name: "gads_list_customers", description: "List accessible Google Ads customer accounts", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "gads_get_campaigns", description: "Get Google Ads campaigns with performance metrics", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, startDate: { type: "string", description: "Start date (YYYY-MM-DD)" }, endDate: { type: "string", description: "End date (YYYY-MM-DD)" } }, required: ["customerId"] } } },
  { type: "function", function: { name: "gads_get_ad_groups", description: "Get ad groups with performance metrics", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, campaignId: { type: "string", description: "Filter by campaign ID" } }, required: ["customerId"] } } },
  { type: "function", function: { name: "gads_get_ads", description: "Get ads with performance metrics", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, campaignId: { type: "string" }, adGroupId: { type: "string" } }, required: ["customerId"] } } },
  { type: "function", function: { name: "gads_get_keywords", description: "Get keywords with performance and quality score", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, campaignId: { type: "string" }, adGroupId: { type: "string" } }, required: ["customerId"] } } },
  { type: "function", function: { name: "gads_get_budget_summary", description: "Get budget summary across campaigns", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" } }, required: ["customerId"] } } },
  { type: "function", function: { name: "gads_get_account_performance", description: "Get overall account performance metrics", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["customerId"] } } },
  { type: "function", function: { name: "gads_update_campaign_status", description: "Enable, pause, or remove a Google Ads campaign. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, campaignId: { type: "string", description: "Campaign ID to update" }, status: { type: "string", enum: ["ENABLED", "PAUSED", "REMOVED"], description: "New status" } }, required: ["customerId", "campaignId", "status"] } } },
  { type: "function", function: { name: "gads_update_campaign_budget", description: "Update a Google Ads campaign budget amount. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, budgetId: { type: "string", description: "Budget ID to update" }, amount: { type: "number", description: "New daily budget amount in currency units" } }, required: ["customerId", "budgetId", "amount"] } } },
  { type: "function", function: { name: "gads_update_ad_group_status", description: "Enable, pause, or remove a Google Ads ad group. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, adGroupId: { type: "string", description: "Ad group ID to update" }, status: { type: "string", enum: ["ENABLED", "PAUSED", "REMOVED"], description: "New status" } }, required: ["customerId", "adGroupId", "status"] } } },
  { type: "function", function: { name: "gads_update_ad_status", description: "Enable, pause, or remove a Google Ads ad. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, adGroupId: { type: "string", description: "Ad group ID" }, adId: { type: "string", description: "Ad ID to update" }, status: { type: "string", enum: ["ENABLED", "PAUSED", "REMOVED"], description: "New status" } }, required: ["customerId", "adGroupId", "adId", "status"] } } },
  { type: "function", function: { name: "gads_update_keyword_status", description: "Enable, pause, or remove a keyword. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, adGroupId: { type: "string", description: "Ad group ID" }, criterionId: { type: "string", description: "Keyword criterion ID" }, status: { type: "string", enum: ["ENABLED", "PAUSED", "REMOVED"], description: "New status" } }, required: ["customerId", "adGroupId", "criterionId", "status"] } } },
  { type: "function", function: { name: "gads_add_keyword", description: "Add a new keyword to an ad group. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { customerId: { type: "string", description: "Google Ads customer ID" }, adGroupId: { type: "string", description: "Ad group ID" }, keywordText: { type: "string", description: "Keyword text" }, matchType: { type: "string", enum: ["EXACT", "PHRASE", "BROAD"], description: "Match type (default: BROAD)" } }, required: ["customerId", "adGroupId", "keywordText"] } } },
  // Google Analytics tools - Reporting (Data API)
  { type: "function", function: { name: "ga_list_accounts", description: "List all Google Analytics accounts accessible by the connected Google account. Use this first to discover available accounts, then use ga_list_properties to find property IDs.", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "ga_list_properties", description: "List Google Analytics 4 properties. Returns NUMERIC property IDs (e.g., 266890436) which are used for all other GA tools. IMPORTANT: Property ID is numeric and different from Measurement ID (G-XXXXXX which is used in tracking code).", parameters: { type: "object", properties: { accountId: { type: "string", description: "Optional: Filter by account ID to show properties for a specific account" } } } } },
  { type: "function", function: { name: "ga_get_traffic", description: "Get website traffic data (pageviews, sessions, users). The propertyId MUST be numeric (e.g., 266890436), NOT a Measurement ID (G-XXXXXX).", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID (e.g., 266890436)" }, startDate: { type: "string", description: "Start date (YYYY-MM-DD or relative like '30daysAgo')" }, endDate: { type: "string", description: "End date (YYYY-MM-DD or 'today')" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_user_behavior", description: "Get user behavior data (engagement, bounce rate, session duration). Property ID must be numeric.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_conversions", description: "Get conversion and event data. Property ID must be numeric.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, eventFilter: { type: "string" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_top_pages", description: "Get top pages by pageviews with scroll depth (users who scrolled 90%+). Property ID must be numeric.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_exit_pages", description: "Get exit page analysis showing which pages users most frequently leave from. Returns exit page paths with session counts and engagement metrics.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_traffic_sources", description: "Get traffic sources breakdown. Property ID must be numeric.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_realtime", description: "Get realtime active users. Property ID must be numeric.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_demographics", description: "Get user demographics data (country, city). Property ID must be numeric.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_devices", description: "Get device category breakdown (desktop, mobile, tablet) with sessions, users, and engagement metrics.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_ecommerce", description: "Get e-commerce metrics (transactions, revenue, items purchased). Property ID must be numeric.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_landing_pages", description: "Get landing page performance with sessions, bounce rate, and conversions.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  // Phase 1: High-Priority Reporting Tools
  { type: "function", function: { name: "ga_get_page_traffic_sources", description: "Get traffic source breakdown for specific pages. Shows where visitors to each page come from (organic, paid, social, direct, etc.). Can filter to specific page paths.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, pagePath: { type: "string", description: "Filter to pages containing this path (e.g., '/products', '/blog')" }, exactMatch: { type: "boolean", description: "If true, match exact page path. If false (default), match contains." }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number", description: "Max results (default 50)" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_run_custom_report", description: "Run a custom GA4 report with any combination of dimensions and metrics. Maximum 9 dimensions and 10 metrics per query. This is the most flexible reporting tool.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, dimensions: { type: "array", items: { type: "string" }, description: "Array of dimension names (e.g., ['pagePath', 'sessionSource']). Max 9." }, metrics: { type: "array", items: { type: "string" }, description: "Array of metric names (e.g., ['sessions', 'bounceRate']). Max 10." }, startDate: { type: "string" }, endDate: { type: "string" }, dimensionFilter: { type: "object", description: "Optional dimension filter object" }, orderBy: { type: "object", description: "Optional ordering specification" }, limit: { type: "number", description: "Max results (default 100)" } }, required: ["propertyId", "dimensions", "metrics"] } } },
  { type: "function", function: { name: "ga_get_events", description: "Get all events with their counts, users, and values. Shows which events are being triggered most.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_campaigns", description: "Get UTM campaign performance data with sessions, users, conversions, and engagement by campaign name, source, and medium.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_compare_periods", description: "Compare metrics between two time periods (e.g., this week vs last week). Returns data for both periods for easy comparison.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, period1Start: { type: "string", description: "First period start date (YYYY-MM-DD)" }, period1End: { type: "string", description: "First period end date (YYYY-MM-DD)" }, period2Start: { type: "string", description: "Second period start date (YYYY-MM-DD)" }, period2End: { type: "string", description: "Second period end date (YYYY-MM-DD)" }, dimensions: { type: "array", items: { type: "string" }, description: "Dimensions to include (default: date)" }, metrics: { type: "array", items: { type: "string" }, description: "Metrics to compare" }, limit: { type: "number" } }, required: ["propertyId", "period1Start", "period1End", "period2Start", "period2End"] } } },
  { type: "function", function: { name: "ga_get_user_journey", description: "Get user path/journey analysis showing landing page to subsequent page combinations. Useful for understanding user navigation patterns.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_hourly", description: "Get hour-of-day and day-of-week performance patterns. Shows when your audience is most active.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string", description: "Recommend using at least 7daysAgo for meaningful patterns" }, endDate: { type: "string" } }, required: ["propertyId"] } } },
  // Phase 2: Extended Demographics & Behavior
  { type: "function", function: { name: "ga_get_age_gender", description: "Get age and gender demographics breakdown. Requires Google Signals to be enabled for complete data.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_interests", description: "Get user interest categories (affinity categories). Shows what topics your audience is interested in.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_browser_os", description: "Get browser and operating system breakdown with engagement metrics.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_new_vs_returning", description: "Compare new vs returning users with sessions, bounce rate, conversions, and engagement.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_content_groups", description: "Get content group performance. Requires content_group parameter in your GA4 implementation.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, startDate: { type: "string" }, endDate: { type: "string" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_cohort_analysis", description: "Get cohort retention analysis. Shows how user groups behave over time.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, cohortSpec: { type: "object", description: "Cohort specification object (optional, defaults to weekly cohorts)" } }, required: ["propertyId"] } } },
  // Google Analytics tools - Configuration (Admin API)
  { type: "function", function: { name: "ga_list_conversion_events", description: "List all conversion events configured in a GA4 property.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_create_conversion_event", description: "Mark an event as a conversion in GA4. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, eventName: { type: "string", description: "Name of the event to mark as conversion" } }, required: ["propertyId", "eventName"] } } },
  { type: "function", function: { name: "ga_list_custom_dimensions", description: "List all custom dimensions configured in a GA4 property.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_create_custom_dimension", description: "Create a new custom dimension in GA4. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, parameterName: { type: "string", description: "Event parameter name to use" }, displayName: { type: "string", description: "Display name for the dimension" }, description: { type: "string", description: "Description of the dimension" }, scope: { type: "string", enum: ["EVENT", "USER"], description: "Scope of the dimension (default: EVENT)" } }, required: ["propertyId", "parameterName", "displayName"] } } },
  { type: "function", function: { name: "ga_update_custom_dimension", description: "Update an existing custom dimension. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, dimensionId: { type: "string", description: "The custom dimension ID to update" }, displayName: { type: "string", description: "New display name" }, description: { type: "string", description: "New description" } }, required: ["propertyId", "dimensionId"] } } },
  { type: "function", function: { name: "ga_archive_dimension", description: "Archive a custom dimension (soft delete). REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, dimensionId: { type: "string", description: "The custom dimension ID to archive" } }, required: ["propertyId", "dimensionId"] } } },
  { type: "function", function: { name: "ga_list_custom_metrics", description: "List all custom metrics configured in a GA4 property.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_create_custom_metric", description: "Create a new custom metric in GA4. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, parameterName: { type: "string", description: "Event parameter name to use" }, displayName: { type: "string", description: "Display name for the metric" }, description: { type: "string", description: "Description of the metric" }, measurementUnit: { type: "string", enum: ["STANDARD", "CURRENCY", "FEET", "METERS", "KILOMETERS", "MILES", "MILLISECONDS", "SECONDS", "MINUTES", "HOURS"], description: "Unit of measurement (default: STANDARD)" } }, required: ["propertyId", "parameterName", "displayName"] } } },
  { type: "function", function: { name: "ga_update_custom_metric", description: "Update an existing custom metric. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, metricId: { type: "string", description: "The custom metric ID to update" }, displayName: { type: "string", description: "New display name" }, description: { type: "string", description: "New description" } }, required: ["propertyId", "metricId"] } } },
  { type: "function", function: { name: "ga_archive_metric", description: "Archive a custom metric (soft delete). REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, metricId: { type: "string", description: "The custom metric ID to archive" } }, required: ["propertyId", "metricId"] } } },
  { type: "function", function: { name: "ga_list_data_streams", description: "List all data streams (web/app) for a GA4 property.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_get_data_stream", description: "Get details of a specific data stream including Measurement ID.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, streamId: { type: "string", description: "Data stream ID" } }, required: ["propertyId", "streamId"] } } },
  { type: "function", function: { name: "ga_list_audiences", description: "List all audiences configured in a GA4 property.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_create_audience", description: "Create a new audience in GA4. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, displayName: { type: "string", description: "Audience name" }, description: { type: "string", description: "Audience description" }, membershipDurationDays: { type: "number", description: "How long users remain in audience (default 30)" }, filterClauses: { type: "array", description: "Audience filter clauses (optional, defaults to new users)" } }, required: ["propertyId", "displayName"] } } },
  // Phase 3: Advanced Admin API
  { type: "function", function: { name: "ga_list_key_events", description: "List key events (formerly conversions) in a GA4 property.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_create_key_event", description: "Create a new key event in GA4. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, eventName: { type: "string", description: "Event name to mark as key event" }, countingMethod: { type: "string", enum: ["ONCE_PER_EVENT", "ONCE_PER_SESSION"], description: "How to count the event (default: ONCE_PER_EVENT)" } }, required: ["propertyId", "eventName"] } } },
  { type: "function", function: { name: "ga_list_google_ads_links", description: "List Google Ads links connected to a GA4 property.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" } }, required: ["propertyId"] } } },
  { type: "function", function: { name: "ga_create_google_ads_link", description: "Link a Google Ads account to GA4 property. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, customerId: { type: "string", description: "Google Ads customer ID to link" }, adsPersonalizationEnabled: { type: "boolean", description: "Enable ads personalization (default: true)" } }, required: ["propertyId", "customerId"] } } },
  { type: "function", function: { name: "ga_get_change_history", description: "Get property change history/audit trail.", parameters: { type: "object", properties: { propertyId: { type: "string", description: "Numeric GA4 property ID" }, resourceType: { type: "string", description: "Filter by resource type" }, earliestChangeTime: { type: "string", description: "ISO datetime for earliest change" }, latestChangeTime: { type: "string", description: "ISO datetime for latest change" }, limit: { type: "number" } }, required: ["propertyId"] } } },
  // Google Sheets tools
  { type: "function", function: { name: "sheets_list", description: "List Google Sheets spreadsheets accessible to the user", parameters: { type: "object", properties: { maxResults: { type: "number", description: "Max results (default 20)" }, query: { type: "string", description: "Search query to filter by name" } } } } },
  { type: "function", function: { name: "sheets_get", description: "Get spreadsheet metadata including list of sheets/tabs", parameters: { type: "object", properties: { spreadsheetId: { type: "string", description: "The spreadsheet ID from the URL" } }, required: ["spreadsheetId"] } } },
  { type: "function", function: { name: "sheets_read", description: "Read data from a specific range in a spreadsheet", parameters: { type: "object", properties: { spreadsheetId: { type: "string", description: "The spreadsheet ID" }, range: { type: "string", description: "A1 notation range (e.g., 'Sheet1!A1:D10' or just 'Sheet1')" } }, required: ["spreadsheetId"] } } },
  { type: "function", function: { name: "sheets_update", description: "Update data in a specific range. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { spreadsheetId: { type: "string", description: "The spreadsheet ID" }, range: { type: "string", description: "A1 notation range (e.g., 'Sheet1!A1:D10')" }, values: { type: "array", description: "2D array of values to write", items: { type: "array", items: { type: "string" } } } }, required: ["spreadsheetId", "range", "values"] } } },
  { type: "function", function: { name: "sheets_append", description: "Append rows to the end of a sheet. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { spreadsheetId: { type: "string", description: "The spreadsheet ID" }, range: { type: "string", description: "The sheet name or range to append to (e.g., 'Sheet1')" }, values: { type: "array", description: "2D array of row values to append", items: { type: "array", items: { type: "string" } } } }, required: ["spreadsheetId", "range", "values"] } } },
  { type: "function", function: { name: "sheets_clear", description: "Clear data in a specific range. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { spreadsheetId: { type: "string", description: "The spreadsheet ID" }, range: { type: "string", description: "A1 notation range to clear" } }, required: ["spreadsheetId", "range"] } } },
  { type: "function", function: { name: "sheets_create", description: "Create a new spreadsheet. REQUIRES CONFIRMATION.", parameters: { type: "object", properties: { title: { type: "string", description: "Title of the new spreadsheet" } }, required: ["title"] } } },
  // Image Generation
  { type: "function", function: { name: "generate_image", description: "Generate an AI image based on a text prompt. Returns a downloadable image URL.", parameters: { type: "object", properties: { prompt: { type: "string", description: "Detailed description of the image to generate" }, style: { type: "string", enum: ["realistic", "artistic", "cartoon", "abstract"], description: "Style of the image (optional)" } }, required: ["prompt"] } } },
  // Memory/Personalization tools
  { type: "function", function: { name: "remember_fact", description: "Store a fact or preference about the user for future conversations. Use this when users share personal preferences, facts about themselves, or request you remember something.", parameters: { type: "object", properties: { key: { type: "string", description: "Short identifier for the memory (e.g., 'preferred_language', 'name', 'timezone')" }, value: { type: "string", description: "The value to remember" }, category: { type: "string", enum: ["preference", "fact", "context"], description: "Category of the memory" } }, required: ["key", "value"] } } },
  { type: "function", function: { name: "recall_memories", description: "Retrieve stored memories/facts about the user", parameters: { type: "object", properties: {} } } },
  { type: "function", function: { name: "forget_memory", description: "Delete a stored memory by its key", parameters: { type: "object", properties: { key: { type: "string", description: "The memory key to forget" } }, required: ["key"] } } },
  // Suggested follow-ups (internal tool)
  { type: "function", function: { name: "suggest_followups", description: "Generate contextual follow-up question suggestions for the user. Use this after providing helpful responses.", parameters: { type: "object", properties: { context: { type: "string", description: "Brief context of the current conversation" } }, required: ["context"] } } },
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
  "notion_create_page",
  "notion_update_page",
  "calendly_cancel_event",
  "gads_update_campaign_status",
  "gads_update_campaign_budget",
  "gads_update_ad_group_status",
  "gads_update_ad_status",
  "gads_update_keyword_status",
  "gads_add_keyword",
  "sheets_update",
  "sheets_append",
  "sheets_clear",
  "sheets_create",
  "ga_create_conversion_event",
  "ga_create_custom_dimension",
  "ga_create_custom_metric",
  // Phase 3 GA write tools
  "ga_update_custom_dimension",
  "ga_update_custom_metric",
  "ga_archive_dimension",
  "ga_archive_metric",
  "ga_create_key_event",
  "ga_create_google_ads_link",
  "ga_create_audience",
];

// Model for lightweight tasks (title generation) - always use cheapest
const LITE_MODEL = "google/gemini-2.5-flash-lite";

/**
 * Generate a smart, descriptive chat title based on the conversation
 */
async function generateSmartTitle(
  serviceSupabase: any,
  sessionId: string,
  userMessage: string,
  assistantResponse: string,
  LOVABLE_API_KEY: string
): Promise<void> {
  try {
    // Check if this session already has a descriptive title (not just the first message)
    const { data: session } = await serviceSupabase
      .from("chat_sessions_v2")
      .select("title, created_at")
      .eq("id", sessionId)
      .single();

    if (!session) return;

    // Only generate a new title if the current title looks like a raw first message
    // (i.e., longer than 50 chars or matches the user message pattern)
    const currentTitle = session.title;
    const shouldGenerateTitle = 
      currentTitle.length > 40 || 
      currentTitle.includes("...") ||
      currentTitle.toLowerCase().startsWith("hi") ||
      currentTitle.toLowerCase().startsWith("hello") ||
      currentTitle.toLowerCase().startsWith("hey");

    if (!shouldGenerateTitle) return;

    console.log(`[Chat] Generating smart title for session ${sessionId}`);

    const titleResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "system",
            content: "Generate a concise, descriptive title (max 40 characters) for this conversation. Focus on the main topic or intent. No quotes, no prefixes like 'Title:', just the title itself."
          },
          {
            role: "user",
            content: `User: ${userMessage.slice(0, 500)}\n\nAssistant: ${assistantResponse.slice(0, 500)}`
          }
        ],
        max_tokens: 30,
      }),
    });

    if (titleResponse.ok) {
      const titleData = await titleResponse.json();
      const newTitle = titleData.choices?.[0]?.message?.content?.trim().slice(0, 50);
      
      if (newTitle && newTitle.length > 3) {
        await serviceSupabase
          .from("chat_sessions_v2")
          .update({ title: newTitle })
          .eq("id", sessionId);
        
        console.log(`[Chat] Updated session title to: ${newTitle}`);
      }
    }
  } catch (error) {
    console.error("[Chat] Error generating smart title:", error);
    // Non-critical error, don't throw
  }
}

const SYSTEM_PROMPT = `You are Elixa, an intelligent AI assistant for the Elixa workspace platform. You help users manage their work, communications, and schedule.

You have access to the following capabilities:

**File Analysis & Creation:**
- Analyze files: analyze_file (images via vision, documents via text extraction)
- Create files: create_file (generate markdown, text, json, csv, code files)

When users share files with you:
- For IMAGES: Use analyze_file to describe what you see, extract text (OCR), or analyze visual content
- For DOCUMENTS (PDF, Word, etc.): Use analyze_file to summarize or extract text content
- For DATA files (CSV, JSON, Excel): Use analyze_file to understand the structure and content

You can also CREATE files for users:
- Generate reports as markdown files
- Create data exports as CSV or JSON
- Write code snippets as .js, .py, .html files
- Draft documents as .txt or .md files

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

**Notion:**
- Search pages and databases: notion_search
- List all databases: notion_list_databases
- Query database entries: notion_query_database
- Get page content: notion_get_page
- Create new pages: notion_create_page
- Update pages: notion_update_page

**Calendly:**
- Get user profile: calendly_get_user
- List event types: calendly_list_event_types
- List scheduled events: calendly_list_scheduled_events
- Get event details: calendly_get_event
- Get event invitees: calendly_get_invitees
- Check availability: calendly_check_availability
- Cancel events: calendly_cancel_event

**Google Ads (Read):**
- List customer accounts: gads_list_customers
- Get campaigns with performance: gads_get_campaigns
- Get ad groups: gads_get_ad_groups
- Get ads: gads_get_ads
- Get keywords with quality score: gads_get_keywords
- Get budget summary: gads_get_budget_summary
- Get account performance: gads_get_account_performance

**Google Ads (Write - REQUIRES CONFIRMATION):**
- Update campaign status: gads_update_campaign_status (ENABLED/PAUSED/REMOVED)
- Update campaign budget: gads_update_campaign_budget
- Update ad group status: gads_update_ad_group_status
- Update ad status: gads_update_ad_status
- Update keyword status: gads_update_keyword_status
- Add new keyword: gads_add_keyword

**Google Analytics:**
- List accounts: ga_list_accounts (start here to discover available accounts)
- List properties: ga_list_properties (get NUMERIC property IDs like 266890436)
- IMPORTANT: Property ID is a numeric ID (e.g., 266890436), NOT the Measurement ID (G-XXXXXX)
- Get website traffic: ga_get_traffic
- Get user behavior: ga_get_user_behavior
- Get conversions: ga_get_conversions
- Get top pages: ga_get_top_pages
- Get traffic sources: ga_get_traffic_sources
- Get realtime users: ga_get_realtime

**Google Sheets:**
- List spreadsheets: sheets_list (search by name)
- Get spreadsheet info: sheets_get (get sheet names and metadata)
- Read data: sheets_read (read data from a range like 'Sheet1!A1:D10')
- Update data: sheets_update (overwrite data in a range - REQUIRES CONFIRMATION)
- Append rows: sheets_append (add rows to end of sheet - REQUIRES CONFIRMATION)
- Clear data: sheets_clear (clear a range - REQUIRES CONFIRMATION)
- Create spreadsheet: sheets_create (create new spreadsheet - REQUIRES CONFIRMATION)

**Image Generation:**
- Generate images from prompts: generate_image (creates AI art based on descriptions)

**Memory & Personalization:**
- Save user preferences: remember_fact (store facts/preferences the user shares)
- Recall memories: recall_memories (retrieve stored information about the user)
- Forget information: forget_memory (remove stored memory by key)

## CRITICAL EMAIL BEHAVIOR

When a user asks you to send an email:
1. **BE PROACTIVE**: If they provide a recipient email address and a topic/purpose, IMMEDIATELY compose a sensible email and invoke gmail_send_email
2. **DO NOT ask "what should the subject/body be?"** - Compose a professional, contextually appropriate email yourself
3. The user will see Approve/Deny buttons in the UI - DO NOT ask for text-based confirmation
4. Only ask for clarification if the recipient email address is MISSING

## FILE HANDLING BEHAVIOR

When a user shares a file:
1. **IMMEDIATELY use analyze_file** to understand the content
2. For images: Describe what you see, extract any visible text
3. For documents: Summarize the content, extract key information
4. For data files: Analyze the structure and provide insights

When a user asks you to create a file:
1. Use create_file with appropriate filename and content
2. The file will be saved and a download link provided to the user

## IMAGE GENERATION

When a user asks you to create, generate, or draw an image:
1. Use generate_image with a detailed, descriptive prompt
2. Include style, mood, colors, and composition details in your prompt
3. The image will be generated and displayed to the user

## MEMORY BEHAVIOR

When a user shares personal information or preferences:
1. Use remember_fact to store important details (name, preferences, timezone, etc.)
2. Categories: "preference" for likes/dislikes, "fact" for personal info, "context" for project-specific

When responding to users:
1. Check recall_memories at the start to personalize your responses
2. Reference relevant stored information naturally

## TOOL CONFIRMATION FLOW

Tools marked with "REQUIRES CONFIRMATION" will show the user Approve/Deny buttons. You should:
1. Invoke the tool with all parameters filled in
2. The system will display the action for user approval
3. DO NOT ask "do you want me to send this?" in text - the UI handles confirmation

Be helpful, concise, and proactive. Take action rather than asking questions when you have enough context.

Current date/time: ${new Date().toISOString()}`;

/**
 * Analyze a file using vision or text extraction
 * Uses the user's selected model for consistency
 */
async function analyzeFile(
  fileUrl: string,
  fileType: string,
  analysisType: string = "describe",
  LOVABLE_API_KEY: string,
  selectedModel: string = DEFAULT_MODEL
): Promise<{ analysis: string; error?: string }> {
  try {
    console.log(`[Chat] Analyzing file: ${fileUrl}, type: ${fileType}, analysis: ${analysisType}`);

    // For images, use vision model
    if (fileType.startsWith("image/")) {
      const prompt = analysisType === "extract_text" 
        ? "Extract all visible text from this image. If there's no text, describe what you see instead."
        : analysisType === "analyze_data"
        ? "Analyze any data, charts, graphs, or tables visible in this image. Provide insights and key findings."
        : "Describe this image in detail. Include any text, objects, people, colors, and overall context.";

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: fileUrl } },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Vision API error: ${response.status}`);
      }

      const data = await response.json();
      return { analysis: data.choices?.[0]?.message?.content || "Could not analyze image" };
    }

    // For text-based files, fetch and analyze content
    if (fileType.startsWith("text/") || fileType === "application/json") {
      try {
        const fileResponse = await fetch(fileUrl);
        const content = await fileResponse.text();
        
        const prompt = analysisType === "summarize"
          ? `Summarize the following content:\n\n${content.slice(0, 50000)}`
          : analysisType === "analyze_data"
          ? `Analyze the data in this file and provide insights:\n\n${content.slice(0, 50000)}`
          : `Here is the content of the file:\n\n${content.slice(0, 50000)}`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [{ role: "user", content: prompt }],
          }),
        });

        if (!response.ok) {
          throw new Error(`AI API error: ${response.status}`);
        }

        const data = await response.json();
        return { analysis: data.choices?.[0]?.message?.content || content.slice(0, 5000) };
      } catch (fetchError) {
        return { analysis: `File URL provided: ${fileUrl}. Unable to fetch content directly.` };
      }
    }

    // For PDFs and other documents, use vision as fallback
    if (fileType === "application/pdf") {
      return { 
        analysis: `This is a PDF document. To analyze its contents, I would need the text extracted. The file is available at: ${fileUrl}` 
      };
    }

    return { analysis: `File type ${fileType} detected. File available at: ${fileUrl}` };
  } catch (error) {
    console.error("[Chat] File analysis error:", error);
    return { 
      analysis: "", 
      error: error instanceof Error ? error.message : "Failed to analyze file" 
    };
  }
}

/**
 * Create a file and return its content for the user
 */
async function createFile(
  filename: string,
  content: string,
  fileType: string,
  userId: string,
  serviceSupabase: any
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  try {
    console.log(`[Chat] Creating file: ${filename}, type: ${fileType}`);

    // Generate a unique path
    const filePath = `${userId}/generated/${Date.now()}-${filename}`;
    
    // Convert content to bytes
    const encoder = new TextEncoder();
    const bytes = encoder.encode(content);
    
    // Upload to storage
    const { data, error } = await serviceSupabase.storage
      .from("chat-attachments")
      .upload(filePath, bytes, {
        contentType: fileType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = serviceSupabase.storage
      .from("chat-attachments")
      .getPublicUrl(data.path);

    return { success: true, fileUrl: publicUrl };
  } catch (error) {
    console.error("[Chat] File creation error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create file" 
    };
  }
}

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
  // File tools - internal
  analyze_file: "internal",
  create_file: "internal",
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
  // Google Sheets tools
  sheets_list: "googleOAuth2Api",
  sheets_get: "googleOAuth2Api",
  sheets_read: "googleOAuth2Api",
  sheets_update: "googleOAuth2Api",
  sheets_append: "googleOAuth2Api",
  sheets_clear: "googleOAuth2Api",
  sheets_create: "googleOAuth2Api",
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
  // New Phase 2-3 tools
  generate_image: "internal",
  remember_fact: "internal",
  recall_memories: "internal",
  forget_memory: "internal",
  suggest_followups: "internal",
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
  serviceSupabase: any,
  selectedModel: string = DEFAULT_MODEL
): Promise<any> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
  
  console.log(`[Chat] Executing tool: ${toolName} with model: ${selectedModel}`, args);

  try {
    switch (toolName) {
      // File tools
      case "analyze_file": {
        const result = await analyzeFile(
          args.fileUrl,
          args.fileType,
          args.analysisType || "describe",
          LOVABLE_API_KEY,
          selectedModel
        );
        return result;
      }

      case "create_file": {
        const result = await createFile(
          args.filename,
          args.content,
          args.fileType || "text/plain",
          userId,
          serviceSupabase
        );
        return result;
      }

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
        const { data, error } = await supabase
          .from("notes")
          .select("id, title, content, created_at, updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(args?.limit || 10);

        if (error) throw error;
        return { notes: data };
      }

      case "notes_search": {
        const { data, error } = await supabase
          .from("notes")
          .select("id, title, content, created_at, updated_at")
          .eq("user_id", userId)
          .or(`title.ilike.%${args.query}%,content.ilike.%${args.query}%`)
          .order("updated_at", { ascending: false })
          .limit(10);

        if (error) throw error;
        return { notes: data };
      }

      case "notes_create": {
        const { data: workspaces } = await supabase
          .from("workspace_members")
          .select("workspace_id")
          .eq("user_id", userId)
          .limit(1);

        const workspaceId = workspaces?.[0]?.workspace_id;
        if (!workspaceId) {
          return { error: "No workspace found. Please create a workspace first." };
        }

        const { data, error } = await supabase
          .from("notes")
          .insert({
            user_id: userId,
            workspace_id: workspaceId,
            title: args.title,
            content: args.content || "",
          })
          .select()
          .single();

        if (error) throw error;
        return { success: true, note: data };
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
          .select("id, title, description, status, priority, due_date, created_at")
          .eq("user_id", userId);

        if (args?.status) {
          query = query.eq("status", args.status);
        }

        const { data, error } = await query
          .order("created_at", { ascending: false })
          .limit(20);

        if (error) throw error;
        return { tasks: data };
      }

      // Knowledge base search
      case "search_knowledge_base":
      case "search_knowledge": {
        const response = await fetch(`${supabaseUrl}/functions/v1/search-knowledge-base`, {
          method: "POST",
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: args.query }),
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

      // Notion tools
      case "notion_search": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notion-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "search", params: args }),
        });
        return await response.json();
      }

      case "notion_list_databases": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notion-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_databases", params: args }),
        });
        return await response.json();
      }

      case "notion_query_database": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notion-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "query_database", params: args }),
        });
        return await response.json();
      }

      case "notion_get_page": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notion-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_page", params: args }),
        });
        return await response.json();
      }

      case "notion_create_page": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notion-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_page", params: args }),
        });
        return await response.json();
      }

      case "notion_update_page": {
        const response = await fetch(`${supabaseUrl}/functions/v1/notion-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_page", params: args }),
        });
        return await response.json();
      }

      // Calendly tools
      case "calendly_get_user": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendly-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_user", params: args }),
        });
        return await response.json();
      }

      case "calendly_list_event_types": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendly-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_event_types", params: args }),
        });
        return await response.json();
      }

      case "calendly_list_scheduled_events": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendly-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_scheduled_events", params: args }),
        });
        return await response.json();
      }

      case "calendly_get_event": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendly-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_event", params: args }),
        });
        return await response.json();
      }

      case "calendly_get_invitees": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendly-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_event_invitees", params: args }),
        });
        return await response.json();
      }

      case "calendly_check_availability": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendly-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check_availability", params: args }),
        });
        return await response.json();
      }

      case "calendly_cancel_event": {
        const response = await fetch(`${supabaseUrl}/functions/v1/calendly-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "cancel_event", params: args }),
        });
        return await response.json();
      }

      // Google Ads tools
      case "gads_list_customers": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_customers", params: args }),
        });
        return await response.json();
      }

      case "gads_get_campaigns": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_campaigns", params: args }),
        });
        return await response.json();
      }

      case "gads_get_ad_groups": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_ad_groups", params: args }),
        });
        return await response.json();
      }

      case "gads_get_ads": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_ads", params: args }),
        });
        return await response.json();
      }

      case "gads_get_keywords": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_keywords", params: args }),
        });
        return await response.json();
      }

      case "gads_get_budget_summary": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_budget_summary", params: args }),
        });
        return await response.json();
      }

      case "gads_get_account_performance": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_account_performance", params: args }),
        });
        return await response.json();
      }

      case "gads_update_campaign_status": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_campaign_status", params: args }),
        });
        return await response.json();
      }

      case "gads_update_campaign_budget": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_campaign_budget", params: args }),
        });
        return await response.json();
      }

      case "gads_update_ad_group_status": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_ad_group_status", params: args }),
        });
        return await response.json();
      }

      case "gads_update_ad_status": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_ad_status", params: args }),
        });
        return await response.json();
      }

      case "gads_update_keyword_status": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_keyword_status", params: args }),
        });
        return await response.json();
      }

      case "gads_add_keyword": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-ads-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "add_keyword", params: args }),
        });
        return await response.json();
      }

      // Google Analytics tools
      case "ga_list_accounts": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_accounts", params: {} }),
        });
        return await response.json();
      }

      case "ga_list_properties": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_properties", params: args }),
        });
        return await response.json();
      }

      case "ga_get_traffic": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_traffic", params: args }),
        });
        return await response.json();
      }

      case "ga_get_user_behavior": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_user_behavior", params: args }),
        });
        return await response.json();
      }

      case "ga_get_conversions": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_conversions", params: args }),
        });
        return await response.json();
      }

      case "ga_get_top_pages": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_top_pages", params: args }),
        });
        return await response.json();
      }

      case "ga_get_exit_pages": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_exit_pages", params: args }),
        });
        return await response.json();
      }

      case "ga_get_traffic_sources": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_traffic_sources", params: args }),
        });
        return await response.json();
      }

      case "ga_get_realtime": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_realtime", params: args }),
        });
        return await response.json();
      }

      case "ga_get_demographics": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_demographics", params: args }),
        });
        return await response.json();
      }

      case "ga_get_devices": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_devices", params: args }),
        });
        return await response.json();
      }

      case "ga_get_ecommerce": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_ecommerce", params: args }),
        });
        return await response.json();
      }

      case "ga_get_landing_pages": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_landing_pages", params: args }),
        });
        return await response.json();
      }

      case "ga_list_conversion_events": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_conversion_events", params: args }),
        });
        return await response.json();
      }

      case "ga_create_conversion_event": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_conversion_event", params: args }),
        });
        return await response.json();
      }

      case "ga_list_custom_dimensions": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_custom_dimensions", params: args }),
        });
        return await response.json();
      }

      case "ga_create_custom_dimension": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_custom_dimension", params: args }),
        });
        return await response.json();
      }

      case "ga_list_custom_metrics": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_custom_metrics", params: args }),
        });
        return await response.json();
      }

      case "ga_create_custom_metric": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_custom_metric", params: args }),
        });
        return await response.json();
      }

      case "ga_list_data_streams": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_data_streams", params: args }),
        });
        return await response.json();
      }

      case "ga_get_data_stream": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_data_stream", params: args }),
        });
        return await response.json();
      }

      case "ga_list_audiences": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_audiences", params: args }),
        });
        return await response.json();
      }

      // Phase 1: High-Priority Reporting Tools
      case "ga_get_page_traffic_sources": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_page_traffic_sources", params: args }),
        });
        return await response.json();
      }

      case "ga_run_custom_report": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "run_custom_report", params: args }),
        });
        return await response.json();
      }

      case "ga_get_events": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_events", params: args }),
        });
        return await response.json();
      }

      case "ga_get_campaigns": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_campaigns", params: args }),
        });
        return await response.json();
      }

      case "ga_compare_periods": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "compare_periods", params: args }),
        });
        return await response.json();
      }

      case "ga_get_user_journey": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_user_journey", params: args }),
        });
        return await response.json();
      }

      case "ga_get_hourly": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_hourly", params: args }),
        });
        return await response.json();
      }

      // Phase 2: Extended Demographics & Behavior
      case "ga_get_age_gender": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_age_gender", params: args }),
        });
        return await response.json();
      }

      case "ga_get_interests": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_interests", params: args }),
        });
        return await response.json();
      }

      case "ga_get_browser_os": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_browser_os", params: args }),
        });
        return await response.json();
      }

      case "ga_get_new_vs_returning": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_new_vs_returning", params: args }),
        });
        return await response.json();
      }

      case "ga_get_content_groups": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_content_groups", params: args }),
        });
        return await response.json();
      }

      case "ga_get_cohort_analysis": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_cohort_analysis", params: args }),
        });
        return await response.json();
      }

      // Phase 3: Advanced Admin API
      case "ga_update_custom_dimension": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_custom_dimension", params: args }),
        });
        return await response.json();
      }

      case "ga_update_custom_metric": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_custom_metric", params: args }),
        });
        return await response.json();
      }

      case "ga_archive_dimension": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "archive_dimension", params: args }),
        });
        return await response.json();
      }

      case "ga_archive_metric": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "archive_metric", params: args }),
        });
        return await response.json();
      }

      case "ga_list_key_events": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_key_events", params: args }),
        });
        return await response.json();
      }

      case "ga_create_key_event": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_key_event", params: args }),
        });
        return await response.json();
      }

      case "ga_list_google_ads_links": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list_google_ads_links", params: args }),
        });
        return await response.json();
      }

      case "ga_create_google_ads_link": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_google_ads_link", params: args }),
        });
        return await response.json();
      }

      case "ga_get_change_history": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_change_history", params: args }),
        });
        return await response.json();
      }

      case "ga_create_audience": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-analytics-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create_audience", params: args }),
        });
        return await response.json();
      }

      // Google Sheets tools
      case "sheets_list": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-sheets-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list", params: args || {} }),
        });
        return await response.json();
      }

      case "sheets_get": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-sheets-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get", params: args }),
        });
        return await response.json();
      }

      case "sheets_read": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-sheets-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "read", params: args }),
        });
        return await response.json();
      }

      case "sheets_update": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-sheets-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", params: args }),
        });
        return await response.json();
      }

      case "sheets_append": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-sheets-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "append", params: args }),
        });
        return await response.json();
      }

      case "sheets_clear": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-sheets-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "clear", params: args }),
        });
        return await response.json();
      }

      case "sheets_create": {
        const response = await fetch(`${supabaseUrl}/functions/v1/google-sheets-integration`, {
          method: "POST",
          headers: { Authorization: authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", params: args }),
        });
        return await response.json();
      }

      // Image Generation
      case "generate_image": {
        try {
          const imagePrompt = args.style 
            ? `${args.style} style: ${args.prompt}`
            : args.prompt;

          console.log(`[Chat] Generating image with prompt: ${imagePrompt}`);

          const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash-image-preview",
              messages: [
                {
                  role: "user",
                  content: imagePrompt,
                },
              ],
              modalities: ["image", "text"],
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("[Chat] Image generation error:", errorText);
            return { error: `Failed to generate image: ${response.status}` };
          }

          const data = await response.json();
          const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (!imageData) {
            return { error: "No image was generated" };
          }

          // Upload to storage for persistence
          const imageBytes = Uint8Array.from(atob(imageData.replace("data:image/png;base64,", "")), c => c.charCodeAt(0));
          const imagePath = `${userId}/generated/${Date.now()}-generated.png`;

          const { data: uploadData, error: uploadError } = await serviceSupabase.storage
            .from("chat-attachments")
            .upload(imagePath, imageBytes, {
              contentType: "image/png",
              upsert: false,
            });

          if (uploadError) {
            console.error("[Chat] Image upload error:", uploadError);
            // Return base64 if upload fails
            return { 
              success: true, 
              imageUrl: imageData,
              prompt: args.prompt,
              isBase64: true
            };
          }

          const { data: { publicUrl } } = serviceSupabase.storage
            .from("chat-attachments")
            .getPublicUrl(uploadData.path);

          return { 
            success: true, 
            imageUrl: publicUrl,
            prompt: args.prompt
          };
        } catch (error) {
          console.error("[Chat] Image generation error:", error);
          return { error: error instanceof Error ? error.message : "Image generation failed" };
        }
      }

      // Memory tools
      case "remember_fact": {
        try {
          const { data, error } = await serviceSupabase
            .from("user_memories")
            .upsert({
              user_id: userId,
              memory_key: args.key,
              memory_value: args.value,
              category: args.category || "preference",
              updated_at: new Date().toISOString(),
            }, {
              onConflict: "user_id,memory_key"
            })
            .select()
            .single();

          if (error) throw error;
          return { 
            success: true, 
            message: `I'll remember that ${args.key}: ${args.value}`,
            memory: data
          };
        } catch (error) {
          console.error("[Chat] Memory save error:", error);
          return { error: "Failed to save memory" };
        }
      }

      case "recall_memories": {
        try {
          const { data, error } = await serviceSupabase
            .from("user_memories")
            .select("memory_key, memory_value, category")
            .eq("user_id", userId)
            .order("updated_at", { ascending: false })
            .limit(20);

          if (error) throw error;

          if (!data || data.length === 0) {
            return { memories: [], message: "No stored memories found." };
          }

          return { 
            memories: data,
            message: `Found ${data.length} stored memories.`
          };
        } catch (error) {
          console.error("[Chat] Memory recall error:", error);
          return { error: "Failed to recall memories" };
        }
      }

      case "forget_memory": {
        try {
          const { error } = await serviceSupabase
            .from("user_memories")
            .delete()
            .eq("user_id", userId)
            .eq("memory_key", args.key);

          if (error) throw error;
          return { 
            success: true, 
            message: `I've forgotten the memory "${args.key}"`
          };
        } catch (error) {
          console.error("[Chat] Memory delete error:", error);
          return { error: "Failed to delete memory" };
        }
      }

      case "suggest_followups": {
        // This is handled internally - just acknowledge
        return { 
          success: true,
          suggestions: [
            "Tell me more about this",
            "What should I do next?",
            "Can you explain further?"
          ]
        };
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

/**
 * Build multimodal message content for files
 */
function buildMessageContent(message: any): any {
  // If message has files, build multimodal content
  if (message.files && Array.isArray(message.files) && message.files.length > 0) {
    const content: any[] = [];
    
    // Add text content first
    if (message.content) {
      content.push({ type: "text", text: message.content });
    }
    
    // Add file references
    for (const file of message.files) {
      if (file.type?.startsWith("image/")) {
        // For images, use vision
        content.push({
          type: "image_url",
          image_url: { url: file.url }
        });
      } else {
        // For other files, add as text context
        content.push({
          type: "text",
          text: `[Attached file: ${file.name} (${file.type}, ${Math.round(file.size / 1024)}KB) - URL: ${file.url}]`
        });
      }
    }
    
    return content.length > 0 ? content : message.content;
  }
  
  return message.content;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId, model } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("Messages array is required");
    }

    // Validate and set model
    const selectedModel = VALID_MODELS.includes(model) ? model : DEFAULT_MODEL;
    const creditCost = MODEL_CREDITS[selectedModel];

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

    // Fetch org tier info for model access and unlimited credits
    let orgTier: { has_premium_models: boolean; is_unlimited: boolean; monthly_credits: number } | null = null;
    let orgSettings: { ai_paused: boolean; auto_approved_tools: string[] } | null = null;
    
    if (orgId) {
      const { data: org } = await serviceSupabase
        .from("orgs")
        .select("has_premium_models, is_unlimited, monthly_credits")
        .eq("id", orgId)
        .single();
      orgTier = org || null;

      // Fetch org settings for AI pause and auto-approval
      const { data: settings } = await serviceSupabase
        .from("org_settings")
        .select("ai_paused, auto_approved_tools")
        .eq("org_id", orgId)
        .single();
      orgSettings = settings || null;
    }

    // Check if AI is paused for this organization
    if (orgSettings?.ai_paused === true) {
      console.log(`[Chat] AI is paused for org ${orgId}`);
      return new Response(
        JSON.stringify({
          error: "AI assistant is temporarily paused by your organization admin. Please try again later or contact your admin.",
          code: "AI_PAUSED",
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user can use the selected model (premium model gating)
    const isPremiumModel = PREMIUM_MODELS.includes(selectedModel);
    if (isPremiumModel && orgTier && !orgTier.has_premium_models && !orgTier.is_unlimited) {
      console.log(`[Chat] User tried to use premium model ${selectedModel} without access`);
      return new Response(
        JSON.stringify({
          error: "This model requires a Pro or Unlimited plan",
          code: "PREMIUM_MODEL_REQUIRED",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (userId && orgId) {
      const rateLimitResult = await checkRateLimits(serviceSupabase, userId, orgId);
      if (!rateLimitResult.allowed) {
        return new Response(
          JSON.stringify({ error: rateLimitResult.reason }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Skip credit check for unlimited users
      if (!orgTier?.is_unlimited) {
        // Check credit balance before proceeding
        const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
        const { data: usage } = await serviceSupabase
          .from("usage_stats")
          .select("credits_purchased, credits_used")
          .eq("org_id", orgId)
          .eq("month", currentMonth)
          .maybeSingle();

        const creditsUsed = usage?.credits_used ?? 0;
        const monthlyCredits = orgTier?.monthly_credits ?? 100;
        const creditsPurchased = usage?.credits_purchased ?? 0;
        const availableCredits = (monthlyCredits + creditsPurchased) - creditsUsed;

        if (availableCredits < creditCost) {
          console.log(`[Chat] Insufficient credits: ${availableCredits} available, ${creditCost} required`);
          return new Response(
            JSON.stringify({
              error: "Insufficient credits",
              required: creditCost,
              available: availableCredits,
            }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
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

    // Build messages with multimodal support for files
    const formattedMessages = [
      { role: "system", content: systemPromptWithMemory },
      ...messages.map((m: any) => ({
        role: m.role,
        content: buildMessageContent(m),
      })),
    ];

    console.log(`[Chat] Calling AI gateway with ${formattedMessages.length} messages, model: ${selectedModel}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
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
      
      // Deduct credits for this AI call (skip for unlimited users)
      if (!orgTier?.is_unlimited) {
        const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
        
        // First get current credits_used, then increment
        const { data: currentUsage } = await serviceSupabase
          .from("usage_stats")
          .select("credits_used")
          .eq("org_id", orgId)
          .eq("month", currentMonth)
          .maybeSingle();
        
        const newCreditsUsed = (currentUsage?.credits_used ?? 0) + creditCost;
        
        await serviceSupabase
          .from("usage_stats")
          .update({ credits_used: newCreditsUsed })
          .eq("org_id", orgId)
          .eq("month", currentMonth);
      }
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

        // Check if this is a write tool
        const isWriteTool = WRITE_TOOLS.includes(toolName);
        
        // Check if this tool is auto-approved by the org
        const autoApprovedTools = orgSettings?.auto_approved_tools || [];
        const isAutoApproved = autoApprovedTools.includes(toolName);
        
        // Write tools that are NOT auto-approved require confirmation
        if (isWriteTool && !isAutoApproved) {
          if (!userId || !sessionId) {
            return new Response(
              JSON.stringify({ error: "User session is required to perform this action." }),
              { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          const scopeCheck = await verifyToolScope(serviceSupabase, userId, toolName);
          if (!scopeCheck.allowed) {
            return new Response(
              JSON.stringify({ error: scopeCheck.error }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          const toolDisplayName = toolName.replace(/_/g, " ");
          const { data: pendingAction, error: pendingActionError } = await serviceSupabase
            .from("pending_actions")
            .insert({
              user_id: userId,
              org_id: orgId,
              session_id: sessionId,
              tool_name: toolName,
              tool_display_name: toolDisplayName,
              parameters: toolArgs,
              status: "pending",
            })
            .select("id")
            .single();

          if (pendingActionError || !pendingAction) {
            console.error("[Chat] Failed to create pending action:", pendingActionError);
            return new Response(
              JSON.stringify({ error: "Failed to create pending action." }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({
              content: assistantMessage.content || "",
              pending_action: {
                id: pendingAction.id,
                name: toolName,
                display_name: toolDisplayName,
                parameters: toolArgs,
                tool_call_id: toolCall.id,
                status: "pending",
              },
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Auto-approved write tools and read tools can execute immediately
        if (isAutoApproved && isWriteTool) {
          console.log(`[Chat] Auto-executing approved write tool: ${toolName}`);
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
          serviceSupabase,
          selectedModel
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
          model: selectedModel,
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

      // Generate smart title in background
      const lastUserMsg = messages.filter((m: any) => m.role === "user").pop();
      if (sessionId && lastUserMsg?.content && finalMessage?.content) {
        generateSmartTitle(serviceSupabase, sessionId, lastUserMsg.content, finalMessage.content, LOVABLE_API_KEY)
          .catch(err => console.error("[Chat] Smart title error:", err));
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

    // Generate smart title for non-tool responses
    const lastUserMsg = messages.filter((m: any) => m.role === "user").pop();
    if (sessionId && lastUserMsg?.content && assistantMessage?.content) {
      generateSmartTitle(serviceSupabase, sessionId, lastUserMsg.content, assistantMessage.content, LOVABLE_API_KEY)
        .catch(err => console.error("[Chat] Smart title error:", err));
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
