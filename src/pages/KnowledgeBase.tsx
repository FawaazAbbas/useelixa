import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileText, Upload, Search, Plus, Tag, FolderOpen } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DemoBanner } from "@/components/DemoBanner";
import { mockKnowledgeArticles, mockDocuments, MockKnowledgeArticle, MockDocument } from "@/data/mockKnowledge";

export default function KnowledgeBase() {
  const [articles] = useState<MockKnowledgeArticle[]>(mockKnowledgeArticles);
  const [documents] = useState<MockDocument[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");

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
    <div className="flex-1 w-full overflow-y-auto bg-gradient-to-b from-background to-muted/20">
      <DemoBanner />
      <div className="py-6 px-4 md:py-8 pb-20 md:pb-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Knowledge Base</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                {articles.length} articles • {documents.length} documents
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Share context all agents can reference
          </p>
        </div>

        {!hasContent && (
          <Card className="mb-6 border-2 border-dashed">
            <CardContent className="py-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-2xl font-semibold mb-2">Build Your Knowledge Library</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Add company info, processes, or guidelines. Every agent will have instant access to stay aligned.
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => toast("Demo Mode", { description: "Feature disabled in demo" })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </Button>
                <Button variant="outline" onClick={() => toast("Demo Mode", { description: "Feature disabled in demo" })}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-4 md:mb-6 shadow-sm">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-0 focus-visible:ring-0"
              />
            </div>
          </CardContent>
        </Card>

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
              <Button onClick={() => toast("Demo Mode", { description: "Feature disabled in demo" })}>
                <Plus className="h-4 w-4 mr-2" />
                New Article
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredArticles.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchQuery ? "No articles match your search" : "No articles yet. Create one to start building your knowledge base!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredArticles.map((article, idx) => (
                  <Card 
                    key={article.id}
                    className="hover:shadow-xl hover:scale-[1.01] transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
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

              <Button onClick={() => toast("Demo Mode", { description: "Feature disabled in demo" })}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <div className="grid gap-4">
              {filteredDocuments.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchQuery ? "No documents match your search" : "No documents yet. Upload files agents can reference!"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredDocuments.map((doc, idx) => (
                  <Card 
                    key={doc.id}
                    className="hover:shadow-xl hover:scale-[1.01] transition-all duration-200 animate-fade-in"
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
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
    </div>
  );
}
