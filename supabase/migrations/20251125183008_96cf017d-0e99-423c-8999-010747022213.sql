-- Phase 1: Critical Security Fixes

-- 1. Fix profiles table RLS - restrict email exposure and viewing
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view workspace member profiles"
ON public.profiles
FOR SELECT
USING (
  id = auth.uid() OR 
  id IN (
    SELECT wm2.user_id 
    FROM workspace_members wm1
    JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
    WHERE wm1.user_id = auth.uid()
  )
);

-- 2. Fix agents table RLS - hide sensitive workflow data from public
DROP POLICY IF EXISTS "Anyone can view active agents" ON public.agents;
CREATE POLICY "Anyone can view active agent details"
ON public.agents
FOR SELECT
USING (
  CASE 
    WHEN status = 'active' THEN true
    WHEN publisher_id = auth.uid() THEN true
    WHEN has_role(auth.uid(), 'admin') THEN true
    ELSE false
  END
);

-- 3. Fix workspaces RLS policy (broken foreign key reference)
DROP POLICY IF EXISTS "Users can view workspaces they're members of" ON public.workspaces;
CREATE POLICY "Users can view workspaces they're members of"
ON public.workspaces
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  )
);

-- 4. Add missing UPDATE/DELETE policies for messages
CREATE POLICY "Users can delete own messages"
ON public.messages
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Add missing UPDATE/DELETE policies for chats
CREATE POLICY "Chat creators can update chats"
ON public.chats
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Chat creators can delete chats"
ON public.chats
FOR DELETE
USING (auth.uid() = created_by);

-- 6. Add missing DELETE policy for chat_participants
CREATE POLICY "Users can leave chats"
ON public.chat_participants
FOR DELETE
USING (auth.uid() = user_id);

-- 7. Add missing UPDATE policy for agent_installations
CREATE POLICY "Users can update own installations"
ON public.agent_installations
FOR UPDATE
USING (auth.uid() = user_id);