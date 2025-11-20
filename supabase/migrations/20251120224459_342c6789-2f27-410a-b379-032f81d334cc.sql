-- Create security definer function to get user's workspaces
CREATE OR REPLACE FUNCTION public.get_user_workspace_ids(_user_id uuid)
RETURNS TABLE(workspace_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT workspace_id
  FROM public.workspace_members
  WHERE user_id = _user_id;
$$;

-- Fix the recursive RLS policy on workspace_members
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;

CREATE POLICY "Users can view workspace members"
ON public.workspace_members
FOR SELECT
USING (
  workspace_id IN (
    SELECT get_user_workspace_ids(auth.uid())
  )
);

-- Fix the INSERT policy
DROP POLICY IF EXISTS "Workspace admins can add members" ON public.workspace_members;

CREATE POLICY "Workspace admins can add members"
ON public.workspace_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);

-- Fix the DELETE policy
DROP POLICY IF EXISTS "Workspace admins can remove members" ON public.workspace_members;

CREATE POLICY "Workspace admins can remove members"
ON public.workspace_members
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
    AND wm.role IN ('owner', 'admin')
  )
);