
-- Add workspace_id column to tasks
ALTER TABLE public.tasks ADD COLUMN workspace_id uuid REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can create their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- New RLS: workspace members can view all tasks in their workspace
CREATE POLICY "Workspace members can view tasks"
ON public.tasks FOR SELECT
USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
  OR (workspace_id IS NULL AND user_id = auth.uid())
);

-- Users can create tasks (must be workspace member or own task)
CREATE POLICY "Users can create tasks"
ON public.tasks FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Workspace members can update tasks in their workspace
CREATE POLICY "Workspace members can update tasks"
ON public.tasks FOR UPDATE
USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
  OR (workspace_id IS NULL AND user_id = auth.uid())
);

-- Workspace members can delete tasks in their workspace
CREATE POLICY "Workspace members can delete tasks"
ON public.tasks FOR DELETE
USING (
  workspace_id IN (SELECT get_user_workspace_ids(auth.uid()))
  OR (workspace_id IS NULL AND user_id = auth.uid())
);
