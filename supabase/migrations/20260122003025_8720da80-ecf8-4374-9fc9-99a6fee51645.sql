-- Create org_settings table for AI behavior preferences
CREATE TABLE IF NOT EXISTS public.org_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  -- AI Behavior Preferences
  ai_auto_approve_read BOOLEAN NOT NULL DEFAULT true,
  ai_auto_approve_write BOOLEAN NOT NULL DEFAULT false,
  ai_response_style TEXT NOT NULL DEFAULT 'balanced' CHECK (ai_response_style IN ('concise', 'balanced', 'detailed')),
  ai_allowed_tools TEXT[] NOT NULL DEFAULT ARRAY['search_knowledge_base', 'list_calendar_events', 'create_note', 'create_subtask'],
  ai_restricted_tools TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  -- General settings
  require_approval_for_external BOOLEAN NOT NULL DEFAULT true,
  max_ai_calls_per_day INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id)
);

-- Enable RLS
ALTER TABLE public.org_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their org settings"
  ON public.org_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = org_settings.org_id
      AND org_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Org owners and admins can update settings"
  ON public.org_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = org_settings.org_id
      AND org_members.user_id = auth.uid()
      AND org_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Org owners can insert settings"
  ON public.org_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.org_members
      WHERE org_members.org_id = org_settings.org_id
      AND org_members.user_id = auth.uid()
      AND org_members.role = 'owner'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_org_settings_updated_at
  BEFORE UPDATE ON public.org_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();