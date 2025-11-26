-- Create workspace-level agent memories table
CREATE TABLE IF NOT EXISTS public.workspace_agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  agent_installation_id UUID REFERENCES public.agent_installations(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'work_style', 'preferences', 'goals', 'context', 'custom'
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE(workspace_id, agent_installation_id, category, key)
);

-- Create chat-specific agent memories table
CREATE TABLE IF NOT EXISTS public.chat_agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  agent_installation_id UUID REFERENCES public.agent_installations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  UNIQUE(chat_id, agent_installation_id, category, key)
);

-- Enable RLS
ALTER TABLE public.workspace_agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_agent_memories ENABLE ROW LEVEL SECURITY;

-- RLS policies for workspace_agent_memories
CREATE POLICY "Workspace members can view workspace memories"
  ON public.workspace_agent_memories FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create workspace memories"
  ON public.workspace_agent_memories FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Workspace members can update workspace memories"
  ON public.workspace_agent_memories FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete workspace memories"
  ON public.workspace_agent_memories FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- RLS policies for chat_agent_memories
CREATE POLICY "Chat participants can view chat memories"
  ON public.chat_agent_memories FOR SELECT
  USING (is_chat_participant(auth.uid(), chat_id));

CREATE POLICY "Chat participants can create chat memories"
  ON public.chat_agent_memories FOR INSERT
  WITH CHECK (
    is_chat_participant(auth.uid(), chat_id) AND created_by = auth.uid()
  );

CREATE POLICY "Chat participants can update chat memories"
  ON public.chat_agent_memories FOR UPDATE
  USING (is_chat_participant(auth.uid(), chat_id));

CREATE POLICY "Chat participants can delete chat memories"
  ON public.chat_agent_memories FOR DELETE
  USING (is_chat_participant(auth.uid(), chat_id));

-- Create indexes for performance
CREATE INDEX idx_workspace_agent_memories_workspace ON public.workspace_agent_memories(workspace_id);
CREATE INDEX idx_workspace_agent_memories_agent ON public.workspace_agent_memories(agent_installation_id);
CREATE INDEX idx_chat_agent_memories_chat ON public.chat_agent_memories(chat_id);
CREATE INDEX idx_chat_agent_memories_agent ON public.chat_agent_memories(agent_installation_id);

-- Add trigger for updated_at
CREATE TRIGGER update_workspace_agent_memories_updated_at
  BEFORE UPDATE ON public.workspace_agent_memories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_chat_agent_memories_updated_at
  BEFORE UPDATE ON public.chat_agent_memories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();