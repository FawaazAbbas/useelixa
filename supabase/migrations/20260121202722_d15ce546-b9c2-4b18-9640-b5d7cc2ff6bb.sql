-- Create pending_actions table for human-in-the-loop confirmation
CREATE TABLE IF NOT EXISTS public.pending_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  org_id UUID,
  session_id UUID NOT NULL,
  tool_name TEXT NOT NULL,
  tool_display_name TEXT,
  parameters JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'executed', 'failed')),
  result JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.pending_actions ENABLE ROW LEVEL SECURITY;

-- RLS policies for pending_actions
CREATE POLICY "Users can view their own pending actions" 
ON public.pending_actions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pending actions" 
ON public.pending_actions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending actions" 
ON public.pending_actions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_actions_session ON public.pending_actions(session_id, status);
CREATE INDEX IF NOT EXISTS idx_pending_actions_user ON public.pending_actions(user_id, status);