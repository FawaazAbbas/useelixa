
-- Create workspace_dms table for direct messages between workspace members
CREATE TABLE public.workspace_dms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_a UUID NOT NULL,
  user_b UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_dm_pair UNIQUE(workspace_id, user_a, user_b),
  CONSTRAINT user_a_less_than_user_b CHECK (user_a < user_b)
);

-- Create dm_messages table
CREATE TABLE public.dm_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dm_id UUID NOT NULL REFERENCES public.workspace_dms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add hierarchy columns to org_members
ALTER TABLE public.org_members ADD COLUMN reports_to UUID DEFAULT NULL;
ALTER TABLE public.org_members ADD COLUMN job_title TEXT DEFAULT NULL;

-- Enable RLS
ALTER TABLE public.workspace_dms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dm_messages ENABLE ROW LEVEL SECURITY;

-- RLS for workspace_dms: users can see DMs they're part of
CREATE POLICY "Users can view their DMs" ON public.workspace_dms
  FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE POLICY "Users can insert DMs" ON public.workspace_dms
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- RLS for dm_messages: users can see/insert messages in their DMs
CREATE POLICY "Users can view DM messages" ON public.dm_messages
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.workspace_dms d
    WHERE d.id = dm_id AND (d.user_a = auth.uid() OR d.user_b = auth.uid())
  ));

CREATE POLICY "Users can send DM messages" ON public.dm_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.workspace_dms d
      WHERE d.id = dm_id AND (d.user_a = auth.uid() OR d.user_b = auth.uid())
    )
  );

-- Enable realtime for dm_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.dm_messages;

-- Update join_workspace_by_code to auto-create DM threads
CREATE OR REPLACE FUNCTION public.join_workspace_by_code(p_code text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_workspace_id UUID;
  v_user_id UUID;
  v_existing_member UUID;
  v_a UUID;
  v_b UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO v_workspace_id FROM public.workspaces WHERE join_code = lower(trim(p_code));
  IF v_workspace_id IS NULL THEN
    RAISE EXCEPTION 'Invalid workspace code';
  END IF;

  -- Check if already a member
  IF EXISTS (SELECT 1 FROM public.workspace_members WHERE workspace_id = v_workspace_id AND user_id = v_user_id) THEN
    RETURN v_workspace_id;
  END IF;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, v_user_id, 'member');

  -- Auto-create DM threads with every existing member
  FOR v_existing_member IN
    SELECT user_id FROM public.workspace_members
    WHERE workspace_id = v_workspace_id AND user_id != v_user_id
  LOOP
    -- Normalize: user_a < user_b
    IF v_user_id < v_existing_member THEN
      v_a := v_user_id;
      v_b := v_existing_member;
    ELSE
      v_a := v_existing_member;
      v_b := v_user_id;
    END IF;

    INSERT INTO public.workspace_dms (workspace_id, user_a, user_b)
    VALUES (v_workspace_id, v_a, v_b)
    ON CONFLICT DO NOTHING;
  END LOOP;

  RETURN v_workspace_id;
END;
$function$;
