-- Add credits columns to usage_stats table
ALTER TABLE usage_stats 
ADD COLUMN IF NOT EXISTS credits_used integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS credits_purchased integer DEFAULT 1000;

-- Add selected_model column to chat_sessions_v2
ALTER TABLE chat_sessions_v2 
ADD COLUMN IF NOT EXISTS selected_model text DEFAULT 'google/gemini-2.5-flash';

-- Create credit_packages table for purchasable credit bundles
CREATE TABLE IF NOT EXISTS credit_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  credits integer NOT NULL,
  price_cents integer NOT NULL,
  popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on credit_packages
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read credit packages (they're public pricing info)
CREATE POLICY "Credit packages are publicly readable"
ON credit_packages FOR SELECT
USING (true);

-- Insert default credit packages
INSERT INTO credit_packages (name, credits, price_cents, popular) VALUES
  ('Starter', 500, 499, false),
  ('Standard', 2000, 1499, true),
  ('Pro', 5000, 2999, false),
  ('Enterprise', 15000, 6999, false)
ON CONFLICT DO NOTHING;

-- Add comment for documentation
COMMENT ON COLUMN usage_stats.credits_used IS 'Total credits consumed by AI model usage';
COMMENT ON COLUMN usage_stats.credits_purchased IS 'Total credits purchased/allocated (default 1000 for free tier)';
COMMENT ON COLUMN chat_sessions_v2.selected_model IS 'AI model selected for this chat session';