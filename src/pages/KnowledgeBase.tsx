import { useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockKnowledgeArticles, mockDocuments, MockKnowledgeArticle, MockDocument } from "@/data/mockKnowledge";
import { BookOpen, Search, FileText, Upload, Plus, Eye, Calendar, Folder, Download, Table, Presentation, File } from "lucide-react";
import { format } from "date-fns";
import { ArticleDetailDialog } from "@/components/ArticleDetailDialog";
import { DocumentPreviewDialog } from "@/components/DocumentPreviewDialog";
import { CreateArticleDialog } from "@/components/CreateArticleDialog";
import { UploadDocumentDialog } from "@/components/UploadDocumentDialog";

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

const fileTypeConfig: Record<string, { icon: typeof FileText; color: string; label: string }> = {
  "application/pdf": { icon: FileText, color: "border-l-red-500", label: "PDF" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: FileText, color: "border-l-blue-500", label: "Word" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { icon: Table, color: "border-l-green-500", label: "Excel" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { icon: Presentation, color: "border-l-orange-500", label: "PowerPoint" },
  "text/plain": { icon: File, color: "border-l-gray-500", label: "Text" },
  "text/csv": { icon: Table, color: "border-l-green-500", label: "CSV" },
};

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("updated");
  const [selectedArticle, setSelectedArticle] = useState<MockKnowledgeArticle | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<MockDocument | null>(null);
  const [showArticleDialog, setShowArticleDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showCreateArticle, setShowCreateArticle] = useState(false);
  const [showUploadDocument, setShowUploadDocument] = useState(false);

  const filteredArticles = mockKnowledgeArticles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "views") return (b.views || 0) - (a.views || 0);
    if (sortBy === "title") return a.title.localeCompare(b.title);
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === "all" || doc.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const folders = ["all", ...Array.from(new Set(mockDocuments.map((doc) => doc.folder)))];
  const categories = ["all", ...Array.from(new Set(mockKnowledgeArticles.map((a) => a.category).filter(Boolean)))];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileTypeConfig = (fileType: string) => {
    return fileTypeConfig[fileType] || { icon: File, color: "border-l-gray-500", label: "File" };
  };

  const handleArticleClick = (article: MockKnowledgeArticle) => {
    setSelectedArticle(article);
    setShowArticleDialog(true);
  };

  const handleDocumentClick = (doc: MockDocument) => {
    setSelectedDocument(doc);
    setShowDocumentDialog(true);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto bg-gradient-to-b from-background to-muted/20">
      <DemoBanner />
      
      <div className="py-6 px-8 md:py-8 pb-20 md:pb-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Knowledge Base</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {mockKnowledgeArticles.length} articles · {mockDocuments.length} documents
              </p>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles and documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Recently Updated</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                  <SelectItem value="title">Alphabetical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="articles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="articles" className="gap-2">
              <FileText className="h-4 w-4" />
              Knowledge Articles
              <Badge variant="secondary" className="ml-2">{filteredArticles.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <Folder className="h-4 w-4" />
              Documents
              <Badge variant="secondary" className="ml-2">{filteredDocuments.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            <div className="flex justify-between items-center">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowCreateArticle(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </div>

            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No articles found matching your search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-1">
                {filteredArticles.map((article, idx) => (
                  <Card
                    key={article.id}
                    className={`cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] hover:z-10 animate-fade-in border-l-4 ${
                      article.category ? categoryColors[article.category] : "border-l-gray-500"
                    }`}
                    onClick={() => handleArticleClick(article)}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        {article.priority === "featured" && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shrink-0">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        {article.category && (
                          <Badge variant="secondary" className="text-xs">{article.category}</Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{format(new Date(article.updated_at), "MMM d")}</span>
                        </div>
                        {article.views !== undefined && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{article.views}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-3">
                        {article.content.substring(0, 200)}...
                      </CardDescription>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {article.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {article.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{article.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Folders" />
                </SelectTrigger>
                <SelectContent>
                  {folders.map((folder) => (
                    <SelectItem key={folder} value={folder}>
                      {folder === "all" ? "All Folders" : folder}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowUploadDocument(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            {filteredDocuments.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No documents found matching your search.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
                {filteredDocuments.map((doc, idx) => {
                  const config = getFileTypeConfig(doc.file_type);
                  const IconComponent = config.icon;

                  return (
                    <Card
                      key={doc.id}
                      className={`cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] hover:z-10 animate-fade-in border-l-4 ${config.color} group`}
                      onClick={() => handleDocumentClick(doc)}
                      style={{ animationDelay: `${idx * 30}ms` }}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm truncate">{doc.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-xs">{config.label}</Badge>
                              <span>{formatFileSize(doc.file_size)}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {doc.description && (
                          <CardDescription className="text-xs line-clamp-2">
                            {doc.description}
                          </CardDescription>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            <span>{doc.folder}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{format(new Date(doc.created_at), "MMM d")}</span>
                          </div>
                        </div>
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {doc.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {doc.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{doc.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <Button size="sm" variant="secondary" className="flex-1 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 text-xs">
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <ArticleDetailDialog
        article={selectedArticle}
        open={showArticleDialog}
        onOpenChange={setShowArticleDialog}
      />
      <DocumentPreviewDialog
        document={selectedDocument}
        open={showDocumentDialog}
        onOpenChange={setShowDocumentDialog}
      />
      <CreateArticleDialog
        open={showCreateArticle}
        onOpenChange={setShowCreateArticle}
      />
      <UploadDocumentDialog
        open={showUploadDocument}
        onOpenChange={setShowUploadDocument}
      />
    </div>
  );
}
