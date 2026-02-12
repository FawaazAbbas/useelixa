

# Developer Portal - Full Build Plan

## Current State

The developer portal already has:
- Auth page (sign in / sign up with developer role assignment)
- Sidebar navigation (Overview, My Agents, Submit Agent, Logs, API Docs, Settings)
- Agent submission wizard (3-step: metadata, endpoint config, avatar/review)
- Agent list with search, filter, grid/list views
- Agent detail sheet with endpoint editing, health check, test console
- Execution logs with filters and detail dialog
- API docs page (currently showing legacy platform-hosted + self-hosted docs)
- Developer settings (profile, API keys, notification prefs, danger zone)
- Developer overview dashboard (stats, activity feed, quick actions)

## What Needs to Be Built / Fixed

### 1. Full Agent Editing (currently missing)

Right now, agents can only be viewed in the detail sheet. Developers cannot edit agent metadata (name, description, category, version), endpoint configuration (paths, auth, manifest), or avatar color after creation.

**Plan:**
- Add an "Edit Agent" section/page that reuses the same form fields from `AgentSubmissionForm` but pre-populated with the existing agent data
- Add a new sidebar section or make the detail sheet fully editable
- Best approach: Convert the `AgentDetailSheet` into a proper editable form with inline save, organized into collapsible sections:
  - **Basic Info**: name, description, category, version (editable inputs)
  - **Endpoint Config**: base URL (already editable), invoke/health paths, auth type, secret, capability manifest
  - **Avatar/Branding**: color picker to change the agent brand color
- Each section gets a "Save" button that calls `onUpdate`

### 2. Agent Deletion with Confirmation Dialog

Currently delete is a plain button click with no confirmation. Add a proper `AlertDialog` confirmation before deleting, warning about permanent data loss.

### 3. Update API Docs to Match Endpoint-First Model

The API docs page still shows legacy "Platform-Hosted" and "Self-Hosted" Python examples. Since the platform is now endpoint-first, update docs to:
- Lead with the Endpoint Agent contract (`/invoke`, `/health`)
- Show the HMAC and API Key auth patterns
- Include the Tool Gateway documentation
- Remove or collapse legacy Python/Flask/FastAPI sections

### 4. Agent Version Management

Allow developers to update the version string when editing and display version history context in the detail view.

### 5. Improved Agent List Actions

- Add an "Edit" button directly in the agent card (not just via the detail sheet)
- Allow deletion from the list for any status (not just draft/rejected) -- with confirmation
- Add a "Duplicate" action to clone an agent as a new draft

### 6. Mobile Responsiveness

Ensure the sidebar collapses properly on mobile and the developer portal is usable on smaller screens via a bottom nav or drawer.

---

## Technical Implementation

### Files to Create
- None (all changes are to existing files)

### Files to Edit

**`src/components/developer/AgentDetailSheet.tsx`**
- Convert read-only detail rows into editable form fields organized in collapsible sections
- Add state management for all editable fields (name, description, category, version, invoke path, health path, auth type, secret, avatar color, manifest tools/canMutate/riskTier)
- Add "Save Changes" button per section that calls `onUpdate(agent.id, updatedFields)`
- Add `AlertDialog` for delete confirmation
- Show a "Duplicate" button that pre-fills the submission form

**`src/components/developer/AgentList.tsx`**
- Remove status restriction on delete (allow for all statuses, with confirmation)
- Add "Edit" quick action button on cards that opens the detail sheet
- Add "Duplicate" action

**`src/components/developer/ApiDocsPage.tsx`**
- Rewrite to document the Endpoint-First model
- Lead with `/invoke` POST contract and `/health` GET contract
- Document HMAC-SHA256 and API Key authentication patterns
- Document the Tool Gateway session token flow
- Add the capability manifest schema documentation
- Collapse or remove legacy platform-hosted/self-hosted sections

**`src/hooks/useDeveloperPortal.ts`**
- Add a `duplicateAgent` function that creates a copy with "draft" status and a new slug
- Ensure `updateAgent` handles all the new editable fields including nested `capability_manifest`

**`src/pages/DeveloperPortal.tsx`**
- Wire duplicate functionality: when triggered, navigate to submit section with pre-filled data
- Add mobile sidebar toggle (hamburger menu in header)

**`src/components/developer/DeveloperSidebar.tsx`**
- Add mobile drawer variant using a sheet that slides in from the left on small screens
- Show hamburger button in the header on mobile

### Agent Detail Sheet - Editable Sections Breakdown

```text
+----------------------------------+
| [Agent Icon] Agent Name          |
| Status Badge | Endpoint Badge    |
+----------------------------------+
| > Basic Info (collapsible)       |
|   Name: [__________]            |
|   Description: [___________]    |
|   Category: [dropdown]          |
|   Version: [__________]         |
|   [Save]                        |
+----------------------------------+
| > Endpoint Config (collapsible)  |
|   Base URL: [__________] [Edit] |
|   Invoke Path: [__________]     |
|   Health Path: [__________]     |
|   Auth Type: [None|Key|HMAC]    |
|   Secret: [__________]          |
|   [Save]                        |
+----------------------------------+
| > Capability Manifest            |
|   Tools: [badge toggles]        |
|   Can Mutate: [switch]          |
|   Risk Tier: [dropdown]         |
|   [Save]                        |
+----------------------------------+
| > Branding                       |
|   Color: [swatches] [preview]   |
|   [Save]                        |
+----------------------------------+
| > Health Check                   |
|   [Check Health] status display |
+----------------------------------+
| > Test Console                   |
|   [existing test console]       |
+----------------------------------+
| > Timeline                       |
|   Created / Submitted / Updated |
+----------------------------------+
| [Duplicate] [Delete]            |
+----------------------------------+
```

### Delete Confirmation Dialog

Uses `AlertDialog` from shadcn/ui:
- Title: "Delete Agent"
- Description: "This will permanently delete '{agent.name}' and all associated execution logs. This action cannot be undone."
- Cancel + Delete buttons

### API Docs Restructure

Sections:
1. **Getting Started** -- Endpoint-First overview
2. **Invoke Contract** -- POST /invoke request/response schema
3. **Health Endpoint** -- GET /health contract
4. **Authentication** -- None / API Key / HMAC-SHA256 with code examples
5. **Tool Gateway** -- How agents access managed OAuth integrations via session tokens
6. **Capability Manifest** -- Schema documentation for toolsRequired, canMutate, riskTier
7. **Testing** -- curl examples for invoke and health endpoints

### Mobile Sidebar

- On screens < 768px, hide the fixed sidebar
- Show a hamburger icon in the header
- Open sidebar as a Sheet (slide from left) on tap
- Auto-close on section selection

