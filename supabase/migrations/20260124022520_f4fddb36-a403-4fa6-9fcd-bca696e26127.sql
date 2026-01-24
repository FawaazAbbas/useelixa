-- Phase 1.1: Add tier management columns to orgs table
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS plan_started_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS connector_limit INTEGER DEFAULT 2;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS has_premium_models BOOLEAN DEFAULT false;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS monthly_credits INTEGER DEFAULT 100;
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS is_unlimited BOOLEAN DEFAULT false;

-- Update existing orgs to be on trial with 14 day period (if currently on free plan)
UPDATE orgs 
SET trial_ends_at = now() + interval '14 days',
    plan = 'trial',
    plan_started_at = now()
WHERE plan = 'free' OR plan IS NULL;

-- Phase 1.2: Create credit_pricing table for dynamic pricing config
CREATE TABLE IF NOT EXISTS credit_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  price_per_credit_pence INTEGER NOT NULL DEFAULT 6, -- £0.06 = 6 pence
  min_credits INTEGER NOT NULL DEFAULT 100,
  credit_increment INTEGER NOT NULL DEFAULT 100,
  max_credits INTEGER NOT NULL DEFAULT 10000,
  currency TEXT NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default pricing configuration
INSERT INTO credit_pricing (price_per_credit_pence, min_credits, credit_increment, max_credits, currency)
VALUES (6, 100, 100, 10000, 'GBP')
ON CONFLICT DO NOTHING;

-- RLS for credit_pricing - anyone can read pricing info
ALTER TABLE credit_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read credit pricing" ON credit_pricing FOR SELECT USING (true);

-- Add updated_at trigger for credit_pricing
CREATE TRIGGER update_credit_pricing_updated_at
BEFORE UPDATE ON credit_pricing
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();