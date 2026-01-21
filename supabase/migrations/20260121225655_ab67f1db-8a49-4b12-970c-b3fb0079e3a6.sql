-- Enable pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to workspace_documents
ALTER TABLE workspace_documents 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Add assigned_to column to tasks for AI task runner
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assigned_to TEXT DEFAULT 'user';

-- Create usage_stats table for billing
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  ai_calls INTEGER DEFAULT 0,
  tool_executions INTEGER DEFAULT 0,
  documents_uploaded INTEGER DEFAULT 0,
  storage_bytes_used BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(org_id, month)
);

-- Enable RLS on usage_stats
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view org usage"
  ON usage_stats FOR SELECT
  USING (is_org_member(org_id));

-- Create match_documents function for semantic search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_workspace_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wd.id,
    wd.title,
    wd.extracted_content,
    1 - (wd.embedding <=> query_embedding) AS similarity
  FROM workspace_documents wd
  WHERE wd.workspace_id = p_workspace_id
    AND wd.embedding IS NOT NULL
    AND 1 - (wd.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;