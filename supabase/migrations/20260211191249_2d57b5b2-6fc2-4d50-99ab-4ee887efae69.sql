
CREATE TABLE public.agent_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agent_submissions(id) ON DELETE CASCADE,
  action_name text NOT NULL,
  path text NOT NULL,
  method text NOT NULL DEFAULT 'POST',
  description text,
  request_schema jsonb,
  response_schema jsonb,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Developers can manage own agent actions" ON public.agent_actions
  FOR ALL USING (
    agent_id IN (
      SELECT as2.id FROM agent_submissions as2
      JOIN developer_profiles dp ON dp.id = as2.developer_id
      WHERE dp.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all agent actions" ON public.agent_actions
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view approved agent actions" ON public.agent_actions
  FOR SELECT USING (
    agent_id IN (
      SELECT id FROM agent_submissions
      WHERE status = 'approved' AND is_public = true
    )
  );
