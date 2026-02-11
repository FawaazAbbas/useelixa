

## Build Agent Installation Flow

### What This Does
Adds an "Agent Marketplace" tab to the AI Employees page where workspace users can browse approved endpoint agents and install them into their workspace with one click. Installed agents appear in the main "My Agents" view and can be chatted with. Users can also uninstall agents they no longer need.

### User Experience

1. The AI Employees page gets two tabs: **My Agents** (current view) and **Browse Agents** (new marketplace)
2. **Browse Agents** shows all approved public endpoint agents from `agent_submissions`
3. Each agent card shows an "Install" button (or "Installed" if already added)
4. Installing writes a record to `agent_installations` linking the agent to the user's workspace
5. **My Agents** tab updates to show installed endpoint agents alongside native employees
6. Users can uninstall agents via the dropdown menu, which deletes the `agent_installations` record

### Technical Changes

#### 1. Update `src/pages/AIEmployees.tsx`
- Add Tabs UI ("My Agents" / "Browse Agents") using the existing Tabs component
- **My Agents tab**: Show native employees + installed endpoint agents (filter endpoint agents by checking `agent_installations` for the user's workspace)
- **Browse Agents tab**: Show all approved public endpoint agents with Install/Installed state
- Add `installAgent` function: inserts into `agent_installations` with `agent_id`, `workspace_id`, `user_id`
- Add `uninstallAgent` function: deletes from `agent_installations`
- Use `useWorkspace` hook to get the current `workspace_id`
- Fetch `agent_installations` for the current user to determine installed state

#### 2. New Component: `src/components/ai-employees/AgentMarketplace.tsx`
- Receives the list of all approved endpoint agents and the user's installed agent IDs
- Renders a grid of agent cards with:
  - Agent name, description, developer name, category badge
  - "Install" button (primary) or "Installed" badge (with uninstall option)
- Handles install/uninstall callbacks from parent

#### 3. Data Flow
- On page load, fetch three things in parallel:
  1. `ai_employees` (native, user's org)
  2. `agent_submissions` (all approved + public)
  3. `agent_installations` (user's installations, to know which are already installed)
- **My Agents** = native employees + endpoint agents WHERE agent_id is in user's installations
- **Browse Agents** = all approved endpoint agents, with installed status derived from installations list

#### 4. No Database Migrations Needed
- `agent_installations` table already exists with columns: `id`, `agent_id`, `workspace_id`, `user_id`, `requires_approval`, `permissions`, `risk_tier`, `is_active`, `created_at`
- RLS policies already allow users to CRUD their own installations

#### 5. No Edge Function Changes
- The `ai-employee-orchestrator` already looks up agents in `agent_submissions` by ID, so installed endpoint agents will work for chat automatically

### Files Summary
| File | Action |
|------|--------|
| `src/pages/AIEmployees.tsx` | Major update: add tabs, installation logic, workspace integration |
| `src/components/ai-employees/AgentMarketplace.tsx` | New: marketplace browse grid with install/uninstall |

