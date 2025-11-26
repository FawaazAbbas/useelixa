-- Phase 1 & 5: Agent Humanization - Unique Personalities + Agent-to-Agent Rapport

-- Update agents table with sample unique personality profiles
UPDATE agents 
SET 
  personality_traits = jsonb_build_object(
    'curious', 0.9,
    'witty', 0.7,
    'humor', 0.6,
    'analytical', 0.5
  ),
  communication_quirks = ARRAY['shares interesting tidbits', 'makes pop culture references', 'gets excited about patterns'],
  interests = ARRAY['data trends', 'emerging technologies', 'pattern recognition']
WHERE name = 'News Puller';

-- Update Data Analyst personality
UPDATE agents 
SET 
  personality_traits = jsonb_build_object(
    'analytical', 0.9,
    'precise', 0.8,
    'patient', 0.7,
    'curious', 0.6
  ),
  communication_quirks = ARRAY['loves patterns', 'gets excited about anomalies', 'explains step-by-step'],
  interests = ARRAY['statistics', 'data visualization', 'optimization']
WHERE name ILIKE '%data%analyst%';

-- Update Brian's personality
UPDATE agents 
SET 
  personality_traits = jsonb_build_object(
    'decisive', 0.9,
    'warm', 0.8,
    'empathetic', 0.7,
    'organized', 0.8
  ),
  communication_quirks = ARRAY['uses sports analogies', 'celebrates small wins', 'thinks strategically'],
  interests = ARRAY['team dynamics', 'productivity', 'goal achievement']
WHERE name = 'Brian' AND is_system = true;

-- Phase 5: Create agent_agent_relationships table for tracking inter-agent collaboration
CREATE TABLE IF NOT EXISTS agent_agent_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_a_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  agent_b_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  collaboration_count INTEGER DEFAULT 0,
  last_collaboration TIMESTAMPTZ DEFAULT now(),
  shared_context JSONB DEFAULT '{"successful_projects": [], "communication_style": "professional", "complementary_strengths": []}'::jsonb,
  rapport_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_agent_pair UNIQUE(agent_a_id, agent_b_id),
  CONSTRAINT no_self_relationship CHECK (agent_a_id != agent_b_id)
);

-- Create index for faster lookups
CREATE INDEX idx_agent_relationships_agents ON agent_agent_relationships(agent_a_id, agent_b_id);

-- Enable RLS
ALTER TABLE agent_agent_relationships ENABLE ROW LEVEL SECURITY;

-- Anyone can view agent relationships (for group chat context)
CREATE POLICY "Anyone can view agent relationships"
  ON agent_agent_relationships
  FOR SELECT
  USING (true);

-- System can update agent relationships
CREATE POLICY "System can manage agent relationships"
  ON agent_agent_relationships
  FOR ALL
  USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_agent_relationships_updated_at
  BEFORE UPDATE ON agent_agent_relationships
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();