
-- 1. Create agent_messages table
CREATE TABLE public.agent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL,
  installation_id UUID NOT NULL REFERENCES public.agent_installations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  request_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast thread loading
CREATE INDEX idx_agent_messages_installation ON public.agent_messages(installation_id, created_at);

-- Enable RLS
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;

-- RLS: users can read/write messages for their own installations
CREATE POLICY "Users can view messages for their installations"
ON public.agent_messages FOR SELECT
USING (
  installation_id IN (
    SELECT id FROM public.agent_installations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages for their installations"
ON public.agent_messages FOR INSERT
WITH CHECK (
  installation_id IN (
    SELECT id FROM public.agent_installations WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete messages for their installations"
ON public.agent_messages FOR DELETE
USING (
  installation_id IN (
    SELECT id FROM public.agent_installations WHERE user_id = auth.uid()
  )
);

-- Service role can insert (for orchestrator responses)
CREATE POLICY "Service role can insert agent messages"
ON public.agent_messages FOR INSERT
WITH CHECK (true);

-- 2. Add deployed_at to agent_installations
ALTER TABLE public.agent_installations
ADD COLUMN deployed_at TIMESTAMPTZ;

-- Auto-deploy existing installations
UPDATE public.agent_installations SET deployed_at = created_at WHERE deployed_at IS NULL;
