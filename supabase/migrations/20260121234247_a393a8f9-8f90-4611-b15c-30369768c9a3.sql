-- Create conversation_summaries table for AI memory
CREATE TABLE public.conversation_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES chat_sessions_v2(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  key_topics TEXT[] DEFAULT '{}',
  embedding vector(1536),
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX idx_conversation_summaries_embedding ON public.conversation_summaries 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for user lookups
CREATE INDEX idx_conversation_summaries_user_id ON public.conversation_summaries(user_id);

-- Enable RLS
ALTER TABLE public.conversation_summaries ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own summaries"
ON public.conversation_summaries FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own summaries"
ON public.conversation_summaries FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries"
ON public.conversation_summaries FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries"
ON public.conversation_summaries FOR DELETE
USING (auth.uid() = user_id);

-- Function to search similar conversation memories
CREATE OR REPLACE FUNCTION match_conversation_memories(
  query_embedding vector(1536),
  match_user_id UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  session_id UUID,
  summary TEXT,
  key_topics TEXT[],
  similarity FLOAT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.id,
    cs.session_id,
    cs.summary,
    cs.key_topics,
    1 - (cs.embedding <=> query_embedding) AS similarity,
    cs.created_at
  FROM conversation_summaries cs
  WHERE cs.user_id = match_user_id
    AND cs.embedding IS NOT NULL
    AND 1 - (cs.embedding <=> query_embedding) > match_threshold
  ORDER BY cs.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;