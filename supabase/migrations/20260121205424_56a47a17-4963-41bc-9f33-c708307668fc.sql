-- Create workspace_documents table for knowledge base
CREATE TABLE public.workspace_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  extracted_content TEXT,
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workspace_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can only access documents in their workspaces
CREATE POLICY "Users can view documents in their workspaces"
ON public.workspace_documents FOR SELECT
USING (
  workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can insert documents in their workspaces"
ON public.workspace_documents FOR INSERT
WITH CHECK (
  workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid())
  AND user_id = auth.uid()
);

CREATE POLICY "Users can update their own documents"
ON public.workspace_documents FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own documents"
ON public.workspace_documents FOR DELETE
USING (user_id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_workspace_documents_updated_at
  BEFORE UPDATE ON public.workspace_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for workspace files
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-files', 'workspace-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for workspace files
CREATE POLICY "Users can upload files to their workspace folders"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'workspace-files' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view files in their workspaces"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'workspace-files'
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own uploaded files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'workspace-files'
  AND auth.uid() IS NOT NULL
);