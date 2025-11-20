-- Create chat_agents junction table for many-to-many relationship
CREATE TABLE public.chat_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  added_by UUID REFERENCES auth.users(id),
  UNIQUE(chat_id, agent_id)
);

-- Migrate existing chat-agent relationships
INSERT INTO public.chat_agents (chat_id, agent_id, added_by)
SELECT id, agent_id, created_by
FROM public.chats
WHERE agent_id IS NOT NULL;

-- Enable RLS on chat_agents
ALTER TABLE public.chat_agents ENABLE ROW LEVEL SECURITY;

-- Participants can view agents in their chats
CREATE POLICY "Users can view agents in their chats"
ON public.chat_agents
FOR SELECT
USING (
  is_chat_participant(auth.uid(), chat_id)
);

-- Participants can add agents to chats
CREATE POLICY "Users can add agents to chats"
ON public.chat_agents
FOR INSERT
WITH CHECK (
  is_chat_participant(auth.uid(), chat_id) AND
  auth.uid() = added_by
);

-- Participants can remove agents from chats
CREATE POLICY "Users can remove agents from chats"
ON public.chat_agents
FOR DELETE
USING (
  is_chat_participant(auth.uid(), chat_id)
);

-- Create index for performance
CREATE INDEX idx_chat_agents_chat_id ON public.chat_agents(chat_id);
CREATE INDEX idx_chat_agents_agent_id ON public.chat_agents(agent_id);