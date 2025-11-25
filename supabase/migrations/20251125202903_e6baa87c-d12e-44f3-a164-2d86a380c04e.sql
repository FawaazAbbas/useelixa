-- Phase 1: Brian System Agent Setup

-- Add system flag to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;

-- Insert Brian as the system COO agent
INSERT INTO agents (
  name, 
  description, 
  short_description,
  is_system, 
  status, 
  is_chat_compatible,
  capabilities
) VALUES (
  'Brian',
  'Your AI Chief Operating Officer. Brian knows everything about your workspace, delegates work to specialized agents, and ensures quality before delivering results. He never executes external work directly - instead, he orchestrates your entire team of AI agents.',
  'Your AI COO - orchestrates, delegates, and quality controls',
  true,
  'active',
  true,
  ARRAY['platform_control', 'agent_orchestration', 'quality_review', 'delegation', 'workspace_management']
) ON CONFLICT DO NOTHING;

-- Brian conversations table for persistent 1:1 chat
CREATE TABLE IF NOT EXISTS brian_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  messages JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE brian_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own Brian conversations" ON brian_conversations
  FOR ALL USING (auth.uid() = user_id);

-- Auto-add Brian to all new group chats
CREATE OR REPLACE FUNCTION auto_add_brian_to_group_chat() 
RETURNS trigger AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS add_brian_to_groups ON chats;
CREATE TRIGGER add_brian_to_groups
AFTER INSERT ON chats
FOR EACH ROW EXECUTE FUNCTION auto_add_brian_to_group_chat();

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_brian_conversations_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS brian_conversations_updated_at ON brian_conversations;
CREATE TRIGGER brian_conversations_updated_at
BEFORE UPDATE ON brian_conversations
FOR EACH ROW EXECUTE FUNCTION update_brian_conversations_updated_at();