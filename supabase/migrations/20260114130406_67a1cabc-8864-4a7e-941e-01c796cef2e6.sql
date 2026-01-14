-- Add source column to track where each waitlist signup originated
ALTER TABLE waitlist_signups 
ADD COLUMN IF NOT EXISTS source text DEFAULT 'website';

-- Add comment for documentation
COMMENT ON COLUMN waitlist_signups.source IS 'Origin of signup: website, facebook_lead, emailoctopus, admin_import';