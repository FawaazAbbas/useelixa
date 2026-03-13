
-- Add join_code column to workspaces
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE;

-- Function to generate readable word-based join codes
CREATE OR REPLACE FUNCTION public.generate_workspace_join_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  adjectives TEXT[] := ARRAY[
    'swift','brave','calm','dark','eager','fair','glad','happy','keen','lush',
    'mild','neat','proud','quick','rare','safe','tall','vast','warm','wise',
    'bold','cool','deep','fast','gold','iron','jade','kind','long','nova',
    'open','pale','rich','silk','true','ultra','vivid','wild','zen','amber',
    'azure','coral','crisp','dusk','ember','frost','glow','haze','ivory','lunar'
  ];
  nouns TEXT[] := ARRAY[
    'falcon','river','storm','maple','cedar','brook','cliff','crane','delta','eagle',
    'flame','grove','haven','isle','jewel','lake','mesa','north','oak','peak',
    'reef','sage','tide','vale','wave','birch','coral','dawn','elm','fern',
    'glade','hawk','iris','lark','moon','nest','orca','pine','quail','ridge',
    'star','thorn','umber','vine','wren','aspen','bloom','crest','drift','finch'
  ];
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := adjectives[1 + floor(random() * array_length(adjectives, 1))::int]
      || '-'
      || nouns[1 + floor(random() * array_length(nouns, 1))::int]
      || '-'
      || (10 + floor(random() * 90))::int::text;
    
    SELECT EXISTS(SELECT 1 FROM public.workspaces WHERE join_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Backfill existing workspaces with join codes
UPDATE public.workspaces SET join_code = public.generate_workspace_join_code() WHERE join_code IS NULL;

-- Make join_code NOT NULL after backfill
ALTER TABLE public.workspaces ALTER COLUMN join_code SET NOT NULL;
ALTER TABLE public.workspaces ALTER COLUMN join_code SET DEFAULT public.generate_workspace_join_code();

-- RPC: Join a workspace by code
CREATE OR REPLACE FUNCTION public.join_workspace_by_code(p_code TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_workspace_id UUID;
  v_user_id UUID;
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

  RETURN v_workspace_id;
END;
$$;

-- RPC: Create a workspace with auto-generated join code
CREATE OR REPLACE FUNCTION public.create_workspace_with_code(p_name TEXT, p_description TEXT DEFAULT '')
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_workspace_id UUID;
  v_join_code TEXT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.workspaces (name, description, owner_id)
  VALUES (p_name, COALESCE(p_description, ''), v_user_id)
  RETURNING id, join_code INTO v_workspace_id, v_join_code;

  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, v_user_id, 'owner');

  RETURN json_build_object('workspace_id', v_workspace_id, 'join_code', v_join_code);
END;
$$;

-- RPC: Regenerate workspace join code (owner/admin only)
CREATE OR REPLACE FUNCTION public.regenerate_workspace_join_code(p_workspace_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_new_code TEXT;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Check user is owner or admin
  IF NOT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id AND user_id = v_user_id AND role IN ('owner', 'admin')
  ) THEN
    RAISE EXCEPTION 'Only workspace owners or admins can regenerate codes';
  END IF;

  v_new_code := public.generate_workspace_join_code();
  UPDATE public.workspaces SET join_code = v_new_code WHERE id = p_workspace_id;
  RETURN v_new_code;
END;
$$;

-- Update handle_new_user: remove workspace creation, keep profile + org
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id uuid;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name, avatar_url, phone, company_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create default organization for the user
  INSERT INTO public.orgs (name)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)) || '''s Organization'
  )
  RETURNING id INTO new_org_id;
  
  -- Add user as org owner
  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (new_org_id, NEW.id, 'owner');
  
  RETURN NEW;
END;
$function$;
