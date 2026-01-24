

# Elixa SOW Gap Analysis & Implementation Plan

## Executive Summary

After thoroughly analyzing the Scope of Work document and exploring the codebase, I've identified several gaps between what's specified and what's currently implemented. This plan outlines each missing feature and provides a detailed implementation approach.

---

## Current State Overview

**What's Already Implemented:**
- Chat UI with AI Assistant (streaming, tool calls, pending actions)
- Tasks with Kanban board
- Notes with rich text editor
- Gmail/Calendar/Stripe/Shopify/Notion integrations via OAuth
- Knowledge Base with document upload and RAG search (pgvector)
- Tool Usage Log (Logs page with analytics)
- Connections management page
- Multi-tenant RLS with org_id isolation
- Billing/Team/Settings pages
- Model selection and credit system

---

## Gap Analysis & Implementation Plan

### 1. Email Inbox Page (High Priority)

**SOW Requirement:** "A built-in email view and controls linked to Gmail. Users can connect their Gmail account via OAuth, enabling the AI (and the user through the UI) to fetch recent emails, search the inbox"

**Current State:** Gmail is only accessible via AI chat commands. No dedicated Email page exists.

**Implementation:**

Create `src/pages/Email.tsx` with:
- Sidebar with folder navigation (Inbox, Sent, Drafts, Starred, Trash)
- Email list view with sender, subject, snippet, date
- Email detail panel (slide-out or split view)
- Compose email dialog with recipients, subject, body fields
- Search bar with Gmail query syntax support
- Actions: Reply, Forward, Archive, Delete, Star, Mark Read/Unread

Integration approach:
- Reuse existing `gmail-integration` edge function (already supports list, read, send, search, labels, reply, modifyLabels, trash, markRead)
- Add real-time updates via Supabase channel subscription to tool_execution_log
- Connect via `supabase.functions.invoke('gmail-integration', { body: { action: 'list', params: {...} } })`

```text
+------------------+  +------------------------+  +-------------------+
|  Folder Nav      |  |   Email List           |  |  Email Detail     |
|  - Inbox         |  |  [✓] From: John        |  |  From: John Doe   |
|  - Sent          |  |      Subject: Meeting  |  |  Subject: ...     |
|  - Drafts        |  |      Snippet...        |  |  [Full body]      |
|  - Starred       |  |  [ ] From: Jane        |  |                   |
|  - Trash         |  |      Subject: Invoice  |  |  [Reply] [Fwd]    |
+------------------+  +------------------------+  +-------------------+
```

**Files to create:**
- `src/pages/Email.tsx` - Main email page
- `src/components/email/EmailList.tsx` - Email list component
- `src/components/email/EmailDetail.tsx` - Email detail view
- `src/components/email/EmailCompose.tsx` - Compose dialog
- `src/components/email/EmailFolders.tsx` - Folder navigation
- `src/hooks/useEmail.ts` - Email state management hook

**Route addition:** Add `/email` route to `App.tsx`

---

### 2. Chat Threads Integration (Medium Priority)

**SOW Requirement:** "The chat supports threads, formatting, and mentions."

**Current State:** `ThreadView.tsx` and `ThreadIndicator` components exist but are NOT integrated into Chat.tsx. The database has `parent_message_id` and `thread_count` columns ready.

**Implementation:**

Wire up the existing ThreadView component:

1. **Update Chat.tsx:**
   - Add state: `threadParentMessage`, `threadReplies`, `threadOpen`
   - Add "Start Thread" button to each message's action menu
   - Display `ThreadIndicator` below messages that have replies
   - Handle opening/closing the ThreadView sheet

2. **Update useChat.ts:**
   - Add `loadThreadReplies(parentMessageId)` function
   - Add `sendThreadReply(parentMessageId, content)` function
   - Query messages with `parent_message_id` filter

3. **Update message insertion:**
   - When sending a thread reply, set `parent_message_id` in the insert
   - Increment `thread_count` on parent message

---

### 3. AI Pause Toggle - Backend Enforcement (Medium Priority)

**SOW Requirement:** "We might also allow an admin to 'pause' the AI assistant (stop it from responding) if they suspect misuse"

**Current State:** 
- UI toggle exists in `AIBehaviorSettings.tsx` with `ai_paused` field
- `org_settings` table has `ai_paused` column
- Backend `chat/index.ts` does NOT check this flag

**Implementation:**

Update `supabase/functions/chat/index.ts`:

```typescript
// After getting org membership, check if AI is paused
const { data: orgSettings } = await serviceClient
  .from('org_settings')
  .select('ai_paused')
  .eq('org_id', orgMember.org_id)
  .single();

if (orgSettings?.ai_paused) {
  return new Response(
    JSON.stringify({ 
      error: "AI assistant is temporarily paused by your organization admin. Please try again later or contact your admin.",
      code: "AI_PAUSED"
    }),
    { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
```

Update Chat.tsx to handle this response gracefully with a user-friendly message.

---

### 4. Auto-Approval Whitelist - Backend Enforcement (Medium Priority)

**SOW Requirement:** "If some actions become routine... we might allow users to whitelist certain actions for auto-approval"

**Current State:**
- UI exists in `AIBehaviorSettings.tsx` with `auto_approved_tools` array
- `org_settings` table has `auto_approved_tools` column
- Backend does NOT check this array before requiring confirmation

**Implementation:**

Update `supabase/functions/chat/index.ts`:

```typescript
// In the WRITE_TOOLS check section
const isWriteTool = WRITE_TOOLS.includes(toolName);
const autoApprovedTools = orgSettings?.auto_approved_tools || [];
const isAutoApproved = autoApprovedTools.includes(toolName);

if (isWriteTool && !isAutoApproved) {
  // Create pending action (existing flow)
} else {
  // Execute immediately (skip pending action)
}
```

This allows admins to mark trusted write tools (like `notes_create`) to skip confirmation.

---

### 5. Admin Audit Logs (Medium Priority)

**SOW Requirement:** "Audit Logging and Monitoring... every tool use and action is logged... for investigating any incidents"

**Current State:** 
- `tool_execution_log` captures AI tool calls
- NO logging for admin configuration changes (settings, roles, integrations)

**Implementation:**

1. **Create database table:**
```sql
CREATE TABLE admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES orgs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL, -- 'setting_change', 'role_change', 'integration_connect', etc.
  entity_type text NOT NULL, -- 'org_settings', 'org_members', 'user_credentials'
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);
-- Enable RLS
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Org members can view audit logs" ON admin_audit_log
  FOR SELECT USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
```

2. **Create audit logging utility:**
   - `src/utils/auditLog.ts` with `logAdminAction(action, entity, oldValue, newValue)` function

3. **Add logging calls to:**
   - `AIBehaviorSettings.tsx` - when saving settings
   - `Team.tsx` - when updating roles, removing members
   - `Connections.tsx` - when connecting/disconnecting integrations

4. **Create Admin Audit Log viewer:**
   - Add new tab "Audit Log" to Admin page or Settings
   - Table view with filters (date, action type, user)
   - Export to CSV functionality

---

### 6. Mentions Integration (Low Priority)

**SOW Requirement:** "The chat supports threads, formatting, and mentions."

**Current State:**
- `MentionAutocomplete.tsx` and `useMentionAutocomplete` hook exist
- `chat_messages_v2` has `mentions` column (string array)
- NOT integrated into Chat.tsx input

**Implementation:**

1. **Update Chat.tsx:**
   - Import and use `useMentionAutocomplete` hook
   - Wrap textarea with `MentionPopover`
   - Load team members from org_members
   - Track mentions in state and save to database

2. **Add mention notifications:**
   - When a message is saved with mentions, create notifications for mentioned users
   - Query: Check if user_id in mentions array, create notification

---

### 7. Microsoft Outlook/OneDrive Page (Future - Low Priority)

**SOW Requirement:** Similar email functionality for Microsoft 365 users

**Current State:** `microsoft-integration` edge function exists with full Outlook/OneDrive support, but no dedicated UI.

**Implementation:** Similar to Email page but for Outlook users - can be added later as the Gmail Email page pattern is established.

---

## Implementation Phases

### Phase 1: Core Missing Features (Immediate)
1. **Email Inbox Page** - Most visible gap, high user value
2. **AI Pause Backend Enforcement** - Security requirement
3. **Auto-Approval Backend Enforcement** - Improves UX for power users

### Phase 2: Enhanced Collaboration
4. **Chat Threads Integration** - Wire up existing components
5. **Mentions Integration** - Complete the collaboration features

### Phase 3: Governance & Compliance
6. **Admin Audit Logs** - Important for enterprise customers

---

## Technical Details

### New Files Summary
| File | Purpose |
|------|---------|
| `src/pages/Email.tsx` | Main email inbox page |
| `src/components/email/EmailList.tsx` | Email list with search |
| `src/components/email/EmailDetail.tsx` | Email reading pane |
| `src/components/email/EmailCompose.tsx` | Compose/reply dialog |
| `src/components/email/EmailFolders.tsx` | Folder navigation |
| `src/hooks/useEmail.ts` | Email state management |
| `src/utils/auditLog.ts` | Audit logging utility |

### Database Changes
| Table | Change |
|-------|--------|
| `admin_audit_log` | New table for admin action logging |

### Edge Function Changes
| Function | Change |
|----------|--------|
| `chat/index.ts` | Add `ai_paused` check and `auto_approved_tools` bypass |

### Route Changes
| Route | Component |
|-------|-----------|
| `/email` | `Email.tsx` |

---

## Questions for Clarification

Before proceeding, I'd like to confirm:

1. **Email Page Priority:** Should the Email page support multiple Gmail accounts (users who connected multiple Google accounts) or just the primary one?

2. **Audit Log Retention:** How long should admin audit logs be retained? 90 days? 1 year? Forever?

3. **Phase Order:** Would you like me to start with Phase 1 (Email, AI Pause, Auto-Approval) or is there a specific feature you'd like prioritized?

