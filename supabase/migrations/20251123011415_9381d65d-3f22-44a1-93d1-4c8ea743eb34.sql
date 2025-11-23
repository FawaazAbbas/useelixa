-- Add workspace_id to agent_installations table
ALTER TABLE public.agent_installations
ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id);

-- Backfill workspace_id for existing installations
UPDATE public.agent_installations ai
SET workspace_id = (
  SELECT wm.workspace_id
  FROM public.workspace_members wm
  WHERE wm.user_id = ai.user_id
  LIMIT 1
)
WHERE workspace_id IS NULL;

-- Make workspace_id required going forward
ALTER TABLE public.agent_installations
ALTER COLUMN workspace_id SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_agent_installations_workspace_id 
ON public.agent_installations(workspace_id);