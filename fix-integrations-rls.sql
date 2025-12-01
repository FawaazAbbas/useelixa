-- Run this SQL in your Supabase backend to fix the integrations table policies

CREATE POLICY integrations_select ON public.integrations 
FOR SELECT USING (true);

CREATE POLICY integrations_admin ON public.integrations 
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
