import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useWorkspace } from "./useWorkspace";
import { toast } from "sonner";

export interface WorkspaceDocument {
  id: string;
  workspace_id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_type: string;
  file_size: number;
  extracted_content: string | null;
  status: "processing" | "ready" | "failed";
  created_at: string;
  updated_at: string;
}

export const useKnowledgeBase = () => {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const { data, error } = await supabase
        .from("workspace_documents")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments((data as WorkspaceDocument[]) || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadDocument = async (file: File) => {
    if (!user || !workspaceId) {
      toast.error("Please select a workspace first");
      return null;
    }

    setUploading(true);
    try {
      // Generate unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${workspaceId}/${Date.now()}-${file.name}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("workspace-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: docError } = await supabase
        .from("workspace_documents")
        .insert({
          workspace_id: workspaceId,
          user_id: user.id,
          title: file.name,
          file_path: fileName,
          file_type: file.type || `application/${fileExt}`,
          file_size: file.size,
          status: "processing",
        })
        .select()
        .single();

      if (docError) throw docError;

      toast.success("Document uploaded successfully");
      
      // Trigger text extraction
      extractDocumentContent(docData.id, fileName, file.type || `application/${fileExt}`);
      
      // Refresh documents list
      fetchDocuments();
      
      return docData;
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const extractDocumentContent = async (documentId: string, filePath: string, fileType: string) => {
    try {
      const { error } = await supabase.functions.invoke("extract-document-text", {
        body: { documentId, filePath, fileType },
      });

      if (error) {
        console.error("Extraction error:", error);
        // Update document status to failed
        await supabase
          .from("workspace_documents")
          .update({ status: "failed" })
          .eq("id", documentId);
      } else {
        // Update document status to ready
        await supabase
          .from("workspace_documents")
          .update({ status: "ready" })
          .eq("id", documentId);
      }
      
      // Refresh documents
      fetchDocuments();
    } catch (error) {
      console.error("Error extracting content:", error);
    }
  };

  const deleteDocument = async (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (!doc) return false;

    try {
      // Delete from storage
      await supabase.storage
        .from("workspace-files")
        .remove([doc.file_path]);

      // Delete from database
      const { error } = await supabase
        .from("workspace_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;

      toast.success("Document deleted");
      fetchDocuments();
      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
      return false;
    }
  };

  const getDocumentUrl = async (filePath: string) => {
    const { data } = await supabase.storage
      .from("workspace-files")
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return data?.signedUrl || null;
  };

  return {
    documents,
    loading,
    uploading,
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
    refetch: fetchDocuments,
  };
};
