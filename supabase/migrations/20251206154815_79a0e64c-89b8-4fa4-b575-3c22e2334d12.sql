-- Remove unused columns from developer_applications table
ALTER TABLE public.developer_applications 
DROP COLUMN IF EXISTS company,
DROP COLUMN IF EXISTS portfolio_url,
DROP COLUMN IF EXISTS experience_level;