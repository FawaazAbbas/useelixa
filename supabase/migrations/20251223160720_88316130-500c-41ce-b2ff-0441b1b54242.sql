-- Create outreach_contacts table for email marketing
CREATE TABLE public.outreach_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  company TEXT,
  source TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  last_contacted_at TIMESTAMPTZ,
  email_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick email lookup
CREATE INDEX idx_outreach_email ON public.outreach_contacts(email);

-- Enable RLS
ALTER TABLE public.outreach_contacts ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admin only access outreach" ON public.outreach_contacts
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create email_campaigns table
CREATE TABLE public.email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  recipient_count INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admin only access campaigns" ON public.email_campaigns
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Create email_sends table to track individual sends
CREATE TABLE public.email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.email_campaigns(id) ON DELETE CASCADE,
  outreach_contact_id UUID REFERENCES public.outreach_contacts(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;

-- Admin-only access policy
CREATE POLICY "Admin only access email_sends" ON public.email_sends
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Trigger function to check if waitlist signup was from outreach
CREATE OR REPLACE FUNCTION public.check_outreach_on_waitlist_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.outreach_contacts 
  SET status = 'converted', updated_at = NOW()
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$;

-- Create trigger on waitlist_signups
CREATE TRIGGER on_waitlist_signup_check_outreach
AFTER INSERT ON public.waitlist_signups
FOR EACH ROW EXECUTE FUNCTION public.check_outreach_on_waitlist_signup();

-- Updated_at trigger for outreach_contacts
CREATE TRIGGER update_outreach_contacts_updated_at
BEFORE UPDATE ON public.outreach_contacts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();