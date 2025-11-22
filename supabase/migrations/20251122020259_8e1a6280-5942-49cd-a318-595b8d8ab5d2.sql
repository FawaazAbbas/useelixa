-- Add new columns to agents table for blueprint model
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS short_description text,
ADD COLUMN IF NOT EXISTS is_chat_compatible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS required_credentials jsonb DEFAULT '[]'::jsonb;

-- Update existing agents to have required_credentials based on workflow_json
UPDATE agents 
SET required_credentials = '[]'::jsonb 
WHERE required_credentials IS NULL;

-- Create chat_sessions table (one per agent installation)
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  installation_id uuid NOT NULL REFERENCES agent_installations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create chat_messages table (replaces messages for agent chats)
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('user', 'agent', 'system')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Add install_state to agent_installations
ALTER TABLE agent_installations
ADD COLUMN IF NOT EXISTS install_state jsonb DEFAULT '{}'::jsonb;

-- Enable RLS on new tables
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_sessions
CREATE POLICY "Users can view chat sessions in their workspace"
ON chat_sessions FOR SELECT
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "System can create chat sessions"
ON chat_sessions FOR INSERT
WITH CHECK (true);

-- RLS policies for chat_messages
CREATE POLICY "Users can view messages in their workspace chats"
ON chat_messages FOR SELECT
USING (
  session_id IN (
    SELECT id FROM chat_sessions WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can send messages to their workspace chats"
ON chat_messages FOR INSERT
WITH CHECK (
  session_id IN (
    SELECT id FROM chat_sessions WHERE workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
);

-- Add trigger for chat_sessions updated_at
CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON chat_sessions
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_installation ON chat_sessions(installation_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_workspace ON chat_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent ON chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);