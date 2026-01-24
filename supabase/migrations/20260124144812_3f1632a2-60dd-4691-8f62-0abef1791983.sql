-- =============================================
-- SUPER GENIUS FEATURES DATABASE SCHEMA
-- =============================================

-- 1. WORKFLOW ORCHESTRATION TABLES
-- =============================================

-- Workflows table
CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT DEFAULT 'manual', -- 'manual', 'schedule', 'webhook', 'event'
  trigger_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflows
CREATE POLICY "Users can view their own workflows"
  ON public.workflows FOR SELECT
  USING (user_id = auth.uid() OR public.is_org_member(org_id));

CREATE POLICY "Users can create workflows"
  ON public.workflows FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workflows"
  ON public.workflows FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own workflows"
  ON public.workflows FOR DELETE
  USING (user_id = auth.uid());

-- Workflow steps (nodes in the workflow)
CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  step_type TEXT NOT NULL, -- 'tool', 'condition', 'loop', 'delay', 'ai_decision'
  step_name TEXT,
  tool_name TEXT, -- Which tool to execute
  tool_params JSONB DEFAULT '{}',
  condition_config JSONB, -- For conditional steps
  on_success_step_id UUID,
  on_failure_step_id UUID,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_steps (inherit from workflow)
CREATE POLICY "Users can manage workflow steps"
  ON public.workflow_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id AND (w.user_id = auth.uid() OR public.is_org_member(w.org_id))
    )
  );

-- Workflow executions (run history)
CREATE TABLE public.workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
  triggered_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed', 'paused'
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  current_step_id UUID,
  step_results JSONB DEFAULT '[]',
  error_message TEXT
);

-- Enable RLS
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_executions
CREATE POLICY "Users can view their workflow executions"
  ON public.workflow_executions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.workflows w
      WHERE w.id = workflow_id AND (w.user_id = auth.uid() OR public.is_org_member(w.org_id))
    )
  );

-- 2. AI EMPLOYEES TABLES
-- =============================================

-- AI Employees (specialized agents)
CREATE TABLE public.ai_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  role TEXT NOT NULL, -- 'sales_rep', 'researcher', 'writer', 'analyst', 'coordinator'
  description TEXT,
  avatar_url TEXT,
  system_prompt TEXT,
  allowed_tools TEXT[] DEFAULT '{}',
  can_delegate_to UUID[], -- Other AI employees this one can delegate to
  is_active BOOLEAN DEFAULT true,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_employees ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_employees
CREATE POLICY "Users can view org AI employees"
  ON public.ai_employees FOR SELECT
  USING (public.is_org_member(org_id) OR is_template = true);

CREATE POLICY "Org members can create AI employees"
  ON public.ai_employees FOR INSERT
  WITH CHECK (public.is_org_member(org_id));

CREATE POLICY "Org admins can update AI employees"
  ON public.ai_employees FOR UPDATE
  USING (public.is_org_member(org_id));

CREATE POLICY "Org admins can delete AI employees"
  ON public.ai_employees FOR DELETE
  USING (public.is_org_admin(org_id));

-- AI Employee conversations (inter-agent communication)
CREATE TABLE public.ai_employee_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_employee_id UUID REFERENCES public.ai_employees(id) ON DELETE SET NULL,
  to_employee_id UUID REFERENCES public.ai_employees(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  initiated_by_user UUID REFERENCES auth.users(id),
  message_type TEXT, -- 'delegation', 'response', 'clarification', 'handoff', 'status_update'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_employee_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_employee_messages
CREATE POLICY "Users can view org employee messages"
  ON public.ai_employee_messages FOR SELECT
  USING (
    initiated_by_user = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.ai_employees e
      WHERE (e.id = from_employee_id OR e.id = to_employee_id)
      AND public.is_org_member(e.org_id)
    )
  );

CREATE POLICY "Users can create employee messages"
  ON public.ai_employee_messages FOR INSERT
  WITH CHECK (initiated_by_user = auth.uid() OR initiated_by_user IS NULL);

-- AI Employee task assignments
CREATE TABLE public.ai_employee_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.ai_employees(id) ON DELETE CASCADE,
  original_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  delegated_by_employee_id UUID REFERENCES public.ai_employees(id) ON DELETE SET NULL,
  assigned_by_user UUID REFERENCES auth.users(id),
  task_description TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'delegated'
  priority TEXT DEFAULT 'medium',
  result TEXT,
  result_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.ai_employee_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_employee_tasks
CREATE POLICY "Users can view org employee tasks"
  ON public.ai_employee_tasks FOR ALL
  USING (
    assigned_by_user = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.ai_employees e
      WHERE e.id = employee_id AND public.is_org_member(e.org_id)
    )
  );

-- 3. REASONING TRACES TABLE
-- =============================================

-- Reasoning traces for AI actions
CREATE TABLE public.reasoning_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.chat_messages_v2(id) ON DELETE SET NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  workflow_execution_id UUID REFERENCES public.workflow_executions(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES public.ai_employees(id) ON DELETE SET NULL,
  reasoning_steps JSONB NOT NULL DEFAULT '[]', -- Array of step objects
  confidence_score DECIMAL(3,2),
  tools_considered TEXT[],
  tools_used TEXT[],
  decision_summary TEXT,
  model_used TEXT,
  total_tokens INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reasoning_traces ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reasoning_traces
CREATE POLICY "Users can view their own reasoning traces"
  ON public.reasoning_traces FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert reasoning traces"
  ON public.reasoning_traces FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NOT NULL);

-- 4. DAILY DIGEST TABLES
-- =============================================

-- Digest configurations
CREATE TABLE public.digest_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  delivery_time TIME DEFAULT '08:00',
  timezone TEXT DEFAULT 'UTC',
  include_emails BOOLEAN DEFAULT true,
  include_tasks BOOLEAN DEFAULT true,
  include_calendar BOOLEAN DEFAULT true,
  include_metrics BOOLEAN DEFAULT true,
  include_ai_suggestions BOOLEAN DEFAULT true,
  email_delivery BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.digest_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for digest_configs
CREATE POLICY "Users can manage their own digest config"
  ON public.digest_configs FOR ALL
  USING (user_id = auth.uid());

-- Generated digests
CREATE TABLE public.daily_digests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  digest_date DATE NOT NULL,
  content JSONB NOT NULL,
  summary TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  delivery_method TEXT, -- 'in_app', 'email', 'both'
  UNIQUE(user_id, digest_date)
);

-- Enable RLS
ALTER TABLE public.daily_digests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_digests
CREATE POLICY "Users can view their own digests"
  ON public.daily_digests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert digests"
  ON public.daily_digests FOR INSERT
  WITH CHECK (user_id IS NOT NULL);

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Update updated_at trigger for workflows
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at trigger for ai_employees
CREATE TRIGGER update_ai_employees_updated_at
  BEFORE UPDATE ON public.ai_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update updated_at trigger for digest_configs
CREATE TRIGGER update_digest_configs_updated_at
  BEFORE UPDATE ON public.digest_configs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_workflows_org_id ON public.workflows(org_id);
CREATE INDEX idx_workflow_steps_workflow_id ON public.workflow_steps(workflow_id);
CREATE INDEX idx_workflow_executions_workflow_id ON public.workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_status ON public.workflow_executions(status);

CREATE INDEX idx_ai_employees_org_id ON public.ai_employees(org_id);
CREATE INDEX idx_ai_employee_messages_from ON public.ai_employee_messages(from_employee_id);
CREATE INDEX idx_ai_employee_messages_to ON public.ai_employee_messages(to_employee_id);
CREATE INDEX idx_ai_employee_tasks_employee_id ON public.ai_employee_tasks(employee_id);
CREATE INDEX idx_ai_employee_tasks_status ON public.ai_employee_tasks(status);

CREATE INDEX idx_reasoning_traces_user_id ON public.reasoning_traces(user_id);
CREATE INDEX idx_reasoning_traces_message_id ON public.reasoning_traces(message_id);

CREATE INDEX idx_daily_digests_user_date ON public.daily_digests(user_id, digest_date);
CREATE INDEX idx_digest_configs_user_id ON public.digest_configs(user_id);