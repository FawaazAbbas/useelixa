-- Add AI personality, instructions, and guard rails to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS ai_personality TEXT,
ADD COLUMN IF NOT EXISTS ai_instructions TEXT,
ADD COLUMN IF NOT EXISTS guard_rails JSONB DEFAULT '{"content_filter": true, "max_tokens": 2000, "allowed_topics": [], "blocked_topics": [], "tone": "professional", "refuse_harmful_requests": true}'::jsonb;