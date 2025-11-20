-- Create security definer function to check if user is a chat participant
CREATE OR REPLACE FUNCTION public.is_chat_participant(_user_id uuid, _chat_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE user_id = _user_id
    AND chat_id = _chat_id
  );
$$;

-- Fix the recursive RLS policy on chat_participants
DROP POLICY IF EXISTS "Users can view chat participants" ON public.chat_participants;

CREATE POLICY "Users can view chat participants"
ON public.chat_participants
FOR SELECT
USING (
  user_id = auth.uid() OR
  is_chat_participant(auth.uid(), chat_id)
);

-- Fix messages policies to use the new function
DROP POLICY IF EXISTS "Users can view messages in their chats" ON public.messages;

CREATE POLICY "Users can view messages in their chats"
ON public.messages
FOR SELECT
USING (
  is_chat_participant(auth.uid(), chat_id)
);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  is_chat_participant(auth.uid(), chat_id)
);