-- Create workspace_knowledge table for text articles
CREATE TABLE public.workspace_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  search_vector tsvector
);

-- Create index for full-text search
CREATE INDEX idx_workspace_knowledge_search ON public.workspace_knowledge USING GIN(search_vector);
CREATE INDEX idx_workspace_knowledge_workspace ON public.workspace_knowledge(workspace_id);

-- Create workspace_documents table for uploaded files
CREATE TABLE public.workspace_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  folder TEXT DEFAULT 'root',
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create indexes
CREATE INDEX idx_workspace_documents_workspace ON public.workspace_documents(workspace_id);
CREATE INDEX idx_workspace_documents_folder ON public.workspace_documents(workspace_id, folder);

-- Enable RLS
ALTER TABLE public.workspace_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspace_knowledge
CREATE POLICY "Workspace members can view knowledge"
  ON public.workspace_knowledge
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create knowledge"
  ON public.workspace_knowledge
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Workspace members can update knowledge"
  ON public.workspace_knowledge
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete knowledge"
  ON public.workspace_knowledge
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for workspace_documents
CREATE POLICY "Workspace members can view documents"
  ON public.workspace_documents
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can upload documents"
  ON public.workspace_documents
  FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    ) AND uploaded_by = auth.uid()
  );

CREATE POLICY "Workspace members can update documents"
  ON public.workspace_documents
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete documents"
  ON public.workspace_documents
  FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

-- Function to update search vector
CREATE OR REPLACE FUNCTION public.update_knowledge_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.content, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.tags, ' '), '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain search vector
CREATE TRIGGER workspace_knowledge_search_vector_update
  BEFORE INSERT OR UPDATE ON public.workspace_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.update_knowledge_search_vector();

-- Add triggers for updated_at
CREATE TRIGGER update_workspace_knowledge_updated_at
  BEFORE UPDATE ON public.workspace_knowledge
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_workspace_documents_updated_at
  BEFORE UPDATE ON public.workspace_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for workspace files
INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-files', 'workspace-files', false);

-- Storage RLS policies
CREATE POLICY "Workspace members can view files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'workspace-files' AND
    (storage.foldername(name))[1] IN (
      SELECT workspace_id::text FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can upload files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'workspace-files' AND
    (storage.foldername(name))[1] IN (
      SELECT workspace_id::text FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can update files"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'workspace-files' AND
    (storage.foldername(name))[1] IN (
      SELECT workspace_id::text FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can delete files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'workspace-files' AND
    (storage.foldername(name))[1] IN (
      SELECT workspace_id::text FROM public.workspace_members 
      WHERE user_id = auth.uid()
    )
  );