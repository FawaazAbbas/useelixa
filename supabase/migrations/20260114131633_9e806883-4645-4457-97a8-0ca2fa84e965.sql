-- Update default value for source column to 'EW' (Elixa Website)
ALTER TABLE waitlist_signups ALTER COLUMN source SET DEFAULT 'EW';

-- Update existing 'website' entries to 'EW'
UPDATE waitlist_signups SET source = 'EW' WHERE source = 'website' OR source IS NULL;