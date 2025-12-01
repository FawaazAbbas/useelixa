import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MockKnowledgeArticle } from "@/data/mockKnowledge";
import { Calendar, Eye, Copy, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const categoryColors: Record<string, string> = {
  "Company Policies": "border-l-blue-500",
  "Sales": "border-l-green-500",
  "Product": "border-l-purple-500",
  "Customer Support": "border-l-orange-500",
  "Engineering": "border-l-cyan-500",
  "HR": "border-l-pink-500",
  "Finance": "border-l-yellow-500",
  "Marketing": "border-l-red-500",
};

interface ArticleDetailDialogProps {
  article: MockKnowledgeArticle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArticleDetailDialog({ article, open, onOpenChange }: ArticleDetailDialogProps) {
  if (!article) return null;

  const categoryColor = article.category ? categoryColors[article.category] : "border-l-gray-500";

  const handleCopy = () => {
    navigator.clipboard.writeText(article.content);
    toast.success("Article copied to clipboard");
  };

  const handleEdit = () => {
    toast.info("Demo Mode", {
      description: "Editing is not available in demo mode",
    });
  };

  const handleDelete = () => {
    toast.info("Demo Mode", {
      description: "Deletion is not available in demo mode",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-w-4xl max-h-[85vh] overflow-y-auto border-l-4 ${categoryColor}`}>
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-3">{article.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {article.category && (
                  <Badge variant="secondary">{article.category}</Badge>
                )}
                {article.priority === "featured" && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    Featured
                  </Badge>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {format(new Date(article.updated_at), "MMM d, yyyy")}</span>
                </div>
                {article.views !== undefined && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{article.views} views</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="prose prose-sm max-w-none mt-6">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {article.tags.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold mb-3">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-accent">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
