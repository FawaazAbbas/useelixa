-- Add AI governance controls to org_settings
ALTER TABLE public.org_settings
ADD COLUMN IF NOT EXISTS ai_paused boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_approved_tools text[] DEFAULT '{}';

-- Add comment explaining the fields
COMMENT ON COLUMN public.org_settings.ai_paused IS 'When true, AI assistant is disabled for the organization';
COMMENT ON COLUMN public.org_settings.auto_approved_tools IS 'List of tool names that skip human confirmation';