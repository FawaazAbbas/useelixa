-- Update the auto_generate_referral_code function to use sequential waitlist positions starting at 7000
CREATE OR REPLACE FUNCTION public.auto_generate_referral_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  max_position INTEGER;
BEGIN
  -- Generate referral code if not provided
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  
  -- Get the current maximum waitlist position, default to 6999 if no entries exist (so first user gets 7000)
  IF NEW.waitlist_position IS NULL THEN
    SELECT COALESCE(MAX(waitlist_position), 6999) INTO max_position FROM waitlist_signups;
    NEW.waitlist_position := max_position + 1;
  END IF;
  
  -- Also create entry in referral_codes table
  INSERT INTO referral_codes (code, user_email, max_uses, reward_type)
  VALUES (NEW.referral_code, NEW.email, 3, '3_free_agents')
  ON CONFLICT (code) DO NOTHING;
  
  RETURN NEW;
END;
$function$;

-- Update the process_referral_signup function to ensure waitlist_position is always an integer
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
      
      -- Update referrer's referral count and halve their waitlist position (ensure it's an integer)
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