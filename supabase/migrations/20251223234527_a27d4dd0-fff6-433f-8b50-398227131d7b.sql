-- Add scheduling fields to email_campaigns
ALTER TABLE public.email_campaigns
ADD COLUMN scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN recurrence_pattern TEXT DEFAULT NULL,
ADD COLUMN audience_filter TEXT DEFAULT NULL,
ADD COLUMN last_recurring_run TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN next_recurring_run TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create index for scheduled campaigns
CREATE INDEX idx_email_campaigns_scheduled ON public.email_campaigns(scheduled_at) WHERE scheduled_at IS NOT NULL AND status = 'scheduled';
CREATE INDEX idx_email_campaigns_recurring ON public.email_campaigns(next_recurring_run) WHERE is_recurring = TRUE AND status = 'active';