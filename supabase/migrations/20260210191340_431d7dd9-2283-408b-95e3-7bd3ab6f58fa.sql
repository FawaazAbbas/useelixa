
-- 1. Add 'developer' to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'developer';

-- 2. Create developer_profiles table
CREATE TABLE public.developer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  company_name text,
  website text,
  developer_bio text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.developer_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create agent_submissions table
CREATE TABLE public.agent_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id uuid NOT NULL REFERENCES public.developer_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text,
  version text DEFAULT '1.0.0',
  system_prompt text,
  allowed_tools text[],
  icon_url text,
  config_file_url text,
  status text NOT NULL DEFAULT 'draft',
  review_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  download_count integer NOT NULL DEFAULT 0,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_submissions ENABLE ROW LEVEL SECURITY;

-- 4. Triggers for updated_at
CREATE TRIGGER update_developer_profiles_updated_at
  BEFORE UPDATE ON public.developer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_submissions_updated_at
  BEFORE UPDATE ON public.agent_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Trigger to auto-create developer_profiles when developer role is assigned
CREATE OR REPLACE FUNCTION public.handle_developer_role_assigned()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'developer' THEN
    INSERT INTO public.developer_profiles (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_developer_role_assigned
  AFTER INSERT ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.handle_developer_role_assigned();

-- 6. RLS Policies for developer_profiles
CREATE POLICY "Developers can view own profile"
  ON public.developer_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Developers can update own profile"
  ON public.developer_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all developer profiles"
  ON public.developer_profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 7. RLS Policies for agent_submissions
CREATE POLICY "Developers can view own submissions"
  ON public.agent_submissions FOR SELECT
  TO authenticated
  USING (developer_id IN (SELECT id FROM public.developer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Developers can insert own submissions"
  ON public.agent_submissions FOR INSERT
  TO authenticated
  WITH CHECK (developer_id IN (SELECT id FROM public.developer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Developers can update own submissions"
  ON public.agent_submissions FOR UPDATE
  TO authenticated
  USING (developer_id IN (SELECT id FROM public.developer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Developers can delete own submissions"
  ON public.agent_submissions FOR DELETE
  TO authenticated
  USING (developer_id IN (SELECT id FROM public.developer_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can view all submissions"
  ON public.agent_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all submissions"
  ON public.agent_submissions FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view approved public agents"
  ON public.agent_submissions FOR SELECT
  USING (status = 'approved' AND is_public = true);

-- 8. Storage bucket for agent assets
INSERT INTO storage.buckets (id, name, public) VALUES ('agent-assets', 'agent-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload agent assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'agent-assets');

CREATE POLICY "Anyone can view agent assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'agent-assets');

CREATE POLICY "Users can update own agent assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'agent-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own agent assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'agent-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
