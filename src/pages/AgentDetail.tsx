import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Download, Shield, Loader2, Sparkles, Calendar } from "lucide-react";
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
import { FreeBadge } from "@/components/FreeBadge";
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  const reviews = getReviewsByAgent(agent.id);
  const ratingDistribution = getRatingDistribution(agent.id);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Sticky Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <Button 
            variant="ghost" 
            className="gap-2 text-sm"
            onClick={() => navigate("/talent-pool")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to AI Talent Pool</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Hero Section */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {agent.agent_categories?.name || agent.category || "Uncategorized"}
                  </Badge>
                  {hasAICapabilities && (
                    <Badge variant="default" className="text-sm gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500">
                      <Sparkles className="h-4 w-4" />
                      AI-Powered
                    </Badge>
                  )}
                  <FreeBadge />
                </div>
              </div>

              <div className="space-y-3 md:space-y-4">
                <h1 className="text-2xl md:text-4xl font-bold">{agent.name}</h1>
                <p className="text-base md:text-xl text-muted-foreground">
                  {agent.description}
                </p>

                {/* Publisher Info */}
                {agent.publisher && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                      {agent.publisher.avatar}
                    </div>
                    <span>{agent.publisher.name}</span>
                    {agent.publisher.verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 md:h-5 md:w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{agent.rating || 0}</span>
                    <span className="text-muted-foreground">({agent.total_reviews || 0})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="text-muted-foreground">{agent.total_installs || 0} installs</span>
                  </div>
                  {agent.lastUpdated && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                      <span className="text-muted-foreground">Updated {new Date(agent.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2 md:pt-4">
                  {isInstalled ? (
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto px-6 md:px-8"
                      onClick={() => navigate("/workspace")}
                    >
                      Open in Workspace
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto px-6 md:px-8"
                      onClick={handleInstall}
                      disabled={installing}
                    >
                      {installing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add to Workspace
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Screenshot Gallery */}
            {agent.screenshots && agent.screenshots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScreenshotGallery screenshots={agent.screenshots} agentName={agent.name} />
                </CardContent>
              </Card>
            )}

            {/* Tabbed Content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
                {agent.changelog && agent.changelog.length > 0 && (
                  <TabsTrigger value="changelog">Changelog</TabsTrigger>
                )}
                <TabsTrigger value="support">Support</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About this agent</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {agent.long_description || agent.description}
                    </p>
                    
                    {hasAICapabilities && (
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
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
                      <div className="pt-4">
                        <h3 className="font-semibold mb-3">Key Features:</h3>
                        <ul className="space-y-2 text-muted-foreground">
                          {agent.capabilities.map((capability: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              </div>
                              <span>{capability}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* OAuth Setup */}
                {isInstalled && agent.is_workflow_based && installationId && requiredCredentials.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Service Connections</CardTitle>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Rating Distribution</CardTitle>
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
                    <Card>
                      <CardContent className="text-center py-8">
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
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Version {version.version}</CardTitle>
                          <Badge variant="secondary">{new Date(version.date).toLocaleDateString()}</Badge>
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
                <Card>
                  <CardHeader>
                    <CardTitle>Get Help</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="font-medium mb-2">📚 Documentation</div>
                      <p className="text-sm text-muted-foreground">
                        Comprehensive guides and API references to help you get started
                      </p>
                    </div>
                    <div>
                      <div className="font-medium mb-2">✉️ Email Support</div>
                      <p className="text-sm text-muted-foreground">
                        Get help from our support team. Response within 24 hours
                      </p>
                    </div>
                    <div>
                      <div className="font-medium mb-2">💬 Community Forum</div>
                      <p className="text-sm text-muted-foreground">
                        Connect with other users and share best practices
                      </p>
                    </div>
                    <div>
                      <div className="font-medium mb-2">🐛 Report Issues</div>
                      <p className="text-sm text-muted-foreground">
                        Found a bug? Let us know and we'll fix it quickly
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Related Agents */}
            {agent.relatedAgentIds && agent.relatedAgentIds.length > 0 && (
              <RelatedAgents 
                relatedAgentIds={agent.relatedAgentIds} 
                currentAgentId={agent.id} 
              />
            )}
          </div>

          {/* Sticky Sidebar */}
          <div className="space-y-4 md:space-y-6 lg:sticky lg:top-24 lg:self-start">
            <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-500" />
                  Free Forever
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 font-bold text-lg px-4 py-2 w-full justify-center">
                    100% FREE
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    This agent is completely free to add to your workspace. No hidden costs, no subscriptions.
                  </p>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleInstall}
                    disabled={installing || isInstalled}
                  >
                    {installing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isInstalled ? "Installed" : "Add to Workspace"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium mb-1">Documentation</div>
                    <p className="text-muted-foreground">Comprehensive guides and API references</p>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Email Support</div>
                    <p className="text-muted-foreground">Response within 24 hours</p>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Community</div>
                    <p className="text-muted-foreground">Active community forum</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border z-40">
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleInstall}
          disabled={installing || isInstalled}
        >
          {installing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isInstalled ? "Open in Workspace" : "Add to Workspace - Free"}
        </Button>
      </div>
    </div>
  );
};

export default AgentDetail;
