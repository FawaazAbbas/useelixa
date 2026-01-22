-- Add missing encryption columns to user_credentials table
ALTER TABLE public.user_credentials 
ADD COLUMN IF NOT EXISTS encrypted_access_token TEXT,
ADD COLUMN IF NOT EXISTS encrypted_refresh_token TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.user_credentials.encrypted_access_token IS 'AES-256-GCM encrypted access token';
COMMENT ON COLUMN public.user_credentials.encrypted_refresh_token IS 'AES-256-GCM encrypted refresh token';