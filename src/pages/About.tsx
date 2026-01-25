import { TalentPoolNavbar } from "@/components/TalentPoolNavbar";
import { TalentPoolFooter } from "@/components/TalentPoolFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Zap, Shield, Target, Sparkles, Bot } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <TalentPoolNavbar showSearch={false} />
      
      <main className="pt-28 sm:pt-24 pb-16">
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">About Elixa</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
            Connect Your Tools to AI
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're building the bridge between your favorite apps and AI assistants.
            Connect once, use everywhere.
          </p>
        </section>

        {/* Mission Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16">
          <Card className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Elixa exists to bridge the gap between your everyday tools and AI assistants. 
                We believe in the power of the Model Context Protocol to create seamless, secure 
                connections that let AI work with your data safely. Our platform enables 
                Claude, Cursor, and other MCP-compatible clients to access your tools with 
                enterprise-grade OAuth 2.0 security.
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
                <h3 className="font-semibold mb-2">MCP Native</h3>
                <p className="text-sm text-muted-foreground">
                  Built for the Model Context Protocol standard. Connect your tools once 
                  and use them with any compatible AI client.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">Secure by Design</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade OAuth 2.0 with encrypted credential storage. 
                  Your tokens are never exposed.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">30+ Integrations</h3>
                <p className="text-sm text-muted-foreground">
                  Connect Gmail, Shopify, Slack, Notion, Stripe, and many more. 
                  New integrations added regularly.
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
                <h3 className="font-semibold mb-1">Connect Your Tools</h3>
                <p className="text-muted-foreground">
                  Link your Gmail, Shopify, Calendar, Slack, and 30+ other services 
                  using secure OAuth 2.0 authentication.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Generate MCP Token</h3>
                <p className="text-muted-foreground">
                  Get a secure API token to authenticate your AI clients. 
                  Works with Claude Desktop, Cursor, and any MCP-compatible tool.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Use with Any AI</h3>
                <p className="text-muted-foreground">
                  Your AI assistant can now access your tools directly. Read emails, 
                  manage calendar, check orders, and more—all through natural conversation.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <TalentPoolFooter />
    </div>
  );
};

export default About;
