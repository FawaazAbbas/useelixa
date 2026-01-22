-- Allow storing encrypted tokens by making access_token nullable
ALTER TABLE public.user_credentials
  ALTER COLUMN access_token DROP NOT NULL;

-- Ensure we always store *some* access token (plaintext or encrypted)
CREATE OR REPLACE FUNCTION public.validate_user_credentials_tokens()
RETURNS TRIGGER AS $$
BEGIN
  IF COALESCE(NEW.is_encrypted, false) THEN
    IF NEW.encrypted_access_token IS NULL THEN
      RAISE EXCEPTION 'encrypted_access_token is required when is_encrypted = true';
    END IF;
  ELSE
    IF NEW.access_token IS NULL THEN
      RAISE EXCEPTION 'access_token is required when is_encrypted = false';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_validate_user_credentials_tokens ON public.user_credentials;
CREATE TRIGGER trg_validate_user_credentials_tokens
BEFORE INSERT OR UPDATE ON public.user_credentials
FOR EACH ROW EXECUTE FUNCTION public.validate_user_credentials_tokens();