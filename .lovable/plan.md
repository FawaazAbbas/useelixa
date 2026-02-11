

# Multi-Endpoint Self-Hosted Agents

## Overview
Currently, self-hosted agents only support a single endpoint URL. This plan adds an **"actions"** concept so a single agent can register multiple operations (e.g., `/plan`, `/run-cycle`, `/monitor`), each with its own path, HTTP method, and description. This directly enables agents like the Google Ads Marketer to be fully represented in the portal.

## What Changes

### 1. Database: New `agent_actions` table
A new table stores one row per action/operation for an agent:

```text
agent_actions
-------------------------------
id              uuid (PK)
agent_id        uuid (FK -> agent_submissions.id, ON DELETE CASCADE)
action_name     text (e.g. "plan", "run-cycle", "monitor")
path            text (e.g. "/plan")
method          text (default "POST")
description     text (optional)
request_schema  jsonb (optional -- example request body)
response_schema jsonb (optional -- example response body)
sort_order      integer (default 0)
created_at      timestamptz
```

RLS policies will mirror the `agent_submissions` pattern -- developers can manage actions for their own agents, admins can view all.

### 2. Submission Form -- New Step for Self-Hosted Agents
The existing 4-step wizard becomes **5 steps** when `self_hosted` is selected (the new step is inserted after the base URL/auth step):

- **Step 2** (existing): Base URL, auth header/token, runtime -- the `external_endpoint_url` now serves as the **base URL** prefix
- **Step 3** (new): **Actions Builder** -- a dynamic list where developers add actions:
  - Each action row has: Action Name, Path (relative to base URL), HTTP Method (GET/POST/PUT/DELETE), Description
  - Add/remove action buttons
  - At least one action is required to proceed
  - Pre-populated with a default `/handle` POST action

For platform-hosted agents, this step is skipped (they use the single `handle` entry function).

### 3. Self-Hosted Fields Update
`SelfHostedFields.tsx` is simplified to only collect:
- Runtime
- Base URL (renamed from "Endpoint URL")
- Auth Header / Auth Token

The API contract collapsible is removed (replaced by per-action schemas in the actions step).

### 4. New Component: `AgentActionsEditor.tsx`
A new form component for step 3 of self-hosted submissions:
- Renders a list of action cards
- Each card: action name input, relative path input, method dropdown, description textarea
- "Add Action" button at the bottom
- Trash icon to remove actions
- Validates that at least one action exists and each has a name + path

### 5. Detail Sheet Update
`AgentDetailSheet.tsx` gains a new **"Actions"** section (visible for self-hosted agents):
- Lists each registered action as a small card showing method badge (color-coded GET/POST/PUT/DELETE), full URL (base + path), and description
- Displayed between "Hosting Configuration" and "Execution Status"

### 6. Hook & Type Updates
- `AgentSubmission` interface in `useDeveloperPortal.ts` gets an optional `actions?: AgentAction[]` field
- New `AgentAction` interface exported from the hook
- `createAgent` is updated to: first create the agent, then insert all actions into `agent_actions`
- `fetchAgents` is updated to also fetch actions for each agent (or use a separate fetch in the detail sheet)

### 7. Review Summary Update
Step 4 (review) of the submission form shows the list of registered actions for self-hosted agents instead of a single endpoint URL.

## Technical Details

### Files to Create
| File | Purpose |
|------|---------|
| `src/components/developer/AgentActionsEditor.tsx` | Dynamic form for adding/editing actions |

### Files to Modify
| File | Change |
|------|--------|
| `src/hooks/useDeveloperPortal.ts` | Add `AgentAction` type, update `createAgent`/`fetchAgents` |
| `src/components/developer/AgentSubmissionForm.tsx` | Add actions state, insert step 3 for self-hosted, update step count (4 or 5), pass actions to `onSubmit` |
| `src/components/developer/SelfHostedFields.tsx` | Rename "Endpoint URL" to "Base URL", remove API contract collapsible |
| `src/components/developer/AgentDetailSheet.tsx` | Add actions section with method badges |

### Database Migration
```sql
CREATE TABLE public.agent_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agent_submissions(id) ON DELETE CASCADE,
  action_name text NOT NULL,
  path text NOT NULL,
  method text NOT NULL DEFAULT 'POST',
  description text,
  request_schema jsonb,
  response_schema jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

-- Developers can manage actions for their own agents
CREATE POLICY "Developers can manage own agent actions" ON public.agent_actions
  FOR ALL USING (
    agent_id IN (
      SELECT as2.id FROM agent_submissions as2
      JOIN developer_profiles dp ON dp.id = as2.developer_id
      WHERE dp.user_id = auth.uid()
    )
  );

-- Admins can view all
CREATE POLICY "Admins can view all agent actions" ON public.agent_actions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view actions of approved public agents
CREATE POLICY "Public can view approved agent actions" ON public.agent_actions
  FOR SELECT USING (
    agent_id IN (
      SELECT id FROM agent_submissions
      WHERE status = 'approved' AND is_public = true
    )
  );
```

### Submission Flow (Self-Hosted)
```text
Step 1: Name, description, category, version, hosting type
Step 2: Base URL, auth header, auth token, runtime
Step 3: Actions (name, path, method, description) -- NEW
Step 4: Icon upload
Step 5: Review & submit
```

### Submission Flow (Platform-Hosted)
```text
Step 1: Name, description, category, version, hosting type
Step 2: Code file, requirements, entry function, system prompt, tools
Step 3: Icon upload
Step 4: Review & submit
```

