-- Allow authenticated users to insert their own developer role
CREATE POLICY "Users can assign developer role to themselves"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND role = 'developer');