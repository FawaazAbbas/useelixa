-- Enable RLS on integrations table
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view integrations (public catalog data)
CREATE POLICY "Anyone can view integrations"
ON public.integrations
FOR SELECT
USING (true);

-- Only admins can manage integrations
CREATE POLICY "Admins can manage integrations"
ON public.integrations
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));