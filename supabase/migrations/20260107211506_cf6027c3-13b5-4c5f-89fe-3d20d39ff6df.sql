-- Drop the trigger that references non-existent outreach_contacts table
DROP TRIGGER IF EXISTS on_waitlist_signup_check_outreach ON public.waitlist_signups;

-- Drop the associated function
DROP FUNCTION IF EXISTS check_outreach_on_waitlist_signup();