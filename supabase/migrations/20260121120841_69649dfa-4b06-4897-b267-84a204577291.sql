
-- Create org role enum
CREATE TYPE org_role AS ENUM ('owner', 'admin', 'member');

-- Create integration status enum for org_integrations
CREATE TYPE integration_status AS ENUM ('connected', 'disconnected', 'error');

-- 1) orgs table
CREATE TABLE public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) org_members table (composite PK)
CREATE TABLE public.org_members (
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role org_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id)
);

-- Index for looking up orgs by user
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id);

-- 3) Update integrations table - add missing columns if needed (global catalog)
ALTER TABLE public.integrations 
  ADD COLUMN IF NOT EXISTS credential_type TEXT NOT NULL DEFAULT 'oauth';

-- Ensure slug is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_slug ON public.integrations(slug);

-- 4) org_integrations table
CREATE TABLE public.org_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
  status integration_status NOT NULL DEFAULT 'disconnected',
  external_account_id TEXT,
  scopes TEXT[] DEFAULT '{}',
  credential_id UUID,
  connected_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, integration_id, external_account_id)
);

-- Indexes for org_integrations
CREATE INDEX idx_org_integrations_org_integration ON public.org_integrations(org_id, integration_id);
CREATE INDEX idx_org_integrations_org_status ON public.org_integrations(org_id, status);

-- 5) credentials table (metadata only, actual secrets in vault)
CREATE TABLE public.credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  vault_ref TEXT,
  encrypted_blob_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  rotated_at TIMESTAMPTZ
);

CREATE INDEX idx_credentials_org_id ON public.credentials(org_id);

-- Update org_integrations FK to credentials
ALTER TABLE public.org_integrations 
  ADD CONSTRAINT fk_org_integrations_credential 
  FOREIGN KEY (credential_id) REFERENCES public.credentials(id) ON DELETE SET NULL;

-- 6) Update mcp_tokens to be org-based
ALTER TABLE public.mcp_tokens 
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS scopes TEXT[] DEFAULT '{}';

-- Ensure token_hash is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_mcp_tokens_token_hash ON public.mcp_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_mcp_tokens_org_revoked ON public.mcp_tokens(org_id, revoked_at);

-- 7) Update tool_calls to be org-based
ALTER TABLE public.tool_calls
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS actor_user_id UUID,
  ADD COLUMN IF NOT EXISTS actor_token_id UUID REFERENCES public.mcp_tokens(id),
  ADD COLUMN IF NOT EXISTS latency_ms INTEGER;

-- Rename execution_time_ms to latency_ms if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'tool_calls' AND column_name = 'execution_time_ms') THEN
    ALTER TABLE public.tool_calls RENAME COLUMN execution_time_ms TO latency_ms;
  END IF;
EXCEPTION WHEN duplicate_column THEN
  -- Column already exists, ignore
END $$;

-- Indexes for tool_calls (partition-ready)
CREATE INDEX IF NOT EXISTS idx_tool_calls_org_created ON public.tool_calls(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_calls_org_tool_created ON public.tool_calls(org_id, tool_name, created_at DESC);

-- Helper function for RLS
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = _org_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Helper to check if user is org admin or owner
CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = _org_id 
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Enable RLS on all tenant tables
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orgs
CREATE POLICY "Users can view orgs they belong to"
  ON public.orgs FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "Only owners can update org"
  ON public.orgs FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.org_members
    WHERE org_id = orgs.id AND user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Authenticated users can create orgs"
  ON public.orgs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for org_members
CREATE POLICY "Members can view org members"
  ON public.org_members FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can add members"
  ON public.org_members FOR INSERT
  WITH CHECK (is_org_admin(org_id) OR (
    -- Allow creating self as owner when creating new org
    user_id = auth.uid() AND role = 'owner'
  ));

CREATE POLICY "Admins can update members"
  ON public.org_members FOR UPDATE
  USING (is_org_admin(org_id));

CREATE POLICY "Admins can remove members"
  ON public.org_members FOR DELETE
  USING (is_org_admin(org_id) OR user_id = auth.uid());

-- RLS Policies for org_integrations
CREATE POLICY "Members can view org integrations"
  ON public.org_integrations FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can manage org integrations"
  ON public.org_integrations FOR ALL
  USING (is_org_admin(org_id));

-- RLS Policies for credentials (read-only for admins, writes via edge functions)
CREATE POLICY "Admins can view credentials metadata"
  ON public.credentials FOR SELECT
  USING (is_org_admin(org_id));

-- No INSERT/UPDATE/DELETE policies for credentials - managed by edge functions with service role

-- Update mcp_tokens RLS to be org-based
DROP POLICY IF EXISTS "Users can view own tokens" ON public.mcp_tokens;
DROP POLICY IF EXISTS "Users can create own tokens" ON public.mcp_tokens;
DROP POLICY IF EXISTS "Users can update own tokens" ON public.mcp_tokens;
DROP POLICY IF EXISTS "Users can delete own tokens" ON public.mcp_tokens;

CREATE POLICY "Members can view org tokens"
  ON public.mcp_tokens FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Admins can manage org tokens"
  ON public.mcp_tokens FOR ALL
  USING (is_org_admin(org_id));

-- Update tool_calls RLS to be org-based
DROP POLICY IF EXISTS "Users can view own tool calls" ON public.tool_calls;
DROP POLICY IF EXISTS "System can create tool calls" ON public.tool_calls;

CREATE POLICY "Members can view org tool calls"
  ON public.tool_calls FOR SELECT
  USING (is_org_member(org_id));

-- No client INSERT policy - writes via edge functions with service role

-- Create trigger to update updated_at on org_integrations
CREATE OR REPLACE FUNCTION public.update_org_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_org_integrations_timestamp
  BEFORE UPDATE ON public.org_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_org_integrations_updated_at();
