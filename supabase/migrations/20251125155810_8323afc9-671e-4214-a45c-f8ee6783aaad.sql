-- Phase 1: Chat Automations - Add chat_id to automations
ALTER TABLE automations ADD COLUMN IF NOT EXISTS chat_id uuid REFERENCES chats(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_automations_chat_id ON automations(chat_id);

-- Phase 2: Chat Settings - Add custom_name to agent_installations
ALTER TABLE agent_installations ADD COLUMN IF NOT EXISTS custom_name text;

-- Phase 4: Multi-Agent Collaboration - Add agent-to-agent fields to messages
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_agent_to_agent boolean DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS target_agent_id uuid REFERENCES agents(id);

-- Phase 5: Agent-Specific Files - Create agent_documents table
CREATE TABLE IF NOT EXISTS agent_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_installation_id uuid REFERENCES agent_installations(id) ON DELETE CASCADE,
  document_id uuid REFERENCES workspace_documents(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(agent_installation_id, document_id)
);

-- Enable RLS on agent_documents
ALTER TABLE agent_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_documents
CREATE POLICY "Users can view agent documents for their installations"
  ON agent_documents FOR SELECT
  USING (
    agent_installation_id IN (
      SELECT id FROM agent_installations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add agent documents to their installations"
  ON agent_documents FOR INSERT
  WITH CHECK (
    agent_installation_id IN (
      SELECT id FROM agent_installations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete agent documents from their installations"
  ON agent_documents FOR DELETE
  USING (
    agent_installation_id IN (
      SELECT id FROM agent_installations WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_documents_installation ON agent_documents(agent_installation_id);
CREATE INDEX IF NOT EXISTS idx_agent_documents_document ON agent_documents(document_id);
CREATE INDEX IF NOT EXISTS idx_messages_agent_to_agent ON messages(is_agent_to_agent, target_agent_id) WHERE is_agent_to_agent = true;