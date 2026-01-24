-- Fix the handle_new_user function to remove the non-existent 'slug' column
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_workspace_id uuid;
  new_org_id uuid;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create default workspace
  INSERT INTO public.workspaces (name, description, owner_id)
  VALUES (
    'My Workspace',
    'Your personal workspace',
    NEW.id
  )
  RETURNING id INTO new_workspace_id;
  
  -- Add user as workspace member
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (new_workspace_id, NEW.id, 'owner');
  
  -- Create default organization for the user (removed slug column)
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
$$;