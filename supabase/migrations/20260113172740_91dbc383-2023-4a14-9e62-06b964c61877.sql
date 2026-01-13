-- Add a CHECK constraint to ensure waitlist_position never goes below 1
ALTER TABLE public.waitlist_signups
ADD CONSTRAINT waitlist_position_min_check CHECK (waitlist_position >= 1);