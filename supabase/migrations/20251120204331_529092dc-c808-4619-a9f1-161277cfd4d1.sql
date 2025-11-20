-- Backfill chats for existing agent installations that don't have chat entries
DO $$
DECLARE
  installation_record RECORD;
  user_workspace_id uuid;
  new_chat_id uuid;
  agent_name text;
BEGIN
  -- Loop through all agent installations
  FOR installation_record IN 
    SELECT ai.id, ai.user_id, ai.agent_id
    FROM public.agent_installations ai
    WHERE NOT EXISTS (
      SELECT 1 FROM public.chats c 
      WHERE c.agent_id = ai.agent_id 
      AND c.created_by = ai.user_id
    )
  LOOP
    -- Get user's workspace
    SELECT workspace_id INTO user_workspace_id
    FROM public.workspace_members
    WHERE user_id = installation_record.user_id
    LIMIT 1;
    
    -- Get agent name
    SELECT name INTO agent_name
    FROM public.agents
    WHERE id = installation_record.agent_id;
    
    -- Only proceed if we found a workspace and agent
    IF user_workspace_id IS NOT NULL AND agent_name IS NOT NULL THEN
      -- Create chat
      INSERT INTO public.chats (workspace_id, agent_id, type, name, created_by)
      VALUES (user_workspace_id, installation_record.agent_id, 'direct', agent_name, installation_record.user_id)
      RETURNING id INTO new_chat_id;
      
      -- Add user as participant
      INSERT INTO public.chat_participants (chat_id, user_id)
      VALUES (new_chat_id, installation_record.user_id);
      
      RAISE NOTICE 'Created chat % for user % and agent %', new_chat_id, installation_record.user_id, installation_record.agent_id;
    END IF;
  END LOOP;
END $$;