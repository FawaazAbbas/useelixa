-- Add workflow JSON storage to agents table
ALTER TABLE agents ADD COLUMN workflow_json JSONB;
ALTER TABLE agents ADD COLUMN workflow_file_path TEXT;
ALTER TABLE agents ADD COLUMN is_workflow_based BOOLEAN DEFAULT false;

-- Create storage bucket for workflow files
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-workflows', 'agent-workflows', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for workflow files
CREATE POLICY "Publishers can upload workflows"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'agent-workflows' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Publishers can read own workflows"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'agent-workflows' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can read all workflows"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'agent-workflows' AND
  has_role(auth.uid(), 'admin'::app_role)
);