-- Add agent integration fields to agents table
ALTER TABLE public.agents 
ADD COLUMN webhook_url TEXT,
ADD COLUMN api_authentication_type TEXT DEFAULT 'none',
ADD COLUMN configuration_schema JSONB,
ADD COLUMN response_timeout INTEGER DEFAULT 30,
ADD COLUMN supported_features TEXT[] DEFAULT ARRAY['text'];

-- Add comment to explain authentication types
COMMENT ON COLUMN public.agents.api_authentication_type IS 'Authentication type: none, bearer, api_key, custom';

-- Create agent_configurations table for user-specific settings
CREATE TABLE public.agent_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_installation_id UUID NOT NULL REFERENCES public.agent_installations(id) ON DELETE CASCADE,
  configuration JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on agent_configurations
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_configurations
CREATE POLICY "Users can view own agent configurations"
ON public.agent_configurations
FOR SELECT
USING (
  agent_installation_id IN (
    SELECT id FROM public.agent_installations 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create own agent configurations"
ON public.agent_configurations
FOR INSERT
WITH CHECK (
  agent_installation_id IN (
    SELECT id FROM public.agent_installations 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own agent configurations"
ON public.agent_configurations
FOR UPDATE
USING (
  agent_installation_id IN (
    SELECT id FROM public.agent_installations 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own agent configurations"
ON public.agent_configurations
FOR DELETE
USING (
  agent_installation_id IN (
    SELECT id FROM public.agent_installations 
    WHERE user_id = auth.uid()
  )
);

-- Add trigger for updated_at on agent_configurations
CREATE TRIGGER update_agent_configurations_updated_at
BEFORE UPDATE ON public.agent_configurations
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Add messaging metadata fields to messages table
ALTER TABLE public.messages 
ADD COLUMN error_message TEXT,
ADD COLUMN processing_time_ms INTEGER,
ADD COLUMN response_metadata JSONB;

-- Create index for faster queries
CREATE INDEX idx_agent_configurations_installation_id 
ON public.agent_configurations(agent_installation_id);