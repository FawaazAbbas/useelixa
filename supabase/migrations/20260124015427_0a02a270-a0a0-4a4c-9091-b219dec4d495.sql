-- Add is_pinned column to notes table for pinning functionality
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Add is_recurring and recurrence_pattern to tasks for recurring tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT;

-- Create index for faster pinned notes queries
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON public.notes (workspace_id, is_pinned DESC, updated_at DESC);