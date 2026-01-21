import { useState } from "react";
import { BookOpen, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useKnowledgeBase, type WorkspaceDocument } from "@/hooks/useKnowledgeBase";
import { DocumentUploadZone } from "@/components/knowledge-base/DocumentUploadZone";
import { DocumentCard } from "@/components/knowledge-base/DocumentCard";
import { DocumentPreviewDialog } from "@/components/knowledge-base/DocumentPreviewDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <header className="border-b bg-card/80 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Knowledge Base</h1>
          </div>
          <div className="text-sm text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
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
              <LoadingSpinner />
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
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No documents match your search.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-lg font-medium">No documents yet</p>
              <p className="text-muted-foreground mt-1">
                Upload documents to build your knowledge base for AI assistance.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Preview Dialog */}
      <DocumentPreviewDialog
        document={previewDocument}
        open={!!previewDocument}
        onOpenChange={(open) => !open && setPreviewDocument(null)}
      />
    </div>
  );
};

export default KnowledgeBase;
