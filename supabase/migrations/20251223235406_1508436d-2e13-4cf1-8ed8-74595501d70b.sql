-- Create email templates table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_default BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Admin can manage templates
CREATE POLICY "Admins can manage email templates"
ON public.email_templates
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create index
CREATE INDEX idx_email_templates_name ON public.email_templates(name);