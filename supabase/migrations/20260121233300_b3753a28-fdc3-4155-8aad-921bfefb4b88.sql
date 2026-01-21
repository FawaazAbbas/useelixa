-- Phase 1.1: Add encrypted columns and migration flag to user_credentials
ALTER TABLE public.user_credentials 
ADD COLUMN IF NOT EXISTS is_encrypted boolean DEFAULT false;

-- Phase 1.2: Tool-to-Scope mapping table for scope verification
CREATE TABLE IF NOT EXISTS public.tool_scope_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name text NOT NULL UNIQUE,
  credential_type text NOT NULL,
  required_scopes text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now()
);

-- RLS for tool_scope_requirements (read-only for all authenticated)
ALTER TABLE public.tool_scope_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tool scope requirements"
ON public.tool_scope_requirements FOR SELECT
TO authenticated
USING (true);

-- Allow service role full access
CREATE POLICY "Service role full access to tool_scope_requirements"
ON public.tool_scope_requirements FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Insert scope requirements for tools
INSERT INTO public.tool_scope_requirements (tool_name, credential_type, required_scopes) VALUES
-- Gmail tools (need at least one of these scopes)
('gmail_list_emails', 'googleOAuth2Api', ARRAY['https://www.googleapis.com/auth/gmail.readonly', 'https://www.googleapis.com/auth/gmail.modify']),
('gmail_send_email', 'googleOAuth2Api', ARRAY['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.modify']),
-- Calendar tools  
('calendar_list_events', 'googleOAuth2Api', ARRAY['https://www.googleapis.com/auth/calendar.readonly', 'https://www.googleapis.com/auth/calendar']),
('calendar_create_event', 'googleOAuth2Api', ARRAY['https://www.googleapis.com/auth/calendar']),
-- Stripe tools (API key based, credential type is 'stripe')
('stripe_get_balance', 'stripe', ARRAY[]::text[]),
('stripe_list_payments', 'stripe', ARRAY[]::text[]),
('stripe_list_customers', 'stripe', ARRAY[]::text[]),
('stripe_create_customer', 'stripe', ARRAY[]::text[]),
-- Shopify tools (credential type from integration)
('shopify_list_orders', 'shopify', ARRAY[]::text[]),
('shopify_list_products', 'shopify', ARRAY[]::text[]),
('shopify_get_analytics', 'shopify', ARRAY[]::text[]),
('shopify_create_product', 'shopify', ARRAY[]::text[]),
-- Notes tools (no external credential needed)
('notes_list', 'internal', ARRAY[]::text[]),
('notes_search', 'internal', ARRAY[]::text[]),
('notes_create', 'internal', ARRAY[]::text[]),
-- Task tools (no external credential needed)
('create_task', 'internal', ARRAY[]::text[]),
('list_tasks', 'internal', ARRAY[]::text[]),
-- Knowledge base (no external credential needed)
('search_knowledge_base', 'internal', ARRAY[]::text[]),
('search_knowledge', 'internal', ARRAY[]::text[])
ON CONFLICT (tool_name) DO UPDATE SET
  credential_type = EXCLUDED.credential_type,
  required_scopes = EXCLUDED.required_scopes;