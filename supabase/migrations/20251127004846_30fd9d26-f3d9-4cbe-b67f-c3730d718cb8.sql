-- Fix group chat visibility to respect participation
-- Drop existing policy
DROP POLICY IF EXISTS "Users can view chats in workspace" ON chats;

-- Create new policy that handles direct and group chats differently
CREATE POLICY "Users can view chats in workspace" ON chats
FOR SELECT USING (
  CASE 
    -- Direct chats: viewable by workspace members
    WHEN type = 'direct' THEN 
      EXISTS (
        SELECT 1 FROM workspace_members 
        WHERE workspace_members.workspace_id = chats.workspace_id 
        AND workspace_members.user_id = auth.uid()
      )
    -- Group chats: only viewable by participants
    WHEN type = 'group' THEN 
      EXISTS (
        SELECT 1 FROM chat_participants 
        WHERE chat_participants.chat_id = chats.id 
        AND chat_participants.user_id = auth.uid()
      )
    ELSE false
  END
);