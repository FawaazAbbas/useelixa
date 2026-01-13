-- Add waitlist_position column to waitlist_signups
ALTER TABLE public.waitlist_signups 
ADD COLUMN IF NOT EXISTS waitlist_position INTEGER;

-- Backfill existing signups with random positions between 5000-10000
UPDATE public.waitlist_signups 
SET waitlist_position = floor(random() * 5001 + 5000)::INTEGER
WHERE waitlist_position IS NULL;

-- Update auto_generate_referral_code to include position generation
CREATE OR REPLACE FUNCTION public.auto_generate_referral_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Generate referral code if not provided
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  
  -- Generate random waitlist position between 5000 and 10000
  IF NEW.waitlist_position IS NULL THEN
    NEW.waitlist_position := floor(random() * 5001 + 5000)::INTEGER;
  END IF;
  
  -- Also create entry in referral_codes table
  INSERT INTO referral_codes (code, user_email, max_uses, reward_type)
  VALUES (NEW.referral_code, NEW.email, 3, '3_free_agents')
  ON CONFLICT (code) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Update process_referral_signup to halve position and track milestones
CREATE OR REPLACE FUNCTION public.process_referral_signup()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  referrer_signup RECORD;
  referrer_code RECORD;
  new_referral_count INTEGER;
BEGIN
  -- Only process if there's a referred_by_code
  IF NEW.referred_by_code IS NOT NULL THEN
    -- Find the referrer's signup record
    SELECT * INTO referrer_signup 
    FROM waitlist_signups 
    WHERE referral_code = NEW.referred_by_code;
    
    IF referrer_signup IS NOT NULL THEN
      -- Calculate new referral count
      new_referral_count := referrer_signup.referral_count + 1;
      
      -- Update referrer's referral count and halve their waitlist position
      UPDATE waitlist_signups 
      SET referral_count = new_referral_count,
          reward_unlocked = CASE WHEN new_referral_count >= 3 THEN TRUE ELSE reward_unlocked END,
          waitlist_position = GREATEST(1, FLOOR(waitlist_position / 2)::INTEGER)
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
$function$;