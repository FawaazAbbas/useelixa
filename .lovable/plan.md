
## Chatspace UI for AI Employees

### Overview
Replace the current card-grid `/ai-employees` page with a 3-pane chatspace layout where workspace users can see their deployed agents, chat with them via persistent threads, and manage agent settings. This is a substantial rewrite of the page and several supporting components, plus a new database table and orchestrator updates.

### Architecture

```text
+------------------+------------------------+---------------------+
| MainNavSidebar   | Left Pane              | Center Pane          | Right Pane         |
| (existing 72px)  | (280px, agent list)    | (flex-1, chat)       | (320px, settings)  |
|                  |                        |                      |                    |
|                  | Search...              | [Agent Name header]  | Name + desc        |
|                  |                        |                      |                    |
|                  | -- Deployed Agents --  | message bubbles      | Capabilities       |
|                  | Agent A  (green dot)   | ...                  | Connected tools    |
|                  | Agent B  (gray dot)    | proposal cards       | Guardrails         |
|                  |                        |                      |                    |
|                  | [Browse Agents] CTA    | [composer input]     | [Uninstall]        |
|                  |                        |                      | [Test Health]      |
+------------------+------------------------+---------------------+
```

### Database Changes

#### 1. New table: `agent_messages`
Unified message store for agent chat threads, keyed by `installation_id`.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| workspace_id | uuid NOT NULL | |
| installation_id | uuid NOT NULL | FK to agent_installations |
| role | text NOT NULL | "user", "assistant", "system" |
| content | text NOT NULL | |
| request_id | uuid nullable | ties to orchestrator requestId |
| metadata | jsonb | tools_used, proposals, etc. |
| created_at | timestamptz | now() |

RLS: Users can read/write messages where `installation_id` belongs to an installation they own (join through `agent_installations.user_id = auth.uid()`).

#### 2. Add column to `agent_installations`
- `deployed_at` (timestamptz, nullable, default null)

When null, agent is installed but not deployed. "Deploy" sets it to `now()`. Only deployed agents appear in the left pane.

#### 3. Enable realtime on `agent_messages`
So new messages appear live if needed (optional for MVP, can skip).

### Frontend Changes

#### File: `src/pages/AIEmployees.tsx` -- Full rewrite
Replace current card/tabs layout with 3-pane chatspace:

- **State**: `selectedInstallationId`, `installations` (deployed agents), `agentDetails` (joined submission data), `messages`, `input`, `isLoading`, `showBrowse`, `showSettings`
- **Data fetch**: Query `agent_installations` WHERE `user_id = auth.uid()` AND `deployed_at IS NOT NULL`, join to `agent_submissions` for name/icon/category/capability_manifest
- **Left pane**: List of deployed installations with search, status dot (based on `execution_status` from joined submission), "Browse Agents" button opens a Dialog with the existing `AgentMarketplace` component
- **Center pane**: Chat thread for selected installation. Load messages from `agent_messages` WHERE `installation_id = selected`. Composer at bottom. On send:
  1. Insert user message into `agent_messages`
  2. Call orchestrator with `{ actorType: "installed_agent", actorId: installationId, message, userId }`
  3. Insert assistant response into `agent_messages`
  4. If response contains proposals, render ProposalCard inline
- **Right pane**: Collapsible settings panel showing agent name, description, `capability_manifest`, permissions, `requires_approval` toggle (read-only for MVP), Uninstall button, Test Health button

#### File: `src/components/ai-employees/AgentMarketplace.tsx` -- Minor update
- Add `onInstallAndDeploy` callback (install + set `deployed_at = now()` in one step for auto-deploy)
- Or keep as-is and auto-deploy in the install handler

#### File: `src/components/ai-employees/EmployeeChat.tsx` -- Remove/deprecate
No longer needed; chat is inline in the chatspace center pane.

#### File: `src/components/ai-employees/ProposalCard.tsx` -- New
Renders a proposal inline in chat:
- Title, summary from `agent_proposals.data`
- Approve / Reject buttons
- On approve: update `agent_proposals.status = "approved"`, `resolved_at = now()`, `resolved_by = user.id`
- On reject: update status to "rejected"
- Visual: card with amber/warning styling for pending, green for approved, red for rejected

#### File: `src/components/ai-employees/AgentSettingsPanel.tsx` -- New
Right pane component showing:
- Agent avatar, name, description
- Capability manifest (list of capabilities from `agent_submissions.capability_manifest`)
- Connected tools from `installation.permissions`
- Guardrails: `requires_approval` (read-only badge), `risk_tier`
- Actions: Uninstall button, Test Health button (calls `endpoint-health` function)

#### File: `src/components/ai-employees/ChatspaceSidebar.tsx` -- New
Left pane component:
- Search input
- List of deployed installations (avatar, name, category, status dot, unread count placeholder)
- "Browse Agents" CTA button
- Click selects installation and loads its thread

### Backend Changes

#### Edge function: `ai-employee-orchestrator/index.ts` -- Update
Add new routing path for `actorType === "installed_agent"`:

```
const { actorType, actorId, employeeId, message, userId } = await req.json();

if (actorType === "installed_agent") {
  // Load installation by actorId
  const { data: installation } = await supabase
    .from("agent_installations")
    .select("*, agent_submissions(*)")
    .eq("id", actorId)
    .single();
  
  if (!installation) throw new Error("Installation not found");
  
  const submission = installation.agent_submissions;
  // Route to endpoint-invoke with installationId
  const { data, error } = await supabase.functions.invoke("endpoint-invoke", {
    body: {
      agentId: submission.id,
      installationId: actorId,
      message,
      userId,
      workspaceId: installation.workspace_id,
    },
  });
  
  // Return response including actions/proposals
  responseData = {
    response: data?.response,
    actions: data?.actions || [],
    receipts: data?.receipts || [],
    requestId: data?.requestId,
  };
} else {
  // Existing legacy flow using employeeId
  ...
}
```

This keeps backward compatibility while adding the deterministic installation-based routing.

### Install + Deploy Flow
For MVP, auto-deploy on install:
- `installAgent()` inserts into `agent_installations` with `deployed_at = now()`
- Agent immediately appears in left pane
- Uninstall deletes the installation row

### Implementation Order

1. **Migration**: Create `agent_messages` table + add `deployed_at` to `agent_installations` + RLS policies
2. **Orchestrator update**: Add `actorType === "installed_agent"` branch
3. **New components**: `ChatspaceSidebar`, `AgentSettingsPanel`, `ProposalCard`
4. **Rewrite `AIEmployees.tsx`**: 3-pane layout with all wiring
5. **Update `AgentMarketplace`**: Works inside a Dialog, auto-deploys on install
6. **Update nav**: Move "AI Employees" from `comingSoonItems` to active `navItems` in `MainNavSidebar.tsx`

### Files Summary

| File | Action |
|------|--------|
| Migration SQL | New: `agent_messages` table, `deployed_at` column, RLS |
| `supabase/functions/ai-employee-orchestrator/index.ts` | Update: add `actorType` routing |
| `src/pages/AIEmployees.tsx` | Major rewrite: 3-pane chatspace |
| `src/components/ai-employees/ChatspaceSidebar.tsx` | New: left pane agent list |
| `src/components/ai-employees/AgentSettingsPanel.tsx` | New: right pane settings |
| `src/components/ai-employees/ProposalCard.tsx` | New: inline proposal card |
| `src/components/ai-employees/AgentMarketplace.tsx` | Minor: auto-deploy on install |
| `src/components/ai-employees/EmployeeChat.tsx` | Deprecate (no longer used) |
| `src/components/MainNavSidebar.tsx` | Update: move AI Employees to active nav |
