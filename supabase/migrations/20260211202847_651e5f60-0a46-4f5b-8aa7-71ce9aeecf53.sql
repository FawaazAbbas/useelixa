
-- Phase 1: Extend agent_submissions with endpoint fields
ALTER TABLE public.agent_submissions
  ADD COLUMN IF NOT EXISTS execution_mode TEXT NOT NULL DEFAULT 'native',
  ADD COLUMN IF NOT EXISTS endpoint_base_url TEXT,
  ADD COLUMN IF NOT EXISTS endpoint_invoke_path TEXT DEFAULT '/invoke',
  ADD COLUMN IF NOT EXISTS endpoint_health_path TEXT DEFAULT '/health',
  ADD COLUMN IF NOT EXISTS endpoint_auth_type TEXT DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS endpoint_secret TEXT,
  ADD COLUMN IF NOT EXISTS input_schema JSONB,
  ADD COLUMN IF NOT EXISTS output_schema JSONB,
  ADD COLUMN IF NOT EXISTS capability_manifest JSONB;

-- Create agent_installations table
CREATE TABLE public.agent_installations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agent_submissions(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  permissions JSONB NOT NULL DEFAULT '{}',
  risk_tier TEXT NOT NULL DEFAULT 'sandbox',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_installations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own installations"
  ON public.agent_installations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create installations"
  ON public.agent_installations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installations"
  ON public.agent_installations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own installations"
  ON public.agent_installations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to installations"
  ON public.agent_installations FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create agent_proposals table
CREATE TABLE public.agent_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  installation_id UUID NOT NULL REFERENCES public.agent_installations(id) ON DELETE CASCADE,
  request_id UUID NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID
);

ALTER TABLE public.agent_proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own proposals"
  ON public.agent_proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own proposals"
  ON public.agent_proposals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to proposals"
  ON public.agent_proposals FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add unique constraint to prevent duplicate installations
CREATE UNIQUE INDEX idx_agent_installations_unique 
  ON public.agent_installations(agent_id, workspace_id, user_id);
