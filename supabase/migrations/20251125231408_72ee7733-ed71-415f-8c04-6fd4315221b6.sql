-- Clean up duplicate brian_conversations by keeping only the most recent one
DELETE FROM brian_conversations a USING brian_conversations b
WHERE a.id < b.id 
  AND a.user_id = b.user_id 
  AND a.workspace_id = b.workspace_id;

-- Now add unique constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_user_workspace'
  ) THEN
    ALTER TABLE brian_conversations 
    ADD CONSTRAINT unique_user_workspace 
    UNIQUE (user_id, workspace_id);
  END IF;
END $$;