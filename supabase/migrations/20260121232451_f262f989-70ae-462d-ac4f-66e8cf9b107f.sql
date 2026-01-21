-- Fix remaining overly permissive RLS policies

-- 1. Drop old tool_execution_log policy that wasn't removed
DROP POLICY IF EXISTS "Service role can insert logs" ON public.tool_execution_log;

-- 2. Fix blog_posts admin policy to use proper role check via has_role function
DROP POLICY IF EXISTS "Admin can manage all blog posts" ON public.blog_posts;

-- Create proper admin policy using has_role function
CREATE POLICY "Admins can manage all blog posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Note: contact_submissions WITH CHECK (true) is intentional for public contact form
-- Note: integrations USING (true) for SELECT is acceptable (public catalog)