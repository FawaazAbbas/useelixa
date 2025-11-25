-- Fix search_path for Brian functions
CREATE OR REPLACE FUNCTION auto_add_brian_to_group_chat() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  brian_id UUID;
BEGIN
  IF NEW.type = 'group' THEN
    SELECT id INTO brian_id 
    FROM agents 
    WHERE is_system = true AND name = 'Brian' 
    LIMIT 1;
    
    IF brian_id IS NOT NULL THEN
      INSERT INTO chat_agents (chat_id, agent_id, added_by)
      VALUES (NEW.id, brian_id, NEW.created_by)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION update_brian_conversations_updated_at()
RETURNS trigger 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;