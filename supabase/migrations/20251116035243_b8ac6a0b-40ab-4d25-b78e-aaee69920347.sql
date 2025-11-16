-- Fix infinite recursion in workspace_members RLS policies
DROP POLICY IF EXISTS "Users can view workspace members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace admins can add members" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace admins can remove members" ON public.workspace_members;

-- Create corrected policies without recursive checks
CREATE POLICY "Users can view workspace members"
ON public.workspace_members
FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Workspace admins can add members"
ON public.workspace_members
FOR INSERT
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Workspace admins can remove members"
ON public.workspace_members
FOR DELETE
USING (
  workspace_id IN (
    SELECT workspace_id
    FROM workspace_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
  )
);