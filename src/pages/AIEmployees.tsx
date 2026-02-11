import { useState, useEffect } from "react";
import { PageLayout, PageEmptyState } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreHorizontal,
  MessageSquare,
  Trash2,
  Users,
  Bot,
  Loader2,
  Globe,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { toast } from "sonner";
import { EmployeeChat } from "@/components/ai-employees/EmployeeChat";
import { AgentMarketplace } from "@/components/ai-employees/AgentMarketplace";

export interface AIEmployee {
  id: string;
  org_id: string;
  name: string;
  role: string;
  description: string | null;
  avatar_url: string | null;
  system_prompt: string | null;
  allowed_tools: string[] | null;
  can_delegate_to: string[] | null;
  is_active: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
  source?: "native" | "endpoint";
  developer_name?: string;
}

export default function AIEmployees() {
  const { user } = useAuth();
  const { workspaceId } = useWorkspace();
  const [installedAgents, setInstalledAgents] = useState<AIEmployee[]>([]);
  const [allEndpointAgents, setAllEndpointAgents] = useState<AIEmployee[]>([]);
  const [installedAgentIds, setInstalledAgentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<AIEmployee | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [installingId, setInstallingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchAll();
  }, [user, workspaceId]);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [endpointResult, installationsResult] = await Promise.all([
        supabase
          .from("agent_submissions")
          .select("*, developer_profiles(company_name)")
          .eq("status", "approved")
          .eq("is_public", true)
          .order("created_at", { ascending: false }),
        supabase
          .from("agent_installations")
          .select("agent_id")
          .eq("user_id", user!.id),
      ]);

      const installedIds = new Set<string>(
        (installationsResult.data || []).map((i) => i.agent_id)
      );
      setInstalledAgentIds(installedIds);

      const endpointAgents: AIEmployee[] = (endpointResult.data || []).map((agent) => ({
        id: agent.id,
        org_id: "",
        name: agent.name,
        role: agent.category || "agent",
        description: agent.description,
        avatar_url: agent.icon_url,
        system_prompt: agent.system_prompt,
        allowed_tools: agent.allowed_tools,
        can_delegate_to: null,
        is_active: agent.execution_status === "ready",
        is_template: false,
        created_at: agent.created_at,
        updated_at: agent.updated_at,
        source: "endpoint" as const,
        developer_name: (agent.developer_profiles as any)?.company_name || undefined,
      }));

      setAllEndpointAgents(endpointAgents);
      setInstalledAgents(endpointAgents.filter((a) => installedIds.has(a.id)));
    } catch (error) {
      console.error("Error fetching agents:", error);
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  const installAgent = async (agentId: string) => {
    if (!workspaceId || !user) {
      toast.error("No workspace found. Please set up your workspace first.");
      return;
    }
    try {
      setInstallingId(agentId);
      const { error } = await supabase.from("agent_installations").insert({
        agent_id: agentId,
        workspace_id: workspaceId,
        user_id: user.id,
      });
      if (error) throw error;

      setInstalledAgentIds((prev) => new Set([...prev, agentId]));
      const agent = allEndpointAgents.find((a) => a.id === agentId);
      if (agent) setInstalledAgents((prev) => [...prev, agent]);
      toast.success("Agent installed");
    } catch (error) {
      console.error("Error installing agent:", error);
      toast.error("Failed to install agent");
    } finally {
      setInstallingId(null);
    }
  };

  const uninstallAgent = async (agentId: string) => {
    if (!user) return;
    try {
      setInstallingId(agentId);
      const { error } = await supabase
        .from("agent_installations")
        .delete()
        .eq("agent_id", agentId)
        .eq("user_id", user.id);
      if (error) throw error;

      setInstalledAgentIds((prev) => {
        const next = new Set(prev);
        next.delete(agentId);
        return next;
      });
      setInstalledAgents((prev) => prev.filter((e) => e.id !== agentId));
      toast.success("Agent uninstalled");
    } catch (error) {
      console.error("Error uninstalling agent:", error);
      toast.error("Failed to uninstall agent");
    } finally {
      setInstallingId(null);
    }
  };

  const handleStartChat = (employee: AIEmployee) => {
    setSelectedEmployee(employee);
    setShowChat(true);
  };

  if (!user) {
    return (
      <PageLayout title="AI Employees" icon={Users}>
        <PageEmptyState
          icon={Users}
          title="Sign in to manage AI Employees"
          description="Browse and install specialized AI agents for your workspace."
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout title="AI Employees" icon={Users}>
      <Tabs defaultValue="my-agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="my-agents">My Agents</TabsTrigger>
          <TabsTrigger value="browse" className="gap-1">
            <Download className="h-4 w-4" />
            Browse Agents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-agents">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : installedAgents.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <PageEmptyState
                  icon={Bot}
                  title="No agents installed"
                  description="Browse the marketplace to find and install AI agents for your workspace."
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {installedAgents.map((agent) => (
                <Card key={agent.id} className="transition-all hover:shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={agent.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {agent.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <div className="flex flex-wrap items-center gap-1">
                            <Badge variant="outline" className="gap-1">
                              <Globe className="h-3 w-3" />
                              {agent.role.replace(/_/g, " ")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleStartChat(agent)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => uninstallAgent(agent.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Uninstall
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="line-clamp-2">
                      {agent.description || "No description provided"}
                    </CardDescription>

                    {agent.developer_name && (
                      <p className="text-xs text-muted-foreground">
                        by {agent.developer_name}
                      </p>
                    )}

                    {agent.allowed_tools && agent.allowed_tools.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {agent.allowed_tools.slice(0, 3).map((tool) => (
                          <Badge key={tool} variant="outline" className="text-xs">
                            {tool.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {agent.allowed_tools.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{agent.allowed_tools.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-end pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartChat(agent)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse">
          <AgentMarketplace
            agents={allEndpointAgents}
            installedAgentIds={installedAgentIds}
            installingId={installingId}
            onInstall={installAgent}
            onUninstall={uninstallAgent}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {selectedEmployee && (
        <EmployeeChat
          open={showChat}
          onOpenChange={setShowChat}
          employee={selectedEmployee}
        />
      )}
    </PageLayout>
  );
}
