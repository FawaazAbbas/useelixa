import { useState } from "react";
import { BookOpen, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useKnowledgeBase, type WorkspaceDocument } from "@/hooks/useKnowledgeBase";
import { DocumentUploadZone } from "@/components/knowledge-base/DocumentUploadZone";
import { DocumentCard } from "@/components/knowledge-base/DocumentCard";
import { DocumentPreviewDialog } from "@/components/knowledge-base/DocumentPreviewDialog";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";

const KnowledgeBase = () => {
  const { documents, loading, uploading, uploadDocument, deleteDocument, getDocumentUrl } = useKnowledgeBase();
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDocument, setPreviewDocument] = useState<WorkspaceDocument | null>(null);

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpload = async (file: File) => {
    await uploadDocument(file);
  };

  return (
    <PageLayout
      title="Knowledge Base"
      icon={BookOpen}
      badge={documents.length > 0 ? `${documents.length} document${documents.length !== 1 ? "s" : ""}` : undefined}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Upload Zone */}
        <DocumentUploadZone onUpload={handleUpload} uploading={uploading} />

        {/* Search */}
        {documents.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        )}

        {/* Documents List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : filteredDocuments.length > 0 ? (
          <div className="grid gap-3">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onDelete={deleteDocument}
                onDownload={getDocumentUrl}
                onPreview={setPreviewDocument}
              />
            ))}
          </div>
        ) : documents.length > 0 ? (
          <PageEmptyState
            icon={Search}
            title="No documents match your search"
            description="Try adjusting your search query."
          />
        ) : (
          <PageEmptyState
            icon={FileText}
            title="No documents yet"
            description="Upload documents to build your knowledge base for AI assistance."
          />
        )}
      </div>

      {/* Preview Dialog */}
      <DocumentPreviewDialog
        document={previewDocument}
        open={!!previewDocument}
        onOpenChange={(open) => !open && setPreviewDocument(null)}
      />
    </PageLayout>
  );
};

export default KnowledgeBase;
