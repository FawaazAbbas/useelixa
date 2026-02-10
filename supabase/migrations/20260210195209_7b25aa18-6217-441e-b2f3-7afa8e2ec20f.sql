
-- Add hosting-related columns to agent_submissions
ALTER TABLE public.agent_submissions
  ADD COLUMN IF NOT EXISTS hosting_type text NOT NULL DEFAULT 'platform',
  ADD COLUMN IF NOT EXISTS runtime text NOT NULL DEFAULT 'python',
  ADD COLUMN IF NOT EXISTS external_endpoint_url text,
  ADD COLUMN IF NOT EXISTS external_auth_header text,
  ADD COLUMN IF NOT EXISTS external_auth_token text,
  ADD COLUMN IF NOT EXISTS code_file_url text,
  ADD COLUMN IF NOT EXISTS requirements text,
  ADD COLUMN IF NOT EXISTS entry_function text DEFAULT 'handle';
