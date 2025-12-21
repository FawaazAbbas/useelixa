-- Add admin role for fawaaz.abbas@elixa.app
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'fawaaz.abbas@elixa.app'
ON CONFLICT (user_id, role) DO NOTHING;