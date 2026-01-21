-- Drop the incorrect unique constraint on credential_type
ALTER TABLE public.integrations DROP CONSTRAINT IF EXISTS integrations_credential_type_key;