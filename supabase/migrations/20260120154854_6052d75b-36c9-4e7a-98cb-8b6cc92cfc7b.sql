-- Create a table for individual chat sessions
CREATE TABLE public.chat_sessions_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for messages within each chat session
CREATE TABLE public.chat_messages_v2 (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions_v2(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_sessions_v2 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages_v2 ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_sessions_v2
CREATE POLICY "Users can view their own chat sessions" 
ON public.chat_sessions_v2 FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions" 
ON public.chat_sessions_v2 FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions" 
ON public.chat_sessions_v2 FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions" 
ON public.chat_sessions_v2 FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for chat_messages_v2
CREATE POLICY "Users can view messages in their sessions" 
ON public.chat_messages_v2 FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.chat_sessions_v2 
  WHERE id = chat_messages_v2.session_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their sessions" 
ON public.chat_messages_v2 FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.chat_sessions_v2 
  WHERE id = chat_messages_v2.session_id AND user_id = auth.uid()
));

CREATE POLICY "Users can delete messages in their sessions" 
ON public.chat_messages_v2 FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.chat_sessions_v2 
  WHERE id = chat_messages_v2.session_id AND user_id = auth.uid()
));

-- Create trigger for updating updated_at
CREATE TRIGGER update_chat_sessions_v2_updated_at
BEFORE UPDATE ON public.chat_sessions_v2
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for faster queries
CREATE INDEX idx_chat_sessions_v2_user_id ON public.chat_sessions_v2(user_id);
CREATE INDEX idx_chat_messages_v2_session_id ON public.chat_messages_v2(session_id);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_sessions_v2;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages_v2;