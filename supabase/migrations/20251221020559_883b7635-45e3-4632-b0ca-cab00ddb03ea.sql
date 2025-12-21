-- Allow admins to update waitlist signups
CREATE POLICY "Admins can update waitlist signups"
ON public.waitlist_signups
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete waitlist signups
CREATE POLICY "Admins can delete waitlist signups"
ON public.waitlist_signups
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update developer applications
CREATE POLICY "Admins can update developer applications"
ON public.developer_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete developer applications
CREATE POLICY "Admins can delete developer applications"
ON public.developer_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));