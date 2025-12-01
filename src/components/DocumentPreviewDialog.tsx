import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MockDocument } from "@/data/mockKnowledge";
import { Download, Trash2, Eye, Calendar, User, Folder } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface DocumentPreviewDialogProps {
  document: MockDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentPreviewDialog({ document, open, onOpenChange }: DocumentPreviewDialogProps) {
  if (!document) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    toast.info("Demo Mode", {
      description: "Download is not available in demo mode",
    });
  };

  const handlePreview = () => {
    toast.info("Demo Mode", {
      description: "Preview is not available in demo mode",
    });
  };

  const handleDelete = () => {
    toast.info("Demo Mode", {
      description: "Deletion is not available in demo mode",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-3">{document.name}</DialogTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <Badge variant="secondary">{formatFileSize(document.file_size)}</Badge>
                <div className="flex items-center gap-1">
                  <Folder className="h-4 w-4" />
                  <span>{document.folder}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {document.description && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{document.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground mb-1">Uploaded by</div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{document.uploaded_by}</span>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1">Created</div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(document.created_at), "MMM d, yyyy")}</span>
              </div>
            </div>
            {document.last_accessed && (
              <>
                <div>
                  <div className="text-muted-foreground mb-1">Last accessed</div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{format(new Date(document.last_accessed), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">File type</div>
                  <span>{document.file_type.split('/').pop()?.toUpperCase() || 'Unknown'}</span>
                </div>
              </>
            )}
          </div>

          {document.tags.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handlePreview} className="flex-1">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleDownload} variant="secondary" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button onClick={handleDelete} variant="outline">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
