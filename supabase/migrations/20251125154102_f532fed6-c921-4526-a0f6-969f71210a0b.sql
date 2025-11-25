-- Add agent_id column to automations table
ALTER TABLE automations 
ADD COLUMN agent_id uuid REFERENCES agents(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_automations_agent_id ON automations(agent_id);

-- Add comment for documentation
COMMENT ON COLUMN automations.agent_id IS 'The AI agent responsible for executing this automation';