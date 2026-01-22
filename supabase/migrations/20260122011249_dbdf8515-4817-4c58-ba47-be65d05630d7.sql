-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- Add embedding column to workspace_documents for semantic search
ALTER TABLE public.workspace_documents 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_workspace_documents_embedding 
ON public.workspace_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function for semantic document search
CREATE OR REPLACE FUNCTION public.match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  p_workspace_id uuid DEFAULT NULL
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
    wd.extracted_content as content,
    1 - (wd.embedding <=> query_embedding) as similarity
  FROM workspace_documents wd
  WHERE 
    wd.embedding IS NOT NULL
    AND (p_workspace_id IS NULL OR wd.workspace_id = p_workspace_id)
    AND 1 - (wd.embedding <=> query_embedding) > match_threshold
  ORDER BY wd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;