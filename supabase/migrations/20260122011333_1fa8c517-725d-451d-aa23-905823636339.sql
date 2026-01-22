-- Add parent_message_id for threaded conversations
ALTER TABLE public.chat_messages_v2
ADD COLUMN IF NOT EXISTS parent_message_id uuid REFERENCES public.chat_messages_v2(id) ON DELETE CASCADE;

-- Add mentions array to track mentioned users
ALTER TABLE public.chat_messages_v2
ADD COLUMN IF NOT EXISTS mentions uuid[] DEFAULT '{}';

-- Create index for finding thread replies
CREATE INDEX IF NOT EXISTS idx_chat_messages_parent 
ON public.chat_messages_v2 (parent_message_id) 
WHERE parent_message_id IS NOT NULL;

-- Create index for finding messages mentioning a user
CREATE INDEX IF NOT EXISTS idx_chat_messages_mentions 
ON public.chat_messages_v2 USING GIN (mentions);

-- Add thread_count to track number of replies (denormalized for performance)
ALTER TABLE public.chat_messages_v2
ADD COLUMN IF NOT EXISTS thread_count int DEFAULT 0;