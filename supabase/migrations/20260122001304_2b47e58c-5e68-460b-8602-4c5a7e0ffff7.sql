-- Add scheduling columns to tasks table for AI task runner
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_run_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_tools_allowed TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ai_context TEXT;

-- Create index for efficient scheduled task queries
CREATE INDEX IF NOT EXISTS idx_tasks_ai_scheduled 
ON public.tasks(scheduled_at) 
WHERE assigned_to = 'ai' AND status = 'todo' AND scheduled_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.tasks.scheduled_at IS 'When the AI should execute this task (null = immediate)';
COMMENT ON COLUMN public.tasks.last_run_at IS 'When the AI last attempted this task';
COMMENT ON COLUMN public.tasks.ai_tools_allowed IS 'Which tools the AI can use for this task (empty = all available)';
COMMENT ON COLUMN public.tasks.ai_context IS 'Additional context to provide to the AI when executing';