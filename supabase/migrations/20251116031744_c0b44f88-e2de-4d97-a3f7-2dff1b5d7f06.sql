-- Create storage bucket for agent images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'agent-images',
  'agent-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for agent images
CREATE POLICY "Anyone can view agent images"
ON storage.objects FOR SELECT
USING (bucket_id = 'agent-images');

CREATE POLICY "Authenticated users can upload agent images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agent-images' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can update their own agent images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'agent-images'
  AND auth.uid() IS NOT NULL
);

-- Update handle_new_user to create default workspace
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_workspace_id uuid;
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
  
  RETURN NEW;
END;
$$;