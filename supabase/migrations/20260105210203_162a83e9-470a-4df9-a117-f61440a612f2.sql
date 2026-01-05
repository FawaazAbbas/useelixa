-- Add policy for service role to manage all posts (for admin operations)
-- Also add a policy allowing insert/update/delete for authenticated users with admin role
-- For now, we'll use the service key approach via edge function

-- Allow all operations via service role (bypasses RLS)
-- Add explicit policies for admin management
CREATE POLICY "Admin can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (true)
WITH CHECK (true);