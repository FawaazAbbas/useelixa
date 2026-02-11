
-- Drop unnecessary service role policies (service role bypasses RLS)
DROP POLICY IF EXISTS "Service role full access to installations" ON public.agent_installations;
DROP POLICY IF EXISTS "Service role full access to proposals" ON public.agent_proposals;
