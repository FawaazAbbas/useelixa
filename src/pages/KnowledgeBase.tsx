import { useState } from "react";
import { DemoBanner } from "@/components/DemoBanner";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockKnowledgeArticles, mockDocuments, MockKnowledgeArticle, MockDocument } from "@/data/mockKnowledge";
import { BookOpen, Search, FileText, Upload, Plus, Eye, Calendar, Folder, Download, Table, Presentation, File, Star, Clock, FolderOpen, Tag } from "lucide-react";
import { SidebarActionButton } from "@/components/SidebarActionButton";
import { format } from "date-fns";
import { ArticleDetailDialog } from "@/components/ArticleDetailDialog";
import { DocumentPreviewDialog } from "@/components/DocumentPreviewDialog";
import { CreateArticleDialog } from "@/components/CreateArticleDialog";
import { UploadDocumentDialog } from "@/components/UploadDocumentDialog";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  "Marketing": "border-l-red-500",
  "Product & Merchandising": "border-l-purple-500",
  "Customer Service": "border-l-orange-500",
  "Finance": "border-l-yellow-500",
  "Development": "border-l-cyan-500",
  "Creative": "border-l-pink-500",
  "Legal & Risk": "border-l-blue-500",
  "Culture": "border-l-emerald-500",
  "Company Policies": "border-l-slate-500",
  "Sales": "border-l-green-500",
  "Product": "border-l-violet-500",
  "Customer Support": "border-l-amber-500",
  "Engineering": "border-l-sky-500",
  "HR": "border-l-rose-500",
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
  const [view, setView] = useState<"articles" | "documents">("articles");

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

  const folders = Array.from(new Set(mockDocuments.map((doc) => doc.folder)));
  const categories = Array.from(new Set(mockKnowledgeArticles.map((a) => a.category).filter(Boolean))) as string[];

  // Stats
  const stats = {
    totalArticles: mockKnowledgeArticles.length,
    totalDocuments: mockDocuments.length,
    featured: mockKnowledgeArticles.filter(a => a.priority === "featured").length,
  };

  // Category counts
  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = mockKnowledgeArticles.filter(a => a.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  // Folder counts
  const folderCounts = folders.reduce((acc, folder) => {
    acc[folder] = mockDocuments.filter(d => d.folder === folder).length;
    return acc;
  }, {} as Record<string, number>);

  // Recent articles (last 5)
  const recentArticles = [...mockKnowledgeArticles]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 4);

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

  // Article Card Component
  const ArticleCard = ({ article, idx }: { article: MockKnowledgeArticle; idx: number }) => (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] hover:z-10 animate-fade-in border-l-4",
        article.category ? categoryColors[article.category] || "border-l-gray-500" : "border-l-gray-500"
      )}
      onClick={() => handleArticleClick(article)}
      style={{ animationDelay: `${idx * 30}ms` }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4 mb-1">
          <CardTitle className="text-base leading-tight">{article.title}</CardTitle>
          {article.priority === "featured" && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shrink-0 text-[10px] px-1.5">
              <Star className="h-2.5 w-2.5 mr-0.5" />
              Featured
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {article.category && (
            <Badge variant="secondary" className="text-[10px] px-1.5">{article.category}</Badge>
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
      <CardContent className="pt-0">
        <CardDescription className="line-clamp-2 text-xs">
          {article.content.substring(0, 150)}...
        </CardDescription>
        <div className="flex flex-wrap gap-1 mt-2">
          {article.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-[10px] px-1">
              {tag}
            </Badge>
          ))}
          {article.tags.length > 3 && (
            <Badge variant="outline" className="text-[10px] px-1">
              +{article.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Document Card Component
  const DocumentCard = ({ doc, idx }: { doc: MockDocument; idx: number }) => {
    const config = getFileTypeConfig(doc.file_type);
    const IconComponent = config.icon;

    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-xl hover:scale-[1.01] hover:z-10 animate-fade-in border-l-4 group",
          config.color
        )}
        onClick={() => handleDocumentClick(doc)}
        style={{ animationDelay: `${idx * 30}ms` }}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg shrink-0">
              <IconComponent className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm truncate">{doc.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-[10px] px-1">{config.label}</Badge>
                <span>{formatFileSize(doc.file_size)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {doc.description && (
            <CardDescription className="text-[11px] line-clamp-2">
              {doc.description}
            </CardDescription>
          )}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1">
              <Folder className="h-3 w-3" />
              <span>{doc.folder}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(doc.created_at), "MMM d")}</span>
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <Button size="sm" variant="secondary" className="flex-1 text-[10px] h-7">
              <Eye className="h-3 w-3 mr-1" />
              Preview
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-[10px] h-7">
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full min-w-0 bg-gradient-to-b from-background to-muted/20">
      <div className="hidden md:block"><DemoBanner /></div>
      
      {/* Top Navigation Bar */}
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-2xl hidden sm:inline">Knowledge Base</span>
          </div>

          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-0.5">
            <Button
              variant={view === "articles" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("articles")}
              className="h-7 px-2.5 gap-1"
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Articles</span>
              <Badge variant="outline" className="ml-1 text-[10px] px-1 h-4">{stats.totalArticles}</Badge>
            </Button>
            <Button
              variant={view === "documents" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setView("documents")}
              className="h-7 px-2.5 gap-1"
            >
              <Folder className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Documents</span>
              <Badge variant="outline" className="ml-1 text-[10px] px-1 h-4">{stats.totalDocuments}</Badge>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r bg-card/50 backdrop-blur-sm shrink-0">
          <div className="p-4">
            <SidebarActionButton 
              onClick={() => view === "articles" ? setShowCreateArticle(true) : setShowUploadDocument(true)}
              icon={view === "articles" ? Plus : Upload}
            >
              {view === "articles" ? "New Article" : "Upload Document"}
            </SidebarActionButton>
          </div>

          <ScrollArea className="flex-1 w-full">
            <div className="py-3 pl-3 pr-4 w-full max-w-full overflow-hidden">
              {view === "articles" ? (
                <>
                  {/* Category Filters */}
                  <div>
                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                      <Tag className="h-3 w-3 shrink-0" />
                      Categories
                    </h3>
                    <div className="space-y-0.5 w-full">
                      <button
                        className={cn(
                          "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                          categoryFilter === "all" 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setCategoryFilter("all")}
                      >
                        <span className="truncate flex-1 text-left">All</span>
                        <span className={cn(
                          "text-[10px] tabular-nums shrink-0 ml-2",
                          categoryFilter === "all" ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {stats.totalArticles}
                        </span>
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          className={cn(
                            "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                            categoryFilter === cat 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
                        >
                          <span className="truncate flex-1 text-left min-w-0">{cat}</span>
                          <span className={cn(
                            "text-[10px] tabular-nums shrink-0 ml-2",
                            categoryFilter === cat ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            {categoryCounts[cat]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Folder Filters */}
                  <div>
                    <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                      <FolderOpen className="h-3 w-3 shrink-0" />
                      Folders
                    </h3>
                    <div className="space-y-0.5 w-full">
                      <button
                        className={cn(
                          "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                          selectedFolder === "all" 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted/50"
                        )}
                        onClick={() => setSelectedFolder("all")}
                      >
                        <span className="truncate flex-1 text-left">All</span>
                        <span className={cn(
                          "text-[10px] tabular-nums shrink-0 ml-2",
                          selectedFolder === "all" ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {stats.totalDocuments}
                        </span>
                      </button>
                      {folders.map((folder) => (
                        <button
                          key={folder}
                          className={cn(
                            "w-full max-w-full flex items-center justify-between h-8 px-2 rounded-md text-xs transition-colors overflow-hidden",
                            selectedFolder === folder 
                              ? "bg-primary text-primary-foreground" 
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => setSelectedFolder(selectedFolder === folder ? "all" : folder)}
                        >
                          <span className="truncate flex-1 text-left min-w-0">{folder}</span>
                          <span className={cn(
                            "text-[10px] tabular-nums shrink-0 ml-2",
                            selectedFolder === folder ? "text-primary-foreground/80" : "text-muted-foreground"
                          )}>
                            {folderCounts[folder]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b bg-card/30">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={view === "articles" ? "Search articles..." : "Search documents..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
          </div>

          {/* Mobile Filters */}
          <div className="md:hidden p-3 border-b flex gap-2 overflow-x-auto">
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 h-8 text-xs"
              onClick={() => view === "articles" ? setShowCreateArticle(true) : setShowUploadDocument(true)}
            >
              {view === "articles" ? <Plus className="h-3 w-3 mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
              {view === "articles" ? "New Article" : "Upload"}
            </Button>
            {view === "articles" ? (
              categories.slice(0, 4).map((cat) => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? "secondary" : "outline"}
                  size="sm"
                  className="shrink-0 h-8 text-xs"
                  onClick={() => setCategoryFilter(categoryFilter === cat ? "all" : cat)}
                >
                  {cat}
                </Button>
              ))
            ) : (
              folders.slice(0, 4).map((folder) => (
                <Button
                  key={folder}
                  variant={selectedFolder === folder ? "secondary" : "outline"}
                  size="sm"
                  className="shrink-0 h-8 text-xs"
                  onClick={() => setSelectedFolder(selectedFolder === folder ? "all" : folder)}
                >
                  {folder}
                </Button>
              ))
            )}
          </div>

          {/* Content Grid */}
          <ScrollArea className="flex-1">
            <div className="p-4">
              {view === "articles" ? (
                filteredArticles.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No articles found matching your search.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredArticles.map((article, idx) => (
                      <ArticleCard key={article.id} article={article} idx={idx} />
                    ))}
                  </div>
                )
              ) : (
                filteredDocuments.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No documents found matching your search.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredDocuments.map((doc, idx) => (
                      <DocumentCard key={doc.id} doc={doc} idx={idx} />
                    ))}
                  </div>
                )
              )}
            </div>
          </ScrollArea>
        </main>
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
