-- Allow authenticated users to create their own workspace
CREATE POLICY "Users can create their own workspace"
ON public.workspaces
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Allow users to view workspaces they own
CREATE POLICY "Users can view their own workspaces"
ON public.workspaces
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Allow users to create their own workspace membership
CREATE POLICY "Users can create their own membership"
ON public.workspace_members
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own memberships
CREATE POLICY "Users can view their own memberships"
ON public.workspace_members
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);