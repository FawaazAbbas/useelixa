
# Elixa "Super Genius" Features Implementation Plan

## Overview
This plan implements four major capabilities to transform Elixa from a reactive AI assistant into a proactive, intelligent orchestration platform:

1. **Workflow Orchestration** - Visual workflow builder with conditional logic
2. **Agent-to-Agent Communication** - AI Employees that collaborate and delegate
3. **AI Explainability** - Reasoning traces for transparency
4. **Daily AI Digest** - Automated summaries of user activity

---

## Phase 1: Workflow Orchestration (Visual Workflow Builder)

### What It Does
Users can create multi-step automated workflows that chain tools together with conditional logic, similar to n8n or Zapier but powered by AI.

### Database Schema

```sql
-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES orgs(id),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT, -- 'manual', 'schedule', 'webhook', 'event'
  trigger_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow steps (nodes in the workflow)
CREATE TABLE workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL, -- 'tool', 'condition', 'loop', 'delay', 'ai_decision'
  tool_name TEXT, -- Which tool to execute
  tool_params JSONB DEFAULT '{}',
  condition_config JSONB, -- For conditional steps
  on_success_step_id UUID,
  on_failure_step_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow executions (run history)
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE,
  triggered_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'paused'
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  step_results JSONB DEFAULT '[]',
  error_message TEXT
);
```

### New Components

**`src/pages/Workflows.tsx`** - Main workflows page with list view
**`src/components/workflows/WorkflowBuilder.tsx`** - Visual drag-drop workflow editor
**`src/components/workflows/WorkflowStepCard.tsx`** - Individual step configuration
**`src/components/workflows/WorkflowCanvas.tsx`** - Canvas for connecting steps
**`src/components/workflows/ConditionEditor.tsx`** - Condition builder UI

### Edge Function

**`supabase/functions/execute-workflow/index.ts`**
- Loads workflow definition
- Executes steps in order
- Handles conditional branching
- Logs each step result
- Supports pause/resume for HITL approvals

### UI Flow
```text
[Workflows Page]
    ↓
[+ Create Workflow] → Opens Builder
    ↓
[Drag Steps: Gmail → Condition → Slack/Notion]
    ↓
[Configure Each Step]
    ↓
[Save & Activate]
    ↓
[Runs automatically or manually]
```

---

## Phase 2: Agent-to-Agent Communication (AI Employees)

### What It Does
Create specialized AI agents (employees) that can collaborate, delegate tasks to each other, and work together on complex problems.

### Database Schema

```sql
-- AI Employees (specialized agents)
CREATE TABLE ai_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'sales_rep', 'researcher', 'writer', 'analyst'
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT,
  allowed_tools TEXT[] DEFAULT '{}',
  can_delegate_to UUID[], -- Other AI employees this one can delegate to
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Employee conversations (inter-agent communication)
CREATE TABLE ai_employee_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_employee_id UUID REFERENCES ai_employees(id),
  to_employee_id UUID REFERENCES ai_employees(id),
  parent_task_id UUID REFERENCES tasks(id),
  message_type TEXT, -- 'delegation', 'response', 'clarification', 'handoff'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Employee task assignments
CREATE TABLE ai_employee_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES ai_employees(id),
  original_task_id UUID REFERENCES tasks(id),
  delegated_by_employee_id UUID REFERENCES ai_employees(id),
  status TEXT DEFAULT 'pending',
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);
```

### New Components

**`src/pages/AIEmployees.tsx`** - Manage AI employees
**`src/components/ai-employees/EmployeeCard.tsx`** - Display employee info
**`src/components/ai-employees/CreateEmployeeDialog.tsx`** - Create/edit employees
**`src/components/ai-employees/EmployeeChat.tsx`** - Direct chat with an employee
**`src/components/ai-employees/DelegationViewer.tsx`** - See how tasks flow between employees

### Edge Functions

**`supabase/functions/ai-employee-orchestrator/index.ts`**
- Routes tasks to appropriate employees
- Handles delegation logic
- Manages inter-agent communication
- Ensures tasks complete or escalate

### Pre-built Employee Templates
- **Research Assistant** - Searches knowledge base, web, summarizes findings
- **Email Manager** - Drafts, organizes, responds to emails
- **Task Coordinator** - Breaks down projects, assigns subtasks
- **Data Analyst** - Analyzes Stripe/Shopify data, creates reports
- **Content Writer** - Creates notes, documents, reports

---

## Phase 3: AI Explainability (Reasoning Traces)

### What It Does
Shows users WHY the AI made decisions, what tools it considered, and its reasoning process. Builds trust and allows debugging.

### Database Schema

```sql
-- Reasoning traces for AI actions
CREATE TABLE reasoning_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES chat_messages_v2(id),
  task_id UUID REFERENCES tasks(id),
  workflow_execution_id UUID REFERENCES workflow_executions(id),
  employee_id UUID REFERENCES ai_employees(id),
  reasoning_steps JSONB NOT NULL, -- Array of step objects
  confidence_score DECIMAL(3,2),
  tools_considered TEXT[],
  tools_used TEXT[],
  decision_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Reasoning Step Structure
```json
{
  "reasoning_steps": [
    {
      "step": 1,
      "thought": "User wants to send an email to John",
      "action": "Analyzing available tools",
      "observation": "Gmail is connected, can use gmail_send_email"
    },
    {
      "step": 2,
      "thought": "Need to check if I have John's email address",
      "action": "Searching contacts in knowledge base",
      "observation": "Found john@example.com in contacts.csv"
    },
    {
      "step": 3,
      "thought": "Have all required info, proceeding with email draft",
      "action": "Calling gmail_send_email tool",
      "observation": "Email drafted, awaiting user confirmation"
    }
  ]
}
```

### New Components

**`src/components/chat/ReasoningTrace.tsx`** - Expandable trace viewer
**`src/components/chat/ThinkingIndicator.tsx`** - Shows AI is reasoning
**`src/components/ai-employees/EmployeeDecisionLog.tsx`** - Employee-specific traces

### Chat Function Updates

Modify `supabase/functions/chat/index.ts` to:
1. Track reasoning at each step
2. Store traces before final response
3. Include trace ID in response metadata

### UI Integration

Add a "Show reasoning" toggle/button on:
- Chat messages (assistant responses)
- Task completion notifications
- Workflow execution logs

---

## Phase 4: Daily AI Digest (Automated Summaries)

### What It Does
Automatically generates and delivers a daily summary of emails, tasks, calendar events, and key metrics.

### Database Schema

```sql
-- Digest configurations
CREATE TABLE digest_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  delivery_time TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  include_emails BOOLEAN DEFAULT true,
  include_tasks BOOLEAN DEFAULT true,
  include_calendar BOOLEAN DEFAULT true,
  include_metrics BOOLEAN DEFAULT true,
  email_delivery BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Generated digests
CREATE TABLE daily_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  digest_date DATE NOT NULL,
  content JSONB NOT NULL,
  summary TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  UNIQUE(user_id, digest_date)
);
```

### Edge Functions

**`supabase/functions/generate-daily-digest/index.ts`**
- Triggered by scheduled cron job
- Gathers data from: emails, tasks, calendar, Stripe, Shopify
- Uses AI to summarize and prioritize
- Stores digest and optionally sends email

**`supabase/functions/send-digest-email/index.ts`**
- Formats digest as HTML email
- Sends via connected Gmail or SMTP

### Digest Content Structure
```json
{
  "date": "2026-01-24",
  "summary": "You have 3 high-priority tasks due today and 12 unread emails...",
  "sections": {
    "emails": {
      "unread_count": 12,
      "important": [...],
      "actionable": [...]
    },
    "tasks": {
      "due_today": [...],
      "overdue": [...],
      "completed_yesterday": [...]
    },
    "calendar": {
      "today_events": [...],
      "upcoming": [...]
    },
    "metrics": {
      "stripe_revenue": "...",
      "shopify_orders": "..."
    },
    "ai_suggestions": [
      "Consider following up with Client X",
      "Task 'Q4 Report' is overdue by 2 days"
    ]
  }
}
```

### New Components

**`src/components/settings/DigestSettings.tsx`** - Configure digest preferences
**`src/pages/Digest.tsx`** - View past digests
**`src/components/digest/DigestCard.tsx`** - Display a single digest
**`src/components/digest/DigestSection.tsx`** - Section component (emails, tasks, etc.)

### Cron Setup
```sql
SELECT cron.schedule(
  'generate-daily-digests',
  '0 * * * *', -- Every hour (checks user timezones)
  $$
  SELECT net.http_post(
    url:='https://okkybxipbxpoyzqmtosz.supabase.co/functions/v1/generate-daily-digest',
    headers:='{"Authorization": "Bearer <anon-key>"}'::jsonb
  )
  $$
);
```

---

## Navigation Updates

Add new sidebar items to `src/components/MainNavSidebar.tsx`:

```typescript
const navItems: NavItem[] = [
  // ... existing items
  { icon: Workflow, label: "Workflows", path: "/workflows" },
  { icon: Users, label: "AI Employees", path: "/ai-employees" },
  { icon: Newspaper, label: "Daily Digest", path: "/digest" },
];
```

---

## Implementation Order

### Week 1: Foundation
1. Database migrations for all new tables
2. Basic Workflows page and list view
3. AI Employees table and basic CRUD

### Week 2: Workflow Builder
4. Visual workflow builder component
5. Step configuration UI
6. Workflow execution edge function

### Week 3: AI Employees
7. Employee creation and management
8. Delegation logic and orchestrator
9. Inter-employee messaging

### Week 4: Explainability & Digest
10. Reasoning trace capture in chat
11. Trace viewer UI component
12. Daily digest generation
13. Digest settings and viewer

---

## Technical Considerations

### Performance
- Workflows execute asynchronously using `EdgeRuntime.waitUntil()`
- Reasoning traces are stored in background, not blocking responses
- Digest generation runs off-peak hours

### Security
- AI Employees inherit org-level tool permissions
- Workflow steps respect existing HITL approval for write actions
- All inter-agent messages logged for audit

### Scalability
- Workflow executions are stateless and resumable
- Employee orchestrator uses message queue pattern
- Digests are cached and served from database

---

## Files to Create

### New Pages
- `src/pages/Workflows.tsx`
- `src/pages/AIEmployees.tsx`
- `src/pages/Digest.tsx`

### New Components
- `src/components/workflows/WorkflowBuilder.tsx`
- `src/components/workflows/WorkflowCanvas.tsx`
- `src/components/workflows/WorkflowStepCard.tsx`
- `src/components/workflows/ConditionEditor.tsx`
- `src/components/ai-employees/EmployeeCard.tsx`
- `src/components/ai-employees/CreateEmployeeDialog.tsx`
- `src/components/ai-employees/DelegationViewer.tsx`
- `src/components/chat/ReasoningTrace.tsx`
- `src/components/digest/DigestCard.tsx`
- `src/components/settings/DigestSettings.tsx`

### New Edge Functions
- `supabase/functions/execute-workflow/index.ts`
- `supabase/functions/ai-employee-orchestrator/index.ts`
- `supabase/functions/generate-daily-digest/index.ts`

### Modified Files
- `src/components/MainNavSidebar.tsx` (new nav items)
- `src/App.tsx` (new routes)
- `supabase/functions/chat/index.ts` (reasoning traces)
- `supabase/config.toml` (new functions)
