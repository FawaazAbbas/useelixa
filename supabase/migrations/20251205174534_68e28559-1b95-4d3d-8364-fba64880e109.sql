-- Create waitlist_signups table for users joining the waiting list
CREATE TABLE public.waitlist_signups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  use_case TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create developer_applications table for developers who want to work with Elixa
CREATE TABLE public.developer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  portfolio_url TEXT,
  experience_level TEXT,
  skills TEXT[],
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.developer_applications ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (no auth required for signups)
CREATE POLICY "Anyone can submit to waitlist"
ON public.waitlist_signups
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can submit developer application"
ON public.developer_applications
FOR INSERT
WITH CHECK (true);

-- Only admins can view submissions
CREATE POLICY "Admins can view waitlist signups"
ON public.waitlist_signups
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view developer applications"
ON public.developer_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));