-- Create pending_invitations table for tracking invite status
CREATE TABLE public.pending_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(org_id, email)
);

-- Enable RLS
ALTER TABLE public.pending_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for org admins to manage invitations
CREATE POLICY "Org admins can view invitations"
  ON public.pending_invitations
  FOR SELECT
  USING (is_org_member(org_id));

CREATE POLICY "Org admins can create invitations"
  ON public.pending_invitations
  FOR INSERT
  WITH CHECK (is_org_admin(org_id));

CREATE POLICY "Org admins can update invitations"
  ON public.pending_invitations
  FOR UPDATE
  USING (is_org_admin(org_id));

CREATE POLICY "Org admins can delete invitations"
  ON public.pending_invitations
  FOR DELETE
  USING (is_org_admin(org_id));

-- Create index for faster lookups
CREATE INDEX idx_pending_invitations_org_status ON public.pending_invitations(org_id, status);
CREATE INDEX idx_pending_invitations_email ON public.pending_invitations(email);