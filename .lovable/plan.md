
## Unify AI Employees and Endpoint Agents into Single View

### Problem Statement
Currently, AI Employees (from `ai_employees`) and Endpoint Agents (from `agent_submissions`) are managed in separate systems:
- **AI Employees**: Created via the `/ai-employees` page, stored in `ai_employees` table, shown in the grid
- **Endpoint Agents**: Created via `/developer` portal, stored in `agent_submissions` table, NOT visible to workspace users
- The `ai-employee-orchestrator` can route to both, but users only see one type

This creates a fragmented UX where workspace users cannot discover or use the agents that developers have submitted.

### Solution Overview
Make `agent_submissions` the **single source of truth** for all agents. Both native workspace agents and developer-submitted endpoint agents will coexist in a unified interface.

### Technical Approach

#### 1. **Data Model Unification**
- Keep both tables (backward compatibility)
- Endpoint agents are records in `agent_submissions` with `status: "approved"` and `is_public: true`
- Native agents can either:
  - Continue using `ai_employees` table (requires dual-query approach), OR
  - **Migrate** to `agent_submissions` with a `type: "native"` or `created_from: "workspace"` marker
  
**Recommendation**: Keep dual-table approach initially for safety. Workspace users can create agents and those get stored in `ai_employees`. We fetch both tables and merge results.

#### 2. **Database Changes (None Required)**
- No new columns needed
- Existing RLS policies remain intact
- The `ai_employees` table has `org_id`, while `agent_submissions` tracks developers
- The orchestrator already routes to both tables

#### 3. **UI/UX Changes**

**`src/pages/AIEmployees.tsx` - Updated to:**
- Fetch from BOTH `ai_employees` AND `agent_submissions` (approved ones)
- Merge results into a single unified list
- Add a badge/indicator to distinguish:
  - "Native" or "Local" for `ai_employees`
  - "Endpoint Agent" or "Community" for `agent_submissions`
- Show developer name for endpoint agents (optional, fetched from `developer_profiles`)
- Keep all existing actions: Chat, Edit (for native only), Delete (for native only), Activate/Deactivate

**Changes:**
1. **Fetch Function**:
   ```
   fetchEmployees():
   - Query ai_employees (user's org)
   - Query agent_submissions (approved + public)
   - Merge with a `source: "native" | "endpoint"` field for UI distinction
   ```

2. **AIEmployee Interface Update**:
   - Add optional `source: "native" | "endpoint"`
   - Add optional `developer_id` for endpoint agents
   - Existing fields work for both types

3. **Card Rendering**:
   - Show source badge ("Native" vs "Endpoint Agent")
   - Disable Edit/Delete buttons for endpoint agents (read-only)
   - All agents can Chat
   - Show developer info for endpoint agents (optional)

4. **EmployeeChat Compatibility**:
   - Already works with both (orchestrator handles it)
   - No changes needed

**`src/components/ai-employees/CreateEmployeeDialog.tsx` - No Changes**:
- Still creates native `ai_employees` only
- Endpoint agents are created via `/developer` portal
- This dialog remains for workspace users to create their own agents

**`src/components/ai-employees/EmployeeChat.tsx` - No Changes**:
- Already passes `employeeId` to orchestrator
- Orchestrator automatically routes to correct table

#### 4. **Workflow**

**For Workspace Users:**
1. Go to `/ai-employees`
2. See all available agents:
   - Their own created agents (native, with Edit/Delete)
   - Approved endpoint agents from developers (read-only, with Chat only)
3. Can chat with any agent
4. Can create new native agents via "Create Employee" button

**For Developers:**
1. Go to `/developer`
2. Submit endpoint agents as before
3. Agents auto-approve and become `is_public: true`
4. Workspace users see them on `/ai-employees` as "Endpoint Agent" type

#### 5. **Implementation Steps**

**Step 1**: Update `AIEmployee` interface in `AIEmployees.tsx`
- Add `source?: "native" | "endpoint"` field
- Add optional `developer_id` and `developer_name`

**Step 2**: Update `fetchEmployees()` in `AIEmployees.tsx`
- First query: `ai_employees` where `org_id` matches user's org
- Second query: `agent_submissions` where `status = "approved"` AND `is_public = true`
- Merge results, tag each with `source`
- For endpoint agents, optionally fetch developer name from `developer_profiles`

**Step 3**: Update card rendering logic
- Show `source` badge (styling: "Native" = secondary, "Endpoint Agent" = accent)
- Conditionally disable Edit/Delete buttons if `source === "endpoint"`
- Show developer info if available

**Step 4**: No changes needed to:
- `EmployeeChat.tsx` (orchestrator handles routing)
- `CreateEmployeeDialog.tsx` (only for native)
- `ai-employee-orchestrator` edge function (already handles both)

#### 6. **Edge Cases & Considerations**

| Scenario | Handling |
|----------|----------|
| Agent ID collision (same UUID in both tables) | Highly unlikely; orchestrator checks submissions first |
| Endpoint agent goes offline | Orchestrator will error; chat shows error message |
| Developer unpublishes agent | No longer fetched; removed from UI |
| User edits native agent | Updates `ai_employees`; endpoint agents read-only |
| Org deleted | Both table records deleted via foreign keys |

#### 7. **Testing Checklist**
- [ ] Fetch both native and endpoint agents
- [ ] Display unified grid with correct badges
- [ ] Chat works with native agents
- [ ] Chat works with endpoint agents
- [ ] Edit/Delete buttons only for native agents
- [ ] Create new native agent still works
- [ ] Endpoint agents show developer info (if fetched)
- [ ] Empty state shows only "Create Employee" button
- [ ] Approve/publish an endpoint agent via `/developer`, verify it appears in `/ai-employees`

### What Stays the Same
- Native agent creation (CreateEmployeeDialog)
- Endpoint agent creation (Developer Portal)
- Chat experience (EmployeeChat)
- Orchestrator logic (no changes needed)
- Database tables (no migrations)

### File Changes Summary
1. **`src/pages/AIEmployees.tsx`** - Major: dual-fetch, merge, badge rendering
2. **`src/components/ai-employees/EmployeeChat.tsx`** - None
3. **`src/components/ai-employees/CreateEmployeeDialog.tsx`** - None
4. **Edge functions** - None
