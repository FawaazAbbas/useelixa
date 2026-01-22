

# Plan: Add Notion Integration to AI Chat

## Problem Summary

Notion OAuth connection works correctly, but the AI assistant (Elixa) cannot use Notion because:

1. No Notion tools are defined in the chat function's `TOOL_DEFINITIONS`
2. No `executeTool` cases exist to handle Notion operations  
3. No `notion-integration` edge function exists to call the Notion API

## Solution Overview

Create a complete Notion integration that mirrors how Gmail, Stripe, and Shopify integrations work:

```text
┌─────────────────────────────────────────────────────────────────┐
│                     Current State                               │
├─────────────────────────────────────────────────────────────────┤
│  User connects Notion → OAuth succeeds → Credentials saved      │
│                          ↓                                      │
│  User asks AI about Notion → AI has NO Notion tools → Can't help│
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     After Fix                                   │
├─────────────────────────────────────────────────────────────────┤
│  User connects Notion → OAuth succeeds → Credentials saved      │
│                          ↓                                      │
│  User asks AI about Notion → AI sees Notion tools → Calls       │
│  notion-integration edge function → Returns Notion data         │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation Steps

### Step 1: Create `notion-integration` Edge Function

Create `supabase/functions/notion-integration/index.ts`:

**Actions to support:**
- `search` - Search pages and databases
- `list_databases` - List all databases the integration has access to
- `query_database` - Query a specific database
- `get_page` - Get page content
- `create_page` - Create a new page (write action)
- `update_page` - Update an existing page (write action)

**Key implementation details:**
- Retrieve user's Notion credentials from `user_credentials` table using `notionApi` credential type
- Use decryption utilities from `_shared/credentials.ts`
- Call Notion API with proper headers including `Notion-Version: 2022-06-28`
- Handle token refresh if expired

### Step 2: Add Notion Tools to Chat Function

Update `supabase/functions/chat/index.ts`:

**Add to `TOOL_DEFINITIONS` array:**
```javascript
{ type: "function", function: { 
  name: "notion_search", 
  description: "Search Notion pages and databases by query",
  parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] }
}},
{ type: "function", function: { 
  name: "notion_list_databases", 
  description: "List all Notion databases the user has access to",
  parameters: { type: "object", properties: {} }
}},
{ type: "function", function: { 
  name: "notion_query_database", 
  description: "Query a Notion database to retrieve entries",
  parameters: { type: "object", properties: { 
    database_id: { type: "string" },
    filter: { type: "object" }
  }, required: ["database_id"] }
}},
{ type: "function", function: { 
  name: "notion_get_page", 
  description: "Get the content of a specific Notion page",
  parameters: { type: "object", properties: { page_id: { type: "string" } }, required: ["page_id"] }
}},
{ type: "function", function: { 
  name: "notion_create_page", 
  description: "Create a new Notion page. REQUIRES CONFIRMATION.",
  parameters: { type: "object", properties: { 
    parent_id: { type: "string" },
    title: { type: "string" },
    content: { type: "string" }
  }, required: ["parent_id", "title"] }
}},
{ type: "function", function: { 
  name: "notion_update_page", 
  description: "Update a Notion page. REQUIRES CONFIRMATION.",
  parameters: { type: "object", properties: { 
    page_id: { type: "string" },
    properties: { type: "object" }
  }, required: ["page_id"] }
}}
```

**Add to `WRITE_TOOLS` array:**
```javascript
"notion_create_page",
"notion_update_page"
```

**Add to `SYSTEM_PROMPT`:**
```
**Notion:**
- Search pages and databases: notion_search
- List databases: notion_list_databases
- Query database: notion_query_database
- Get page content: notion_get_page
- Create pages: notion_create_page
- Update pages: notion_update_page
```

**Add `executeTool` cases** for each Notion tool that call the new edge function.

### Step 3: Add Tool Scope Requirements (Optional Enhancement)

Add entries to `tool_scope_requirements` table for Notion tools to ensure proper permission verification.

## Technical Details

### Notion API Headers Required
```javascript
headers: {
  "Authorization": `Bearer ${accessToken}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json"
}
```

### Notion API Endpoints
- Search: `POST https://api.notion.com/v1/search`
- List databases: `POST https://api.notion.com/v1/search` (filter by type)
- Query database: `POST https://api.notion.com/v1/databases/{id}/query`
- Get page: `GET https://api.notion.com/v1/pages/{id}`
- Create page: `POST https://api.notion.com/v1/pages`
- Update page: `PATCH https://api.notion.com/v1/pages/{id}`

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/functions/notion-integration/index.ts` | Create new |
| `supabase/functions/chat/index.ts` | Modify - add tools, handlers, system prompt |

## Expected Outcome

After implementation:
1. AI will see Notion in its available tools list
2. Users can ask "Search my Notion for project notes" and AI will execute `notion_search`
3. Users can ask "Create a page in Notion about X" and get the HITL confirmation flow
4. Connected Services Indicator will show Notion as functional (not just connected)

