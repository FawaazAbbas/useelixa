import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText } from "lucide-react";
import type { WorkspaceDocument } from "@/hooks/useKnowledgeBase";

interface DocumentPreviewDialogProps {
  document: WorkspaceDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DocumentPreviewDialog = ({
  document,
  open,
  onOpenChange,
}: DocumentPreviewDialogProps) => {
  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.title}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] mt-4">
          <div className="pr-4">
            {document.extracted_content ? (
              <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg">
                {document.extracted_content}
              </pre>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No content available for preview.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
