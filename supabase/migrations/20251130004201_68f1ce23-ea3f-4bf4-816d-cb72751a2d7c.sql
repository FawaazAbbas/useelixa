-- Add new columns to user_credentials for Google bundle support
ALTER TABLE user_credentials
ADD COLUMN IF NOT EXISTS bundle_type TEXT,
ADD COLUMN IF NOT EXISTS account_email TEXT,
ADD COLUMN IF NOT EXISTS account_label TEXT,
ADD COLUMN IF NOT EXISTS scopes TEXT[];

-- Drop existing unique constraint if it exists
ALTER TABLE user_credentials DROP CONSTRAINT IF EXISTS user_credentials_user_id_credential_type_key;

-- Create new unique constraint allowing multiple Google accounts per bundle
ALTER TABLE user_credentials
ADD CONSTRAINT user_credentials_unique_bundle 
UNIQUE (user_id, credential_type, bundle_type, account_email);

-- Create index for faster credential lookups by bundle
CREATE INDEX IF NOT EXISTS idx_user_credentials_bundle 
ON user_credentials(user_id, credential_type, bundle_type);