import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, FileSpreadsheet, FileImage, Film, Archive, Code, Presentation } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    name: string;
    type: string;
    size: number;
    url?: string;
  } | null;
  uploadedBy?: string;
  uploadedAt?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const getFileIcon = (type: string) => {
  if (type.includes('pdf')) return <FileText className="h-12 w-12 text-red-500" />;
  if (type.includes('spreadsheet') || type.includes('csv') || type.includes('xlsx')) return <FileSpreadsheet className="h-12 w-12 text-green-500" />;
  if (type.includes('image') || type.includes('png') || type.includes('jpg')) return <FileImage className="h-12 w-12 text-blue-500" />;
  if (type.includes('video') || type.includes('mp4')) return <Film className="h-12 w-12 text-purple-500" />;
  if (type.includes('zip') || type.includes('archive')) return <Archive className="h-12 w-12 text-yellow-500" />;
  if (type.includes('html') || type.includes('json')) return <Code className="h-12 w-12 text-cyan-500" />;
  if (type.includes('presentation') || type.includes('pptx')) return <Presentation className="h-12 w-12 text-orange-500" />;
  return <FileText className="h-12 w-12 text-muted-foreground" />;
};

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toUpperCase() || 'FILE';
};

export function FilePreviewDialog({ open, onOpenChange, file, uploadedBy, uploadedAt }: FilePreviewDialogProps) {
  const { toast } = useToast();

  if (!file) return null;

  const handleDownload = () => {
    toast({
      title: "Demo Mode",
      description: `Download started for "${file.name}" - this is simulated in demo mode.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">File Preview</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Icon & Name */}
          <div className="flex flex-col items-center gap-4 p-6 bg-muted/40 rounded-xl border border-border/50">
            <div className="p-4 bg-background rounded-xl shadow-sm">
              {getFileIcon(file.type)}
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-sm break-all">{file.name}</p>
              <Badge variant="secondary" className="text-xs">
                {getFileExtension(file.name)}
              </Badge>
            </div>
          </div>

          {/* File Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Size</span>
              <span className="text-sm font-medium">{formatFileSize(file.size)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="text-sm font-medium">{getFileExtension(file.name)} File</span>
            </div>
            {uploadedBy && (
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Uploaded by</span>
                <span className="text-sm font-medium">{uploadedBy}</span>
              </div>
            )}
            {uploadedAt && (
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="text-sm font-medium">
                  {format(new Date(uploadedAt), "d MMM yyyy, h:mm a")}
                </span>
              </div>
            )}
          </div>

          {/* Download Button */}
          <Button onClick={handleDownload} className="w-full gap-2">
            <Download className="h-4 w-4" />
            Download File
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
