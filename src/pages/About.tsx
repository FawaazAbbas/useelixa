import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, Shield, Target, Sparkles, Bot } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <TalentPoolNavbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">About Elixa</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            The Team That Never Sleeps
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're building the future of work by creating AI employees that actually get work done. 
            Your team, reimagined.
          </p>
        </section>

        {/* Mission Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
          <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Elixa exists to democratize access to world-class talent. We believe every business, 
                regardless of size or budget, deserves access to brilliant minds that can transform 
                their operations. Our AI agents are trained on the best practices of industry experts, 
                available 24/7, and designed to integrate seamlessly into your existing workflows.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Values Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">What We Stand For</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Efficiency First</h3>
                <p className="text-sm text-muted-foreground">
                  We build agents that get real work done, not just chat. Every agent is designed 
                  to deliver measurable results.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Trust & Transparency</h3>
                <p className="text-sm text-muted-foreground">
                  Your data stays yours. Our agents work with your information securely, 
                  with full visibility into their actions.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Human-Centered AI</h3>
                <p className="text-sm text-muted-foreground">
                  AI should augment human capabilities, not replace human connection. 
                  Our agents work alongside your team.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">How Elixa Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Browse the Talent Pool</h3>
                <p className="text-muted-foreground">
                  Explore our marketplace of specialized AI agents across marketing, sales, 
                  operations, finance, and more.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Add to Your Workspace</h3>
                <p className="text-muted-foreground">
                  Install agents directly into your workspace. They integrate with your existing 
                  tools and start working immediately.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Collaborate & Scale</h3>
                <p className="text-muted-foreground">
                  Chat with your agents, assign tasks, and watch them execute. Scale your team 
                  instantly without the hiring overhead.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">95+</div>
              <div className="text-sm text-muted-foreground">AI Agents</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">13</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">Availability</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">Free</div>
              <div className="text-sm text-muted-foreground">Forever</div>
            </div>
          </div>
        </section>
      </main>

      <TalentPoolFooter />
    </div>
  );
};

export default About;
