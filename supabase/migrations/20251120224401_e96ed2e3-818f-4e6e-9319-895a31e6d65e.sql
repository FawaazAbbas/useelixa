-- Fix RLS policy for chat creation - allow workspace members to create chats
DROP POLICY IF EXISTS "Workspace members can create chats" ON public.chats;

CREATE POLICY "Workspace members can create chats"
ON public.chats
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_members.workspace_id = chats.workspace_id
    AND workspace_members.user_id = auth.uid()
  )
);

-- Also fix the SELECT policy to allow users to see chats in their workspace
DROP POLICY IF EXISTS "Users can view chats they're part of" ON public.chats;

CREATE POLICY "Users can view chats in workspace"
ON public.chats
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_members.workspace_id = chats.workspace_id
    AND workspace_members.user_id = auth.uid()
  )
);