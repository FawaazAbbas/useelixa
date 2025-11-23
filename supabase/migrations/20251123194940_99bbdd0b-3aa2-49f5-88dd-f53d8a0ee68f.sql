-- Add extracted_content column to workspace_documents
ALTER TABLE workspace_documents
ADD COLUMN extracted_content text;

-- Add index for better search performance on extracted content
CREATE INDEX idx_workspace_documents_extracted_content 
ON workspace_documents USING gin(to_tsvector('english', extracted_content))
WHERE extracted_content IS NOT NULL;