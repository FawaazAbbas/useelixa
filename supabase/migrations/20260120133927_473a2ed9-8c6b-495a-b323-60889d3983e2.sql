-- Phase 6: Tool Execution Logging & Credential Tracking

-- Add columns to user_credentials for tracking usage
ALTER TABLE public.user_credentials 
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

-- Create tool execution log table for auditing
CREATE TABLE IF NOT EXISTS public.tool_execution_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  chat_id UUID REFERENCES public.chats(id),
  workspace_id UUID REFERENCES public.workspaces(id),
  tool_name TEXT NOT NULL,
  credential_type TEXT,
  input_summary TEXT,
  output_summary TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tool_execution_log
ALTER TABLE public.tool_execution_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own tool execution logs
CREATE POLICY "Users can view their own tool logs" 
ON public.tool_execution_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own logs (via edge functions with service role)
CREATE POLICY "Service role can insert logs" 
ON public.tool_execution_log 
FOR INSERT 
WITH CHECK (true);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_tool_execution_log_user_created 
ON public.tool_execution_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tool_execution_log_chat 
ON public.tool_execution_log(chat_id) WHERE chat_id IS NOT NULL;

-- Enable realtime for tool execution logs (for live updates in UI)
ALTER PUBLICATION supabase_realtime ADD TABLE public.tool_execution_log;