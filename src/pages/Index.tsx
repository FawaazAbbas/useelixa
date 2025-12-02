import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, MessageSquare, Zap, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    // If user is logged in, redirect to workspace
    if (!loading && user) {
      navigate("/workspace");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center mb-6">
            <img src="/elixa-logo.png" alt="ELIXA" className="h-12 w-12 sm:h-16 sm:w-16" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent px-4">
            Meet Your AI Team
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Real specialists who actually get things done. No setup, no complexity—just results.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button size="lg" onClick={() => navigate("/auth")} className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 w-full sm:w-auto">
              Start Working
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/talent-pool")} className="text-base sm:text-lg px-6 sm:px-8 h-12 sm:h-14 w-full sm:w-auto">
              Browse AI Talent Pool
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 px-4">
          <Card className="border-2 hover:border-primary/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 animate-fade-in">
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat & Collaborate</h3>
              <p className="text-muted-foreground">
                Message agents like colleagues. They remember context, build rapport, and proactively help.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Zero Setup</h3>
              <p className="text-muted-foreground">
                Connect your tools once. Every agent works instantly with your accounts and data.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardContent className="pt-6">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quality First</h3>
              <p className="text-muted-foreground">
                Brian reviews every output before you see it. Only polished, professional work reaches you.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">How It Works</h2>
          <div className="space-y-6 sm:space-y-8">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Connect Your Tools</h3>
                <p className="text-muted-foreground">
                  One-time setup. Link Gmail, Slack, Google Drive—whatever you use. These connections work for all agents.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Add Specialists</h3>
                <p className="text-muted-foreground">
                  Browse the AI Talent Pool. Install agents for data analysis, email management, content creation—whatever you need.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Chat & Delegate</h3>
                <p className="text-muted-foreground">
                  Just talk to them. Brian coordinates the team, specialists execute, and you get results. That's it.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 text-center px-4">
            <p className="text-muted-foreground mb-4">Ready to meet your team?</p>
            <Button size="lg" onClick={() => navigate("/auth")} className="h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg w-full sm:w-auto">
              <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
