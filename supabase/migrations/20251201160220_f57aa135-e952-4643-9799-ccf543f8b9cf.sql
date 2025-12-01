CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_type TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  logo_url TEXT NOT NULL,
  company_name TEXT NOT NULL,
  is_google_bundle BOOLEAN DEFAULT false,
  bundle_type TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_integrations_credential_type ON public.integrations(credential_type);
CREATE INDEX idx_integrations_category ON public.integrations(category);
CREATE INDEX idx_integrations_is_google_bundle ON public.integrations(is_google_bundle);