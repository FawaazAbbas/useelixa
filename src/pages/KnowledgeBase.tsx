import { useState, useMemo } from "react";
import { BookOpen, Search, FileText, FileType, File } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useKnowledgeBase, type WorkspaceDocument } from "@/hooks/useKnowledgeBase";
import { DocumentUploadZone } from "@/components/knowledge-base/DocumentUploadZone";
import { DocumentCard } from "@/components/knowledge-base/DocumentCard";
import { DocumentPreviewDialog } from "@/components/knowledge-base/DocumentPreviewDialog";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";

type FilterType = "all" | "pdf" | "doc" | "other";

const KnowledgeBase = () => {
  const { documents, loading, uploading, uploadDocument, deleteDocument, getDocumentUrl } = useKnowledgeBase();
  const [searchQuery, setSearchQuery] = useState("");
  const [previewDocument, setPreviewDocument] = useState<WorkspaceDocument | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Calculate storage usage
  const totalStorageBytes = useMemo(() => {
    return documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
  }, [documents]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  // Filter documents by type and search
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Filter by type
    if (activeFilter === "pdf") {
      filtered = filtered.filter(doc => doc.file_type === "application/pdf");
    } else if (activeFilter === "doc") {
      filtered = filtered.filter(doc => 
        doc.file_type.includes("word") || 
        doc.file_type.includes("document") ||
        doc.file_type === "text/plain"
      );
    } else if (activeFilter === "other") {
      filtered = filtered.filter(doc => 
        !doc.file_type.includes("pdf") && 
        !doc.file_type.includes("word") && 
        !doc.file_type.includes("document") &&
        doc.file_type !== "text/plain"
      );
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(doc => doc.title.toLowerCase().includes(query));
    }

    return filtered;
  }, [documents, activeFilter, searchQuery]);

  // Count documents by type
  const typeCounts = useMemo(() => ({
    all: documents.length,
    pdf: documents.filter(d => d.file_type === "application/pdf").length,
    doc: documents.filter(d => d.file_type.includes("word") || d.file_type.includes("document") || d.file_type === "text/plain").length,
    other: documents.filter(d => !d.file_type.includes("pdf") && !d.file_type.includes("word") && !d.file_type.includes("document") && d.file_type !== "text/plain").length,
  }), [documents]);

  const handleUpload = async (file: File) => {
    await uploadDocument(file);
  };

  return (
    <PageLayout
      title="Knowledge Base"
      icon={BookOpen}
      badge={documents.length > 0 ? `${documents.length} document${documents.length !== 1 ? "s" : ""}` : undefined}
      actions={
        documents.length > 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileType className="h-4 w-4" />
            <span>{formatBytes(totalStorageBytes)} used</span>
          </div>
        ) : undefined
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Upload Zone */}
        <DocumentUploadZone onUpload={handleUpload} uploading={uploading} />

        {/* Filters and Search */}
        {documents.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterType)}>
              <TabsList>
                <TabsTrigger value="all" className="gap-1.5">
                  <File className="h-3.5 w-3.5" />
                  All
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">{typeCounts.all}</Badge>
                </TabsTrigger>
                <TabsTrigger value="pdf" className="gap-1.5">
                  PDFs
                  {typeCounts.pdf > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5">{typeCounts.pdf}</Badge>}
                </TabsTrigger>
                <TabsTrigger value="doc" className="gap-1.5">
                  Docs
                  {typeCounts.doc > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5">{typeCounts.doc}</Badge>}
                </TabsTrigger>
                {typeCounts.other > 0 && (
                  <TabsTrigger value="other" className="gap-1.5">
                    Other
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">{typeCounts.other}</Badge>
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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
            title="No documents match your filters"
            description="Try adjusting your search or filter criteria."
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
