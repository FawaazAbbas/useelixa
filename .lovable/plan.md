

# Complete Developer Dashboard Build-Out

## Overview

Transform the current minimal developer portal into a fully-featured dashboard with a proper sidebar navigation layout, rich overview analytics, detailed agent management, API documentation, execution logs, and a polished profile section.

---

## Layout Overhaul

Replace the current tabs-based layout with a **sidebar + content area** structure using the existing Sidebar component, matching the rest of the app's design system.

### Sidebar Navigation Items
- **Overview** -- Stats, recent activity, quick actions
- **My Agents** -- Agent list with filtering, search, and detail views
- **Submit Agent** -- The existing multi-step wizard
- **Logs** -- Execution logs for the developer's agents
- **API Docs** -- Reference documentation for building agents
- **Settings** -- Profile, API keys, notification preferences

---

## 1. Overview Tab (Enhanced)

Currently just 4 stat cards. Will be expanded to include:

- **Stats Row** -- Total Agents, Approved, Pending, Downloads (existing, polished)
- **Recent Activity Feed** -- Timeline of recent events (agent submitted, approved, rejected, new downloads) pulled from `agent_submissions` timestamps
- **Quick Actions Card** -- Buttons to "Create New Agent", "View Documentation", "Edit Profile"
- **Agent Status Breakdown** -- A small visual breakdown (colored bars or mini chart) showing draft vs pending vs approved vs rejected counts

---

## 2. My Agents Tab (Enhanced)

Currently a flat list of cards. Enhancements:

- **Search bar** to filter agents by name
- **Grid/List view toggle**
- **Agent Detail Drawer/Dialog** -- Click an agent card to open a side sheet with full details:
  - All metadata (name, description, category, version, hosting type, runtime)
  - Hosting config (endpoint URL or code file info)
  - System prompt and allowed tools
  - Review notes (if rejected)
  - Execution status and errors
  - Download count
  - Timeline (created, submitted, reviewed dates)
  - Edit button (for draft/rejected agents)
  - Inline version history placeholder
- **Bulk actions** -- Select multiple agents for deletion

---

## 3. Execution Logs Tab (New)

A new section showing execution history for the developer's agents:

- **Database**: New `agent_execution_logs` table with columns:
  - `id` (uuid, PK)
  - `agent_id` (uuid, FK to agent_submissions)
  - `developer_id` (uuid, FK to developer_profiles)
  - `user_id` (uuid, the user who invoked the agent)
  - `input_message` (text)
  - `output_response` (text)
  - `status` (text: "success", "error", "timeout")
  - `error_message` (text, nullable)
  - `execution_time_ms` (integer)
  - `created_at` (timestamptz)

- **UI Components**:
  - Filterable table with columns: Agent Name, Status, Duration, Timestamp
  - Click a row to see full input/output
  - Filter by agent, status, date range
  - Simple stats at top: Total Executions, Success Rate, Avg Duration

- **RLS**: Developer can only see logs for their own agents

---

## 4. API Documentation Tab (New)

Static reference page built as a React component (no external docs site needed):

- **Getting Started** section explaining the two hosting models
- **Platform-Hosted** section:
  - Function signature (`def handle(input: dict) -> dict`)
  - Input/output JSON schema
  - Available tools list
  - Requirements format
  - Code examples (Python)
- **Self-Hosted** section:
  - API contract (POST request/response format)
  - Authentication setup
  - Health check endpoint recommendation
  - Code examples (Flask, FastAPI)
- **Testing** section:
  - How to test locally before submitting
  - Expected response format

---

## 5. Settings Tab (Enhanced Profile)

Expand the current basic profile form:

- **Profile Section** (existing: company name, website, bio)
- **API Keys Section** -- Display the developer's ID and any generated API keys for testing
- **Notification Preferences** -- Toggle email notifications for: agent approved, agent rejected, new downloads milestone
- **Danger Zone** -- Delete developer account option

---

## Technical Details

### New Files
- `src/components/developer/DeveloperSidebar.tsx` -- Sidebar navigation for the portal
- `src/components/developer/DeveloperOverview.tsx` -- Enhanced overview with activity feed and quick actions
- `src/components/developer/AgentDetailSheet.tsx` -- Side sheet for viewing/editing agent details
- `src/components/developer/ExecutionLogs.tsx` -- Logs table and filters
- `src/components/developer/ApiDocsPage.tsx` -- Static API documentation page
- `src/components/developer/DeveloperSettings.tsx` -- Enhanced settings page

### Modified Files
- `src/pages/DeveloperPortal.tsx` -- Replace tabs with sidebar layout, route between sections
- `src/components/developer/AgentList.tsx` -- Add search, grid/list toggle, click-to-detail
- `src/components/developer/DeveloperStats.tsx` -- Enhanced with activity feed

### Database Migration
- Create `agent_execution_logs` table with RLS policies scoped to developer_id
- Add logging calls in the orchestrator edge function to write execution results

### Edge Function Updates
- `supabase/functions/ai-employee-orchestrator/index.ts` -- Log execution results to `agent_execution_logs` after each invocation

---

## Component Architecture

```text
DeveloperPortal (page)
  +-- DeveloperSidebar
  |     +-- Overview
  |     +-- My Agents
  |     +-- Submit Agent
  |     +-- Logs
  |     +-- API Docs
  |     +-- Settings
  +-- Content Area (switches based on active section)
        +-- DeveloperOverview
        |     +-- DeveloperStats (enhanced)
        |     +-- RecentActivityFeed
        |     +-- QuickActions
        +-- AgentList (enhanced)
        |     +-- AgentDetailSheet
        +-- AgentSubmissionForm (existing)
        +-- ExecutionLogs
        +-- ApiDocsPage
        +-- DeveloperSettings
```

---

## Summary of Scope

| Section | Status | Work |
|---------|--------|------|
| Sidebar layout | New | Replace tabs with sidebar navigation |
| Overview | Enhanced | Activity feed, quick actions, visual breakdown |
| My Agents | Enhanced | Search, detail drawer, grid/list toggle |
| Submit Agent | Existing | No changes needed |
| Execution Logs | New | New table, new component, orchestrator logging |
| API Docs | New | Static documentation component |
| Settings | Enhanced | API keys display, notification prefs, danger zone |

