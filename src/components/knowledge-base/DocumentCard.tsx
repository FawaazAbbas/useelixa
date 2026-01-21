import { useState } from "react";
import { FileText, File, FileSpreadsheet, Trash2, Download, Eye, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { WorkspaceDocument } from "@/hooks/useKnowledgeBase";

interface DocumentCardProps {
  document: WorkspaceDocument;
  onDelete: (id: string) => Promise<boolean>;
  onDownload: (filePath: string) => Promise<string | null>;
  onPreview?: (document: WorkspaceDocument) => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.includes("pdf")) return FileText;
  if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("csv")) return FileSpreadsheet;
  return File;
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const DocumentCard = ({ document, onDelete, onDownload, onPreview }: DocumentCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const FileIcon = getFileIcon(document.file_type);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(document.id);
    setIsDeleting(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const url = await onDownload(document.file_path);
    if (url) {
      window.open(url, "_blank");
    }
    setIsDownloading(false);
  };

  const statusIcon = {
    processing: <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />,
    ready: <CheckCircle className="h-4 w-4 text-primary" />,
    failed: <XCircle className="h-4 w-4 text-destructive" />,
  };

  const statusText = {
    processing: "Processing...",
    ready: "Ready",
    failed: "Failed",
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <FileIcon className="h-5 w-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate" title={document.title}>
              {document.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{formatFileSize(document.file_size)}</span>
              <span>•</span>
              <span>{formatDate(document.created_at)}</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              {statusIcon[document.status]}
              <span className={cn(
                "text-xs",
                document.status === "ready" && "text-primary",
                document.status === "failed" && "text-destructive",
                document.status === "processing" && "text-muted-foreground"
              )}>
                {statusText[document.status]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onPreview && document.status === "ready" && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onPreview(document)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Document</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{document.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
