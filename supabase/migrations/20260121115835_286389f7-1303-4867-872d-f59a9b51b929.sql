-- Add missing columns to existing integrations table
ALTER TABLE public.integrations 
ADD COLUMN IF NOT EXISTS slug text UNIQUE,
ADD COLUMN IF NOT EXISTS auth_type text DEFAULT 'oauth' CHECK (auth_type IN ('oauth', 'api_key', 'webhook')),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'live' CHECK (status IN ('live', 'beta', 'coming_soon'));

-- Update existing rows to have slugs based on name
UPDATE public.integrations 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '_', 'g'))
WHERE slug IS NULL;

-- Make slug NOT NULL after populating
ALTER TABLE public.integrations ALTER COLUMN slug SET NOT NULL;

-- Create user_integrations table
CREATE TABLE IF NOT EXISTS public.user_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  integration_id uuid NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  connected boolean DEFAULT false,
  connected_at timestamp with time zone,
  metadata jsonb DEFAULT '{}'::jsonb,
  token_ref text,
  last_tested_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, integration_id)
);

-- Enable RLS on user_integrations
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_integrations
CREATE POLICY "Users can view own integrations" ON public.user_integrations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own integrations" ON public.user_integrations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations" ON public.user_integrations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations" ON public.user_integrations
  FOR DELETE USING (auth.uid() = user_id);

-- Create mcp_tokens table
CREATE TABLE IF NOT EXISTS public.mcp_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  token_hash text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  last_used_at timestamp with time zone,
  revoked_at timestamp with time zone
);

-- Enable RLS on mcp_tokens
ALTER TABLE public.mcp_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies for mcp_tokens
CREATE POLICY "Users can view own tokens" ON public.mcp_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tokens" ON public.mcp_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens" ON public.mcp_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tokens" ON public.mcp_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- Create tool_calls table for logging
CREATE TABLE IF NOT EXISTS public.tool_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  integration_slug text NOT NULL,
  tool_name text NOT NULL,
  input jsonb DEFAULT '{}'::jsonb,
  output jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'error')),
  error_message text,
  execution_time_ms integer,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on tool_calls
ALTER TABLE public.tool_calls ENABLE ROW LEVEL SECURITY;

-- RLS policies for tool_calls
CREATE POLICY "Users can view own tool calls" ON public.tool_calls
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create tool calls" ON public.tool_calls
  FOR INSERT WITH CHECK (true);

-- Enable realtime for user_integrations
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_integrations;