import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Download, Shield, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AgentOAuthSetup } from "@/components/AgentOAuthSetup";
import { mockAgents } from "@/data/mockAgents";

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

      // Check if ID is a mock ID (not a valid UUID)
      const isMockId = id.startsWith("mock-");
      
      if (isMockId) {
        // Use mock data directly
        const mockAgent = mockAgents.find(a => a.id === id);
        if (mockAgent) {
          setAgent({
            ...mockAgent,
            agent_categories: { name: mockAgent.category },
            long_description: mockAgent.description,
            capabilities: mockAgent.capabilities || [],
          });
        } else {
          navigate("/");
        }
        setLoading(false);
        return;
      }

      // Try real database for valid UUIDs
      const { data, error } = await supabase
        .from("agents")
        .select(`
          *,
          agent_categories(name)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching agent:", error);
        navigate("/");
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

    // Extract required credentials from workflow
    const credentials = new Set<string>();
    let aiEnabled = false;
    
    if (agent.workflow_json.nodes) {
      agent.workflow_json.nodes.forEach((node: any) => {
        // Check for AI capabilities
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
      // Get user's workspace first
      const { data: workspaceData, error: workspaceError } = await supabase
        .from("workspace_members")
        .select("workspace_id")
        .eq("user_id", user.id)
        .single();

      if (workspaceError || !workspaceData) {
        throw new Error("No workspace found");
      }

      // Install the agent with workspace_id
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

      // Create dedicated chat session for this installation (BLUEPRINT MODEL)
      const { error: chatSessionError } = await supabase
        .from("chat_sessions")
        .insert({
          installation_id: installation.id,
          workspace_id: workspaceData.workspace_id,
          agent_id: id
        });

      if (chatSessionError) throw chatSessionError;

      // Update install count
      await supabase
        .from("agents")
        .update({ total_installs: (agent?.total_installs || 0) + 1 })
        .eq("id", id);

      setIsInstalled(true);
      toast({
        title: "Success!",
        description: "Agent installed successfully. Redirecting to your workspace...",
      });

      // Navigate to workspace after brief delay
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <Button 
            variant="ghost" 
            className="gap-2 text-sm"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Marketplace</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm">
                    {agent.agent_categories?.name || "Uncategorized"}
                  </Badge>
                  {hasAICapabilities && (
                    <Badge variant="default" className="text-sm gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500">
                      <Sparkles className="h-4 w-4" />
                      AI-Powered
                    </Badge>
                  )}
                </div>
              </div>
              <div className="space-y-3 md:space-y-4">
                <h1 className="text-2xl md:text-4xl font-bold">{agent.name}</h1>
                <p className="text-base md:text-xl text-muted-foreground">
                  {agent.description}
                </p>
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
                      Install Agent
                    </Button>
                  )}
                </div>
              </div>
            </div>

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

            {/* OAuth Setup for workflow-based agents */}
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

            {/* Reviews Section - Disabled in Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Reviews available after installation</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 md:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg md:text-xl">Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  <div className="text-2xl md:text-3xl font-bold">${agent.price || 0}/mo</div>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Free to install with flexible pricing
                  </p>
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
    </div>
  );
};

export default AgentDetail;
