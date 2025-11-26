-- Phase 1: Add personality architecture to agents table
ALTER TABLE agents 
ADD COLUMN personality_traits JSONB DEFAULT '{"warmth": 0.7, "humor": 0.5, "curiosity": 0.6, "empathy": 0.8}'::jsonb,
ADD COLUMN communication_quirks TEXT[] DEFAULT ARRAY['uses natural language', 'shares relevant thoughts', 'asks follow-up questions'],
ADD COLUMN opinion_tendencies TEXT,
ADD COLUMN interests TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Phase 2: Create agent observations table for memory
CREATE TABLE agent_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  observation TEXT NOT NULL,
  confidence FLOAT DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_agent_observations_user ON agent_observations(user_id, agent_id);
CREATE INDEX idx_agent_observations_workspace ON agent_observations(workspace_id);

-- Enable RLS
ALTER TABLE agent_observations ENABLE ROW LEVEL SECURITY;

-- RLS policies for agent_observations
CREATE POLICY "Users can view observations about their own interactions"
  ON agent_observations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create observations"
  ON agent_observations FOR INSERT
  WITH CHECK (true);

-- Phase 3: Create user_agent_relationships table
CREATE TABLE user_agent_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  rapport_level INTEGER DEFAULT 0,
  shared_context JSONB DEFAULT '{"inside_jokes": [], "preferences": {}, "past_wins": [], "communication_style": "neutral"}'::jsonb,
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  interaction_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, agent_id)
);

-- Add index for faster lookups
CREATE INDEX idx_user_agent_relationships ON user_agent_relationships(user_id, agent_id);

-- Enable RLS
ALTER TABLE user_agent_relationships ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own agent relationships"
  ON user_agent_relationships FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent relationships"
  ON user_agent_relationships FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create agent relationships"
  ON user_agent_relationships FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE agent_observations IS 'Stores agent observations about user preferences and patterns';
COMMENT ON TABLE user_agent_relationships IS 'Tracks rapport and relationship context between users and agents';