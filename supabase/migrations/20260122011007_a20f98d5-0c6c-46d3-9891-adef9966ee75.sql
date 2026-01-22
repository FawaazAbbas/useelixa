-- Add schedule field to tasks table for recurring AI tasks
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS schedule text,
ADD COLUMN IF NOT EXISTS last_scheduled_run timestamp with time zone,
ADD COLUMN IF NOT EXISTS next_scheduled_run timestamp with time zone;

-- Add index for finding scheduled tasks
CREATE INDEX IF NOT EXISTS idx_tasks_next_scheduled_run 
ON public.tasks (next_scheduled_run) 
WHERE next_scheduled_run IS NOT NULL AND assigned_to = 'ai';

-- Comment explaining the schedule format
COMMENT ON COLUMN public.tasks.schedule IS 'Cron expression for recurring tasks (e.g., "0 9 * * 5" for Fridays at 9am)';

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;