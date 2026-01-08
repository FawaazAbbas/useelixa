-- Add increment_invites_sent function (missing from previous implementation)
CREATE OR REPLACE FUNCTION public.increment_invites_sent(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE waitlist_signups 
  SET invites_sent = COALESCE(invites_sent, 0) + 1
  WHERE email = user_email;
END;
$$;

-- Add rate limiting table for invite emails
CREATE TABLE IF NOT EXISTS public.invite_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_email, invitee_email)
);

-- Add index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_invite_rate_limits_user_date 
ON public.invite_rate_limits (user_email, sent_at);

-- Enable RLS on rate limits table
ALTER TABLE public.invite_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow edge functions to manage rate limits (via service role)
CREATE POLICY "Service role can manage rate limits"
ON public.invite_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to check daily invite limit (max 10 per day)
CREATE OR REPLACE FUNCTION public.check_invite_rate_limit(sender_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  daily_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO daily_count
  FROM invite_rate_limits
  WHERE user_email = sender_email
    AND sent_at > NOW() - INTERVAL '24 hours';
  
  RETURN daily_count < 10;
END;
$$;

-- Function to check if invite was already sent to this email
CREATE OR REPLACE FUNCTION public.check_duplicate_invite(sender_email text, recipient_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM invite_rate_limits 
    WHERE user_email = sender_email AND invitee_email = recipient_email
  );
END;
$$;

-- Function to record an invite (for rate limiting)
CREATE OR REPLACE FUNCTION public.record_invite(sender_email text, recipient_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO invite_rate_limits (user_email, invitee_email)
  VALUES (sender_email, recipient_email)
  ON CONFLICT (user_email, invitee_email) DO UPDATE SET sent_at = NOW();
END;
$$;