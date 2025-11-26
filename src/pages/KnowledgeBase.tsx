import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Upload, Search, Plus, Trash2, FolderOpen, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkspaceDocument {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  folder: string;
  description: string | null;
  tags: string[];
  created_at: string;
}

export default function KnowledgeBase() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [isArticleDialogOpen, setIsArticleDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
  const [articleForm, setArticleForm] = useState({
    title: "",
    content: "",
    category: "",
    tags: ""
  });
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchKnowledge();
    }
  }, [workspaceId]);

  const fetchKnowledge = async () => {
    try {
      setLoading(true);
      
      // Fetch articles
      const { data: articlesData, error: articlesError } = await supabase
        .from("workspace_knowledge")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (articlesError) throw articlesError;
      setArticles(articlesData || []);

      // Fetch documents
      const { data: docsData, error: docsError } = await supabase
        .from("workspace_documents")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docsData || []);
    } catch (error: any) {
      console.error("Error fetching knowledge:", error);
      toast.error("Failed to load knowledge base");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async () => {
    if (!workspaceId || !user) return;

    try {
      const { error } = await supabase
        .from("workspace_knowledge")
        .insert({
          workspace_id: workspaceId,
          title: articleForm.title,
          content: articleForm.content,
          category: articleForm.category || null,
          tags: articleForm.tags.split(",").map(t => t.trim()).filter(Boolean),
          created_by: user.id
        });

      if (error) throw error;

      toast.success("Article created successfully");
      setIsArticleDialogOpen(false);
      setArticleForm({ title: "", content: "", category: "", tags: "" });
      fetchKnowledge();
    } catch (error: any) {
      console.error("Error creating article:", error);
      toast.error("Failed to create article");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !user || !event.target.files?.length) return;

    const file = event.target.files[0];
    setUploadingFile(true);

    try {
      // Upload to storage
      const filePath = `${workspaceId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("workspace-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create document record
      const { data: docData, error: insertError } = await supabase
        .from("workspace_documents")
        .insert({
          workspace_id: workspaceId,
          name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          folder: "root",
          uploaded_by: user.id
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Trigger text extraction in background
      supabase.functions.invoke('extract-document-text', {
        body: {
          documentId: docData.id,
          filePath: filePath,
          fileType: file.type
        }
      }).then(({ error: extractError }) => {
        if (extractError) {
          console.error('Background text extraction failed:', extractError);
        } else {
          console.log('Document text extraction started for:', file.name);
        }
      });

      toast.success("Document uploaded successfully");
      fetchKnowledge();
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setUploadingFile(false);
      event.target.value = "";
    }
  };

  const handleDeleteArticle = async (id: string) => {
    try {
      const { error } = await supabase
        .from("workspace_knowledge")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Article deleted");
      fetchKnowledge();
    } catch (error: any) {
      console.error("Error deleting article:", error);
      toast.error("Failed to delete article");
    }
  };

  const handleDeleteDocument = async (doc: WorkspaceDocument) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("workspace-files")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete record
      const { error: dbError } = await supabase
        .from("workspace_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast.success("Document deleted");
      fetchKnowledge();
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === "all" || doc.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const folders = ["all", ...Array.from(new Set(documents.map(d => d.folder)))];

  const hasContent = articles.length > 0 || documents.length > 0;

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 max-w-7xl overflow-y-auto h-full pb-20 md:pb-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Share context all agents can reference
        </p>
      </div>

      {/* Empty State */}
      {!hasContent && !loading && (
        <Card className="mb-6 border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-semibold mb-2">Build Your Knowledge Library</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add company info, processes, or guidelines. Every agent will have instant access to stay aligned.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setIsArticleDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Article
              </Button>
              <Button variant="outline" onClick={() => {
                document.getElementById('file-upload')?.click();
              }}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="mb-4 md:mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-auto">
          <TabsTrigger value="articles">Knowledge Articles</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {filteredArticles.length} article{filteredArticles.length !== 1 ? "s" : ""}
            </p>
            <Dialog open={isArticleDialogOpen} onOpenChange={setIsArticleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Article
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Knowledge Article</DialogTitle>
                  <DialogDescription>
                    Add a new article to your workspace knowledge base
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={articleForm.title}
                      onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                      placeholder="Article title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category (optional)</Label>
                    <Input
                      id="category"
                      value={articleForm.category}
                      onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                      placeholder="e.g., Processes, Policies, Technical"
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={articleForm.content}
                      onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                      placeholder="Article content..."
                      rows={8}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={articleForm.tags}
                      onChange={(e) => setArticleForm({ ...articleForm, tags: e.target.value })}
                      placeholder="e.g., onboarding, sales, technical"
                    />
                  </div>
                  <Button onClick={handleCreateArticle} className="w-full">
                    Create Article
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No articles match your search" : "No articles yet. Create one to start building your knowledge base!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {article.title}
                          {article.category && (
                            <Badge variant="secondary">{article.category}</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Updated {new Date(article.updated_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteArticle(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                      {article.content}
                    </p>
                    {article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-48">
                <FolderOpen className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder === "all" ? "All Folders" : folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <Input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploadingFile}
              />
              <Label htmlFor="file-upload">
                <Button asChild disabled={uploadingFile}>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingFile ? "Uploading..." : "Upload Document"}
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          <div className="grid gap-4">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No documents match your search" : "No documents yet. Upload files agents can reference!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredDocuments.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {doc.name}
                        </CardTitle>
                        <CardDescription>
                          {(doc.file_size / 1024).toFixed(2)} KB • {doc.folder} • 
                          Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDocument(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {doc.description && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{doc.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
