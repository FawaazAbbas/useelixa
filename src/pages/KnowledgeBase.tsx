import { BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const KnowledgeBase = () => {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <header className="border-b bg-card/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Knowledge Base</h1>
        </div>
      </header>

      <main className="flex-1 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">No Documents Yet</CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>Your knowledge base documents will appear here once you start adding them.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default KnowledgeBase;
