-- Add unique constraint on email to prevent duplicate waitlist signups
ALTER TABLE waitlist_signups ADD CONSTRAINT waitlist_signups_email_unique UNIQUE (email);