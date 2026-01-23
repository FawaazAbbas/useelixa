-- Phase 2-4 Features: Memory, Folders, Reactions, Sharing

-- 1. User Memory table for persistent facts/preferences
CREATE TABLE IF NOT EXISTS public.user_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  category TEXT DEFAULT 'preference',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, memory_key)
);

-- Enable RLS
ALTER TABLE public.user_memories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own memories" 
  ON public.user_memories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memories" 
  ON public.user_memories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" 
  ON public.user_memories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" 
  ON public.user_memories FOR DELETE 
  USING (auth.uid() = user_id);

-- 2. Chat Folders table
CREATE TABLE IF NOT EXISTS public.chat_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT 'default',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own folders" 
  ON public.chat_folders FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Add folder_id to chat_sessions_v2
ALTER TABLE public.chat_sessions_v2 
  ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.chat_folders(id) ON DELETE SET NULL;

-- 4. Message Reactions/Feedback table
CREATE TABLE IF NOT EXISTS public.message_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages_v2(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction TEXT NOT NULL CHECK (reaction IN ('thumbs_up', 'thumbs_down')),
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id)
);

ALTER TABLE public.message_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own feedback" 
  ON public.message_feedback FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Shared Chats table for public sharing
CREATE TABLE IF NOT EXISTS public.shared_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions_v2(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own shared chats" 
  ON public.shared_chats FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for public access to shared chats (for viewing)
CREATE POLICY "Anyone can view public shared chats" 
  ON public.shared_chats FOR SELECT 
  USING (is_public = true AND (expires_at IS NULL OR expires_at > now()));

-- 6. Add suggested_prompts to chat messages metadata (no schema change needed, just metadata)

-- 7. Create index for folder lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_folder ON public.chat_sessions_v2(folder_id);
CREATE INDEX IF NOT EXISTS idx_message_feedback_message ON public.message_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_shared_chats_token ON public.shared_chats(share_token);
CREATE INDEX IF NOT EXISTS idx_user_memories_user ON public.user_memories(user_id);