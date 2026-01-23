-- Add is_pinned column to chat_sessions_v2 table
ALTER TABLE public.chat_sessions_v2 
ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;

-- Add index for efficient querying of pinned chats
CREATE INDEX idx_chat_sessions_v2_is_pinned ON public.chat_sessions_v2(user_id, is_pinned, updated_at DESC);