-- Create admin audit log table for tracking configuration changes
CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add comment
COMMENT ON TABLE public.admin_audit_log IS 'Tracks admin configuration changes for governance and compliance';

-- Enable Row Level Security
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Org admins and owners can view audit logs
CREATE POLICY "Org admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (
  org_id IN (
    SELECT org_id FROM public.org_members 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'owner')
  )
);

-- Any authenticated org member can insert audit logs
CREATE POLICY "Org members can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (
  org_id IN (
    SELECT org_id FROM public.org_members 
    WHERE user_id = auth.uid()
  )
);

-- Create index for efficient querying
CREATE INDEX idx_admin_audit_log_org_created ON public.admin_audit_log(org_id, created_at DESC);
CREATE INDEX idx_admin_audit_log_action_type ON public.admin_audit_log(action_type);
CREATE INDEX idx_admin_audit_log_user_id ON public.admin_audit_log(user_id);