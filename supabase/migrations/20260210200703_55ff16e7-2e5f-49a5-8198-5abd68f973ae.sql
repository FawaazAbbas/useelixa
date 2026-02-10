
-- Add execution tracking columns to agent_submissions
ALTER TABLE public.agent_submissions
ADD COLUMN IF NOT EXISTS execution_status text NOT NULL DEFAULT 'ready',
ADD COLUMN IF NOT EXISTS execution_error text;
