ALTER TABLE public.tasks ADD COLUMN assigned_user_id uuid DEFAULT NULL;
ALTER TABLE public.tasks ADD COLUMN assigned_user_name text DEFAULT NULL;