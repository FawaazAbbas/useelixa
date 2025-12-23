-- Add audience column to outreach_contacts
ALTER TABLE public.outreach_contacts
ADD COLUMN audience text DEFAULT NULL;

-- Create index for faster audience filtering
CREATE INDEX idx_outreach_contacts_audience ON public.outreach_contacts(audience);