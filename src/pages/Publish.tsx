import { ArrowLeft, Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Publish = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Marketplace</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-3 md:mb-4">
            <Lock className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Agent Publishing</h1>
          <p className="text-base md:text-xl text-muted-foreground">
            Feature disabled in demo mode
          </p>
        </div>

        <Card className="p-4 md:p-8 border-2 border-dashed">
          <CardHeader className="text-center pb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Create & Share Your Agent</CardTitle>
            <CardDescription className="text-base">
              This feature is disabled in the demo version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="space-y-4 py-6">
              <div className="grid gap-4 max-w-md mx-auto text-left">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Design Your Agent</h3>
                    <p className="text-sm text-muted-foreground">Create a unique AI agent with custom capabilities</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Submit for Review</h3>
                    <p className="text-sm text-muted-foreground">Our team ensures quality and security</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-sm font-semibold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Go Live</h3>
                    <p className="text-sm text-muted-foreground">Publish to thousands of users worldwide</p>
                  </div>
                </div>
              </div>
            </div>

            <Button size="lg" onClick={() => navigate("/marketplace")} className="mt-6">
              Explore Marketplace Instead
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Publish;
