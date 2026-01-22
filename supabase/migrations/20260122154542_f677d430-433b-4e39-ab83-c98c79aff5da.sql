-- Fix: set immutable search_path on validation function
CREATE OR REPLACE FUNCTION public.validate_user_credentials_tokens()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;