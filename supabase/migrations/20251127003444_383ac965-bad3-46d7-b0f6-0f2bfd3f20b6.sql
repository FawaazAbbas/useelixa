-- Add role column to chat_participants for permission controls
ALTER TABLE public.chat_participants
ADD COLUMN IF NOT EXISTS role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member'));

-- Update RLS policy to allow users to delete their own messages OR agent messages in their chats
DROP POLICY IF EXISTS "Users can delete own messages" ON public.messages;
CREATE POLICY "Users can delete messages in their chats"
ON public.messages FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (is_chat_participant(auth.uid(), chat_id) AND user_id IS NULL)
);