-- Phase 5: Add agent review/approval system
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

-- Add index for querying pending agents
CREATE INDEX IF NOT EXISTS idx_agents_review_status ON agents(review_status) WHERE review_status = 'pending';

COMMENT ON COLUMN agents.review_status IS 'Approval status for published agents';
COMMENT ON COLUMN agents.reviewer_notes IS 'Admin feedback on agent review';
COMMENT ON COLUMN agents.reviewed_at IS 'Timestamp when agent was reviewed';
COMMENT ON COLUMN agents.reviewed_by IS 'Admin user who reviewed the agent';