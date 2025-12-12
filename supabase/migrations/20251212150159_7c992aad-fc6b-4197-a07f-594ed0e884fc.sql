-- Create table for invitee/referral emails
CREATE TABLE public.waitlist_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  waitlist_signup_id UUID REFERENCES public.waitlist_signups(id) ON DELETE CASCADE,
  invitee_email TEXT NOT NULL,
  inviter_email TEXT NOT NULL,
  inviter_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.waitlist_invites ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert invites (public form)
CREATE POLICY "Anyone can submit invites"
ON public.waitlist_invites
FOR INSERT
WITH CHECK (true);

-- Only admins can view invites
CREATE POLICY "Admins can view invites"
ON public.waitlist_invites
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));