-- Add new columns to waitlist_signups
ALTER TABLE public.waitlist_signups 
ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS invites_sent INTEGER DEFAULT 0;

-- Add new columns to referral_codes
ALTER TABLE public.referral_codes 
ADD COLUMN IF NOT EXISTS max_uses INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS reward_type TEXT DEFAULT '3_free_agents',
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add new columns to waitlist_invites
ALTER TABLE public.waitlist_invites 
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    
    -- Exit loop if unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to process referral signup and update counts
CREATE OR REPLACE FUNCTION public.process_referral_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referrer_signup RECORD;
  referrer_code RECORD;
BEGIN
  -- Only process if there's a referred_by_code
  IF NEW.referred_by_code IS NOT NULL THEN
    -- Find the referrer's signup record
    SELECT * INTO referrer_signup 
    FROM waitlist_signups 
    WHERE referral_code = NEW.referred_by_code;
    
    IF referrer_signup IS NOT NULL THEN
      -- Update referrer's referral count
      UPDATE waitlist_signups 
      SET referral_count = referral_count + 1,
          reward_unlocked = CASE WHEN referral_count + 1 >= 3 THEN TRUE ELSE reward_unlocked END
      WHERE id = referrer_signup.id;
      
      -- Update referral_codes uses_count
      UPDATE referral_codes 
      SET uses_count = uses_count + 1,
          is_redeemed = CASE WHEN uses_count + 1 >= max_uses THEN TRUE ELSE is_redeemed END
      WHERE code = NEW.referred_by_code;
      
      -- Update waitlist_invites if exists
      UPDATE waitlist_invites 
      SET status = 'converted',
          converted_at = NOW()
      WHERE invitee_email = NEW.email 
        AND inviter_email = referrer_signup.email;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for processing referral signups
DROP TRIGGER IF EXISTS trigger_process_referral_signup ON waitlist_signups;
CREATE TRIGGER trigger_process_referral_signup
  AFTER INSERT ON waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION process_referral_signup();

-- Function to get referral stats for a user
CREATE OR REPLACE FUNCTION public.get_referral_stats(user_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
  signup_record RECORD;
BEGIN
  SELECT * INTO signup_record 
  FROM waitlist_signups 
  WHERE email = user_email;
  
  IF signup_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT json_build_object(
    'referral_code', signup_record.referral_code,
    'referral_count', signup_record.referral_count,
    'invites_sent', signup_record.invites_sent,
    'reward_unlocked', signup_record.reward_unlocked,
    'invites', (
      SELECT json_agg(json_build_object(
        'email', invitee_email,
        'status', status,
        'created_at', created_at,
        'converted_at', converted_at
      ))
      FROM waitlist_invites
      WHERE inviter_email = user_email
    ),
    'referred_signups', (
      SELECT json_agg(json_build_object(
        'name', name,
        'email', email,
        'created_at', created_at
      ))
      FROM waitlist_signups
      WHERE referred_by_code = signup_record.referral_code
    )
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION public.get_referral_leaderboard(limit_count INTEGER DEFAULT 10)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(row_to_json(t))
  INTO result
  FROM (
    SELECT 
      name,
      referral_count,
      reward_unlocked,
      ROW_NUMBER() OVER (ORDER BY referral_count DESC, created_at ASC) as rank
    FROM waitlist_signups
    WHERE referral_count > 0
    ORDER BY referral_count DESC, created_at ASC
    LIMIT limit_count
  ) t;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Auto-generate referral code on waitlist signup
CREATE OR REPLACE FUNCTION public.auto_generate_referral_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Generate referral code if not provided
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  
  -- Also create entry in referral_codes table
  INSERT INTO referral_codes (code, user_email, max_uses, reward_type)
  VALUES (NEW.referral_code, NEW.email, 3, '3_free_agents')
  ON CONFLICT (code) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto-generating referral codes
DROP TRIGGER IF EXISTS trigger_auto_generate_referral_code ON waitlist_signups;
CREATE TRIGGER trigger_auto_generate_referral_code
  BEFORE INSERT ON waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_referral_code();