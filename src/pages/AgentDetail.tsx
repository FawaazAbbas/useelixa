import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Download, Loader2, Sparkles, Calendar, Bot, Users, Zap, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AgentOAuthSetup } from "@/components/AgentOAuthSetup";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { StarBreakdown } from "@/components/StarBreakdown";
import { ReviewCard } from "@/components/ReviewCard";
import { RelatedAgents } from "@/components/RelatedAgents";
import { mockAgents } from "@/data/mockAgents";
import { getReviewsByAgent, getRatingDistribution } from "@/data/mockReviews";

const AgentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [installing, setInstalling] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installationId, setInstallationId] = useState<string | null>(null);
  const [requiredCredentials, setRequiredCredentials] = useState<string[]>([]);
  const [hasAICapabilities, setHasAICapabilities] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!id) return;

      const isMockId = id.startsWith("mock-");
      
      if (isMockId) {
        const mockAgent = mockAgents.find(a => a.id === id);
        if (mockAgent) {
          setAgent({
            ...mockAgent,
            agent_categories: { name: mockAgent.category },
            long_description: mockAgent.description,
            capabilities: mockAgent.capabilities || [],
          });
        } else {
          navigate("/talent-pool");
        }
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("agents")
        .select(`
          *,
          agent_categories(name)
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching agent:", error);
        navigate("/talent-pool");
      } else {
        setAgent(data);
      }
      setLoading(false);
    };

    fetchAgent();
  }, [id, navigate]);

  useEffect(() => {
    if (!user || !id) return;

    const checkInstallation = async () => {
      const { data } = await supabase
        .from("agent_installations")
        .select("id")
        .eq("agent_id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      setIsInstalled(!!data);
      setInstallationId(data?.id || null);
    };

    checkInstallation();
  }, [user, id]);

  useEffect(() => {
    if (!agent?.workflow_json) return;

    const credentials = new Set<string>();
    let aiEnabled = false;
    
    if (agent.workflow_json.nodes) {
      agent.workflow_json.nodes.forEach((node: any) => {
        if (node.type === 'n8n-nodes-base.openAi') {
          aiEnabled = true;
        }
        
        if (node.credentials) {
          Object.keys(node.credentials).forEach(credType => {
            credentials.add(credType);
          });
        }
      });
    }
    
    setHasAICapabilities(aiEnabled);
    setRequiredCredentials(Array.from(credentials));
  }, [agent]);

  const handleInstall = async () => {
    if (!user) {
      toast({
        title: "Demo Mode",
        description: "Sign up to install agents and use them in your workspace",
      });
      setTimeout(() => navigate("/workspace"), 1000);
      return;
    }

    setInstalling(true);

    try {
      const { data: workspaceData, error: workspaceError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

      if (workspaceError || !workspaceData) {
        throw new Error("No workspace found");
      }

      const { data: installation, error: installError } = await supabase
        .from("agent_installations")
        .insert({
          agent_id: id,
          user_id: user.id,
          workspace_id: workspaceData.workspace_id,
          install_state: {}
        })
        .select()
        .single();

      if (installError) throw installError;

      const { error: chatSessionError } = await supabase
        .from("chat_sessions")
        .insert({
          installation_id: installation.id,
          workspace_id: workspaceData.workspace_id,
          agent_id: id
        });

      if (chatSessionError) throw chatSessionError;

      await supabase
        .from("agents")
        .update({ total_installs: (agent?.total_installs || 0) + 1 })
        .eq("id", id);

      setIsInstalled(true);
      toast({
        title: "Success!",
        description: "Agent installed successfully. Redirecting to your workspace...",
      });

      setTimeout(() => navigate("/workspace"), 1000);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Installation failed",
        description: error.message,
      });
    } finally {
      setInstalling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  const reviews = getReviewsByAgent(agent.id);
  const ratingDistribution = getRatingDistribution(agent.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-0">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <Button 
            variant="ghost" 
            className="gap-2 text-sm hover:bg-muted/50"
            onClick={() => navigate("/talent-pool")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to AI Talent Pool</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
              <CardContent className="relative p-6 md:p-8">
                <div className="space-y-6">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-muted/80 backdrop-blur-sm">
                      {agent.agent_categories?.name || agent.category || "Uncategorized"}
                    </Badge>
                    {hasAICapabilities && (
                      <Badge className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 text-white border-0">
                        <Sparkles className="h-3.5 w-3.5 mr-1" />
                        AI-Powered
                      </Badge>
                    )}
                  </div>

                  {/* Agent Info */}
                  <div className="flex items-start gap-5">
                    <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                      <Bot className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                    </div>
                    <div className="space-y-2 min-w-0">
                      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{agent.name}</h1>
                      <p className="text-muted-foreground leading-relaxed">
                        {agent.short_description || agent.description}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{agent.rating || 0}</span>
                      <span className="text-muted-foreground">({agent.total_reviews || 0})</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                      <Download className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{agent.total_installs || 0} installs</span>
                    </div>
                    {agent.lastUpdated && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Updated {new Date(agent.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex gap-3 pt-2">
                    {isInstalled ? (
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90"
                        onClick={() => navigate("/workspace")}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Open in Workspace
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90"
                        onClick={handleInstall}
                        disabled={installing}
                      >
                        {installing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Zap className="h-4 w-4 mr-2" />
                        )}
                        Add to Workspace
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Screenshot Gallery */}
            {agent.screenshots && agent.screenshots.length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScreenshotGallery screenshots={agent.screenshots} agentName={agent.name} />
                </CardContent>
              </Card>
            )}

            {/* Tabbed Content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-muted/50 backdrop-blur-sm border border-border/50 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-background">Reviews ({reviews.length})</TabsTrigger>
                {agent.changelog && agent.changelog.length > 0 && (
                  <TabsTrigger value="changelog" className="data-[state=active]:bg-background">Changelog</TabsTrigger>
                )}
                <TabsTrigger value="support" className="data-[state=active]:bg-background">Support</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">About this agent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-muted-foreground leading-relaxed">
                      {agent.long_description || agent.description}
                    </p>
                    
                    {hasAICapabilities && (
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-5 w-5 text-purple-500" />
                          <h3 className="font-semibold">AI-Powered Agent</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          This agent uses advanced AI models for intelligent content generation, analysis, and image creation. 
                          No API keys required - AI capabilities work instantly upon installation.
                        </p>
                      </div>
                    )}
                    
                    {agent.capabilities && agent.capabilities.length > 0 && (
                      <div className="pt-2">
                        <h3 className="font-semibold mb-4">Key Features</h3>
                        <div className="grid gap-3">
                          {agent.capabilities.map((capability: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                <Zap className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-sm text-muted-foreground">{capability}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* OAuth Setup */}
                {isInstalled && agent.is_workflow_based && installationId && requiredCredentials.length > 0 && (
                  <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Service Connections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <AgentOAuthSetup
                        agentId={agent.id}
                        installationId={installationId}
                        requiredCredentials={requiredCredentials}
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews" className="space-y-6 mt-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Rating Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StarBreakdown 
                      distribution={ratingDistribution} 
                      totalReviews={reviews.length} 
                    />
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">User Reviews</h3>
                  {reviews.length === 0 ? (
                    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardContent className="text-center py-12">
                        <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">No reviews yet. Be the first to review this agent!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    reviews.map((review) => (
                      <ReviewCard key={review.id} {...review} />
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Changelog Tab */}
              {agent.changelog && agent.changelog.length > 0 && (
                <TabsContent value="changelog" className="space-y-4 mt-6">
                  {agent.changelog.map((version: any, index: number) => (
                    <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Version {version.version}</CardTitle>
                          <Badge variant="secondary" className="bg-muted/80">{new Date(version.date).toLocaleDateString()}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {version.changes.map((change: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              </div>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              )}

              {/* Support Tab */}
              <TabsContent value="support" className="space-y-4 mt-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Get Help</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="font-medium mb-1">Documentation</div>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive guides and API references to help you get started
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="font-medium mb-1">Email Support</div>
                      <p className="text-sm text-muted-foreground">
                        Contact support@elixa.ai for priority assistance
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="font-medium mb-1">Community</div>
                      <p className="text-sm text-muted-foreground">
                        Join our Discord community to connect with other users
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Quick Info</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Category</span>
                      <span className="font-medium">{agent.agent_categories?.name || "General"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{agent.rating || 0}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Installs</span>
                      <span className="font-medium">{agent.total_installs || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  {isInstalled ? (
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => navigate("/workspace")}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Open in Workspace
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={handleInstall}
                      disabled={installing}
                    >
                      {installing ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Zap className="h-4 w-4 mr-2" />
                      )}
                      Add to Workspace
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related Agents */}
            <RelatedAgents 
              currentAgentId={agent.id} 
              relatedAgentIds={agent.relatedAgentIds || []}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDetail;
